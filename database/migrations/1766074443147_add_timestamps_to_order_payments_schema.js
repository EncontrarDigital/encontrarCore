'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddTimestampsToOrderPaymentsSchema extends Schema {
  up () {
    this.table('order_payments', (table) => {
      table.timestamps()
    })
  }

  down () {
    this.table('order_payments', (table) => {
      table.dropTimestamps()
    })
  }
}

module.exports = AddTimestampsToOrderPaymentsSchema
