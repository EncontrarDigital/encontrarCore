'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddSeoSlugToCategoriesSchema extends Schema {
  up () {
    this.table('categories', (table) => {
      // Adicionar coluna seo_slug para URLs SEO-friendly
      table.string('seo_slug', 255).nullable().after('slug')
      
      // Índice para buscas rápidas por seo_slug
      table.index('seo_slug', 'idx_categories_seo_slug')
    })
  }

  down () {
    this.table('categories', (table) => {
      table.dropIndex('seo_slug', 'idx_categories_seo_slug')
      table.dropColumn('seo_slug')
    })
  }
}

module.exports = AddSeoSlugToCategoriesSchema
