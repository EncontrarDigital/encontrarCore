'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddCoordinatesToAddressesSchema extends Schema {
  up () {
    this.table('addresses', (table) => {
      table.decimal('latitude', 10, 8).nullable().comment('Latitude da zona de entrega')
      table.decimal('longitude', 11, 8).nullable().comment('Longitude da zona de entrega')
      table.integer('radius_km').nullable().defaultTo(5).comment('Raio de cobertura em km')
      table.boolean('is_zone').defaultTo(false).comment('Se é uma zona de entrega com coordenadas')
    })
  }

  down () {
    this.table('addresses', (table) => {
      table.dropColumn('latitude')
      table.dropColumn('longitude')
      table.dropColumn('radius_km')
      table.dropColumn('is_zone')
    })
  }
}

module.exports = AddCoordinatesToAddressesSchema
