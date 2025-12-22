'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class ShopOrderItem extends Model {
  static boot() {
    super.boot();
    this.addTrait("@provider:Auditable");
  }

  static get table () {
    return 'shop_order_items'
  }

}

module.exports = ShopOrderItem
