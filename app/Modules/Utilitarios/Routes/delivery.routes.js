'use strict'

/**
 * Rotas para cálculo de taxa de entrega e geocoding
 */
module.exports = function (ApiRoute, Route) {
  // Calcular taxa de entrega por coordenadas
  // POST /api/delivery/calculate-fee
  // Body: { latitude, longitude }
  Route.post('/api/delivery/calculate-fee', 'DeliveryController.calculateFee')
    .namespace('App/Modules/Utilitarios/Controllers')
  
  // Obter endereço por coordenadas (geocoding reverso)
  // GET /api/delivery/address-by-coordinates?lat=X&lng=Y
  Route.get('/api/delivery/address-by-coordinates', 'DeliveryController.getAddressByCoordinates')
    .namespace('App/Modules/Utilitarios/Controllers')
}
