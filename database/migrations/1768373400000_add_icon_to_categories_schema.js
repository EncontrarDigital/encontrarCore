'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddIconToCategoriesSchema extends Schema {
  up() {
    this.table('categories', (table) => {
      table.string('icon_path', 255).nullable().comment('Path to category icon stored in Supabase')
    })
  }

  down() {
    this.table('categories', (table) => {
      table.dropColumn('icon_path')
    })
  }
}

module.exports = AddIconToCategoriesSchema
