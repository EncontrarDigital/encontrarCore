'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class OrderDeliveries extends Model {
  static get table () {
    return 'order_deliveries'
  }

  static get createdAtColumn() {
    return 'created_at'
  }

  static get updatedAtColumn() {
    return 'updated_at'
  }

  order() {
    return this.belongsTo('App/Modules/Sales/Models/Order', 'id', 'deliveryId')
  }
}

module.exports = OrderDeliveries
