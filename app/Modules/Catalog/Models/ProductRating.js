'use strict'

const Model = use('Model')

class ProductRating extends Model {
  static get table() {
    return 'product_ratings'
  }

  // Desabilitar timestamps automáticos do Lucid
  static get createdAtColumn() {
    return 'created'
  }

  static get updatedAtColumn() {
    return 'updated'
  }

  static get dates() {
    return super.dates.concat(['created', 'updated'])
  }

  static get hidden() {
    return []
  }

  // Relacionamento com Product
  product() {
    return this.belongsTo('App/Modules/Catalog/Models/Product', 'productId', 'id')
  }

  // Relacionamento com User
  user() {
    return this.belongsTo('App/Modules/Security/Auth/Models/User', 'userId', 'id')
  }
}

module.exports = ProductRating
