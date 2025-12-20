'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class LogSchema extends Schema {
  up () {
    this.table('logs', (table) => {
      // alter table
      table.text('user_data').after('user')
    })
  }

  down () {
    this.table('logs', (table) => {
      // reverse alternations
    })
  }
}

module.exports = LogSchema
