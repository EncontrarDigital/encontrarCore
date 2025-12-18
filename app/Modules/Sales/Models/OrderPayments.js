'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class OrderPayments extends Model {
  static get table () {
    return 'order_payments'
  }

  static get createdAtColumn() {
    return 'created_at'
  }

  static get updatedAtColumn() {
    return 'updated_at'
  }

  order() {
    return this.belongsTo('App/Modules/Sales/Models/Order', 'id', 'paymentId')
  }
}

module.exports = OrderPayments
