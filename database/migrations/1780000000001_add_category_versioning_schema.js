'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddCategoryVersioningSchema extends Schema {
  up () {
    this.table('categories', (table) => {
      // Campo de versão da categoria (v1 = sistema antigo, v2 = novo sistema)
      table.string('category_version', 10).defaultTo('v1').after('icon_path')
      
      // Flag para marcar categorias antigas que foram migradas
      table.boolean('is_legacy').defaultTo(false).after('category_version')
      
      // Índice para melhorar performance nas queries por versão
      table.index('category_version', 'idx_categories_version')
      
      // Índice composto para queries comuns (versão + parent)
      table.index(['category_version', 'parentCategoryId'], 'idx_categories_version_parent')
    })
  }

  down () {
    this.table('categories', (table) => {
      // Remover índices primeiro
      table.dropIndex('category_version', 'idx_categories_version')
      table.dropIndex(['category_version', 'parentCategoryId'], 'idx_categories_version_parent')
      
      // Remover colunas
      table.dropColumn('category_version')
      table.dropColumn('is_legacy')
    })
  }
}

module.exports = AddCategoryVersioningSchema
