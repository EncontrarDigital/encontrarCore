'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ResetPasswordsSchema extends Schema {
  up () {
    this.create('reset_passwords', (table) => {
      table.increments()
      table.string('token', 255).notNullable()
      table.string('email', 254).notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('reset_passwords')
  }
}

module.exports = ResetPasswordsSchema
