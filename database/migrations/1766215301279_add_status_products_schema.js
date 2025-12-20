'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddStatusProductsSchema extends Schema {
  up () {
    this.table('products', (table) => {
      table.boolean("is_actived").nullable().defaultTo(true);
      table.boolean('is_deleted').notNullable().defaultTo(false)
      // alter table
    })
  }

  down () {
    this.table('products', (table) => {
      // reverse alternations
    })
  }
}

module.exports = AddStatusProductsSchema
