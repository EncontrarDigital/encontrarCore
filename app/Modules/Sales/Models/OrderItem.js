'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class OrderItems extends Model {
  static boot() {
    super.boot();
    this.addTrait("@provider:Auditable");
  }

  static get table () {
    return 'order_items'
  }

  // static get createdAtColumn() {
  //   return 'created'
  // }

  // static get updatedAtColumn() {
  //   return 'updated'
  // }

  order() {
    return this.belongsTo('App/Modules/Sales/Models/Order', 'order_id')
  }

  product() {
    return this.belongsTo('App/Modules/Catalog/Models/Product', 'product_id')
  }
}

module.exports = OrderItems
