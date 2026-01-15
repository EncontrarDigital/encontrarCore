'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddProptoUsersSchema extends Schema {
  up () {
    this.table('users', (table) => {
      table.string("default_address", 255).nullable().after('password')
      table.string("default_city", 255).nullable().after('password')
      table.string("default_payment", 255).nullable().after('password')
      table.string("default_phone", 255).nullable().after('role')
      // alter table
    })
  }

  down () {
    this.table('users', (table) => {
      // reverse alternations
    })
  }
}

module.exports = AddProptoUsersSchema
