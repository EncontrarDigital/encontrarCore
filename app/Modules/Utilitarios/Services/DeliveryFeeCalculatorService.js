'use strict'

const Database = use('Database')

class DeliveryFeeCalculatorService {
  
  /**
   * Calcula a distância entre dois pontos usando a fórmula de Haversine
   * @param {number} lat1 - Latitude do ponto 1
   * @param {number} lon1 - Longitude do ponto 1
   * @param {number} lat2 - Latitude do ponto 2
   * @param {number} lon2 - Longitude do ponto 2
   * @returns {number} Distância em quilômetros
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371 // Raio da Terra em km
    const dLat = this.toRad(lat2 - lat1)
    const dLon = this.toRad(lon2 - lon1)
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c
    
    return distance
  }
  
  /**
   * Converte graus para radianos
   */
  toRad(degrees) {
    return degrees * (Math.PI / 180)
  }
  
  /**
   * Calcula a taxa de entrega baseada em coordenadas geográficas
   * @param {number} userLat - Latitude do usuário
   * @param {number} userLng - Longitude do usuário
   * @returns {Object} Resultado com taxa, zona, distância e endereço
   */
  async calculateFeeByCoordinates(userLat, userLng) {
    try {
      console.log(`[DELIVERY FEE] Calculando taxa para coordenadas: ${userLat}, ${userLng}`)
      
      // 1. Buscar todas as zonas de entrega com coordenadas
      const zones = await Database
        .select('id', 'name', 'price', 'latitude', 'longitude', 'radius_km')
        .from('addresses')
        .whereNotNull('latitude')
        .whereNotNull('longitude')
        .where('is_zone', true)
      
      console.log(`[DELIVERY FEE] Encontradas ${zones.length} zonas configuradas`)
      
      if (zones.length === 0) {
        // Se não há zonas configuradas, usar taxa padrão
        console.log('[DELIVERY FEE] Nenhuma zona configurada, usando taxa padrão')
        return {
          fee: 1000, // Taxa padrão: 1000 Kz
          zone: 'Zona não mapeada',
          distance: null,
          address: null,
          addressId: null,
          method: 'default'
        }
      }
      
      // 2. Calcular distância para cada zona
      const zonesWithDistance = zones.map(zone => {
        const distance = this.calculateDistance(
          userLat,
          userLng,
          parseFloat(zone.latitude),
          parseFloat(zone.longitude)
        )
        
        return {
          ...zone,
          distance: distance
        }
      })
      
      // 3. Filtrar zonas dentro do raio de cobertura
      const zonesInRange = zonesWithDistance.filter(zone => 
        zone.distance <= (zone.radius_km || 5)
      )
      
      console.log(`[DELIVERY FEE] ${zonesInRange.length} zonas dentro do raio`)
      
      // 4. Se encontrou zona dentro do raio, usar a mais próxima
      if (zonesInRange.length > 0) {
        const nearestZone = zonesInRange.reduce((prev, current) => 
          prev.distance < current.distance ? prev : current
        )
        
        console.log(`[DELIVERY FEE] Zona encontrada: ${nearestZone.name} (${nearestZone.distance.toFixed(2)} km)`)
        
        return {
          fee: Math.round(nearestZone.price),
          zone: nearestZone.name,
          distance: nearestZone.distance.toFixed(2),
          address: nearestZone.name,
          addressId: nearestZone.id,
          method: 'zone_match'
        }
      }
      
      // 5. Se não encontrou zona no raio, usar a mais próxima com taxa ajustada
      const nearestZone = zonesWithDistance.reduce((prev, current) => 
        prev.distance < current.distance ? prev : current
      )
      
      // Taxa base + taxa adicional por km extra
      const extraDistance = nearestZone.distance - (nearestZone.radius_km || 5)
      const extraFee = extraDistance > 0 ? extraDistance * 100 : 0 // 100 Kz por km extra
      const totalFee = Math.round(nearestZone.price + extraFee)
      
      console.log(`[DELIVERY FEE] Fora da zona: ${nearestZone.name} (+${extraDistance.toFixed(2)} km extra)`)
      console.log(`[DELIVERY FEE] Taxa calculada: ${totalFee} Kz (base: ${nearestZone.price} + extra: ${extraFee})`)
      
      return {
        fee: totalFee,
        zone: `${nearestZone.name} (fora da zona)`,
        distance: nearestZone.distance.toFixed(2),
        address: nearestZone.name,
        addressId: nearestZone.id,
        method: 'distance_based',
        extraDistance: extraDistance.toFixed(2),
        extraFee: Math.round(extraFee)
      }
      
    } catch (error) {
      console.error('[DELIVERY FEE] Erro ao calcular taxa:', error)
      
      // Fallback: taxa padrão
      return {
        fee: 1000,
        zone: 'Erro no cálculo',
        distance: null,
        address: null,
        addressId: null,
        method: 'error_fallback',
        error: error.message
      }
    }
  }
  
  /**
   * Obtém endereço aproximado por coordenadas (geocoding reverso)
   * Usa a zona mais próxima como referência
   */
  async getAddressByCoordinates(userLat, userLng) {
    const result = await this.calculateFeeByCoordinates(userLat, userLng)
    return {
      address: result.address || 'Endereço não identificado',
      city: result.zone || 'Luanda',
      ...result
    }
  }
}

module.exports = DeliveryFeeCalculatorService
