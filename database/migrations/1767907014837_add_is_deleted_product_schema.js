'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddIsDeletedProductSchema extends Schema {
  up () {
    this.table('products', (table) => {
      table.boolean('is_deleted').notNullable().defaultTo(false)
    })
  }

  down () {
    this.table('products', (table) => {
      // reverse alternations
    })
  }
}

module.exports = AddIsDeletedProductSchema
