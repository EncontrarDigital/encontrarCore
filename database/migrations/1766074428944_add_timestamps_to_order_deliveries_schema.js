'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddTimestampsToOrderDeliveriesSchema extends Schema {
  up () {
    this.table('order_deliveries', (table) => {
      table.timestamps()
    })
  }

  down () {
    this.table('order_deliveries', (table) => {
    })
  }
}

module.exports = AddTimestampsToOrderDeliveriesSchema
