'use strict'

const DeliveryFeeCalculatorService = use('App/Modules/Utilitarios/Services/DeliveryFeeCalculatorService')

class DeliveryController {
  
  /**
   * Calcula taxa de entrega por coordenadas geográficas
   * POST /api/delivery/calculate-fee
   * Body: { latitude, longitude }
   * 
   * @example
   * POST /api/delivery/calculate-fee
   * {
   *   "latitude": -8.8383,
   *   "longitude": 13.2344
   * }
   * 
   * Response:
   * {
   *   "success": true,
   *   "data": {
   *     "fee": 1500,
   *     "zone": "Viana",
   *     "distance": "12.5",
   *     "address": "Viana",
   *     "addressId": 5,
   *     "method": "zone_match"
   *   }
   * }
   */
  async calculateFee({ request, response }) {
    try {
      const { latitude, longitude } = request.only(['latitude', 'longitude'])
      
      // Validação de campos obrigatórios
      if (!latitude || !longitude) {
        return response.status(400).json({
          success: false,
          error: 'Latitude e longitude são obrigatórios',
          message: 'Por favor, forneça as coordenadas geográficas'
        })
      }
      
      // Converter para número e validar
      const lat = parseFloat(latitude)
      const lng = parseFloat(longitude)
      
      if (isNaN(lat) || isNaN(lng)) {
        return response.status(400).json({
          success: false,
          error: 'Coordenadas inválidas',
          message: 'Latitude e longitude devem ser números válidos'
        })
      }
      
      // Validar range geográfico
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return response.status(400).json({
          success: false,
          error: 'Coordenadas fora do range',
          message: 'Latitude deve estar entre -90 e 90, longitude entre -180 e 180'
        })
      }
      
      // Calcular taxa de entrega
      const service = new DeliveryFeeCalculatorService()
      const result = await service.calculateFeeByCoordinates(lat, lng)
      
      return response.json({
        success: true,
        data: result
      })
      
    } catch (error) {
      console.error('[DELIVERY CONTROLLER] Erro ao calcular taxa:', error)
      
      return response.status(500).json({
        success: false,
        error: 'Erro ao calcular taxa de entrega',
        message: error.message
      })
    }
  }
  
  /**
   * Obtém endereço aproximado por coordenadas (geocoding reverso)
   * GET /api/delivery/address-by-coordinates?lat=X&lng=Y
   * 
   * @example
   * GET /api/delivery/address-by-coordinates?lat=-8.8383&lng=13.2344
   * 
   * Response:
   * {
   *   "success": true,
   *   "data": {
   *     "address": "Viana",
   *     "city": "Viana",
   *     "fee": 1500,
   *     "zone": "Viana",
   *     "distance": "12.5"
   *   }
   * }
   */
  async getAddressByCoordinates({ request, response }) {
    try {
      const { lat, lng } = request.get()
      
      if (!lat || !lng) {
        return response.status(400).json({
          success: false,
          error: 'Parâmetros obrigatórios ausentes',
          message: 'lat e lng são obrigatórios'
        })
      }
      
      const latitude = parseFloat(lat)
      const longitude = parseFloat(lng)
      
      if (isNaN(latitude) || isNaN(longitude)) {
        return response.status(400).json({
          success: false,
          error: 'Coordenadas inválidas',
          message: 'lat e lng devem ser números válidos'
        })
      }
      
      const service = new DeliveryFeeCalculatorService()
      const result = await service.getAddressByCoordinates(latitude, longitude)
      
      return response.json({
        success: true,
        data: result
      })
      
    } catch (error) {
      console.error('[DELIVERY CONTROLLER] Erro ao obter endereço:', error)
      
      return response.status(500).json({
        success: false,
        error: 'Erro ao obter endereço',
        message: error.message
      })
    }
  }
}

module.exports = DeliveryController
