'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Products extends Model {
  static boot() {
    super.boot();
    this.addTrait("@provider:Auditable");
  }

  shop() {
    return this.belongsTo('App/Modules/Catalog/Models/Shops', 'shopId', 'id')
  }

  /**
   * Relationship with ProductPhotos
   * hasMany(relatedModel, primaryKey, foreignKey)
   */
  photos() {
    return this.hasMany(
      'App/Modules/Catalog/Models/ProductPhoto',
      'id',                // Primary key of Product (products.id)
      'productId'          // Foreign key in ProductPhoto (product_photos.productId)
    )
  }
  
  static get createdAtColumn() {
    return 'created'
  }

  static get updatedAtColumn() {
    return 'updated'
  }

  static get table () {
    return 'products'
  }
}

module.exports = Products
