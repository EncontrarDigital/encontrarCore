'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class LogSchema extends Schema {
  up () {
    this.create('logs', (table) => {
      table.increments()
      table.integer('user').unsigned().references('id').inTable('users')
      table.text('user_data').after('user')
      table.string('event',75)
      table.integer('auditable_id')
      table.string('auditable',75)
      table.string('ip')
      table.string('message')
      table.boolean('success')
      table.text('url')
      table.text('old_data')
      table.text('new_data')
      table.boolean('is_deleted').notNullable().defaultTo(false)
      table.timestamps()
    })
  }

  down () {
    this.drop('logs')
  }
}

module.exports = LogSchema
