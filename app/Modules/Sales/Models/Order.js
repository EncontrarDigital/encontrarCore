'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Orders extends Model {
  static boot() {
    super.boot();
    this.addTrait("@provider:Auditable");
  }

  static get table () {
    return 'orders'
  }

  static get createdAtColumn() {
    return 'created'
  }

  static get updatedAtColumn() {
    return 'updated'
  }

  items() {
    return this.hasMany('App/Modules/Sales/Models/OrderItem', 'order_id')
  }
}

module.exports = Orders
