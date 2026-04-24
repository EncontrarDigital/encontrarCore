'use strict'

module.exports = function (ApiRoute, Route) {
  // Buscar avaliações de um produto (público)
  Route.get('/api/products/:id/ratings', 'ProductRatingController.index')
    .namespace('App/Modules/Catalog/Controllers')
  
  // Buscar média de rating (público)
  Route.get('/api/products/:id/ratings/average', 'ProductRatingController.average')
    .namespace('App/Modules/Catalog/Controllers')
  
  // Criar avaliação (autenticado ou anônimo)
  Route.post('/api/products/:id/ratings', 'ProductRatingController.store')
    .namespace('App/Modules/Catalog/Controllers')
  
  // Atualizar avaliação (autenticado)
  Route.put('/api/ratings/:id', 'ProductRatingController.update')
    .middleware(['auth'])
    .namespace('App/Modules/Catalog/Controllers')
  
  // Deletar avaliação (autenticado)
  Route.delete('/api/ratings/:id', 'ProductRatingController.destroy')
    .middleware(['auth'])
    .namespace('App/Modules/Catalog/Controllers')
}
