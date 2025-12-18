'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddTimestampsToOrderItemsSchema extends Schema {
  up () {
    this.table('order_items', (table) => {
      // alter table
      table.timestamps()

    })
  }

  down () {
    this.table('order_items', (table) => {
      // reverse alternations
      table.dropTimestamps()

    })
  }
}

module.exports = AddTimestampsToOrderItemsSchema
