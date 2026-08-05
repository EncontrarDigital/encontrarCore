'use strict'
const BaseStorageRepository = use('App/Repositories/BaseStorageRepository');

class CategoriesRepository extends BaseStorageRepository {
    
  constructor() {
    super("Categories", "App/Modules/Catalog/Models/")
  }

  /**
   * Busca categoria por SEO slug (URLs bonitas)
   * @param {string} seoSlug - Slug SEO-friendly (ex: "eletrodomesticos")
   * @returns {QueryBuilder}
   */
  findBySeoSlug(seoSlug) {
    return this.model.query().where('seo_slug', seoSlug);
  }

  /**
   * Busca categoria por slug técnico
   * @param {string} slug - Slug técnico (ex: "electronics")
   * @returns {QueryBuilder}
   */
  findBySlug(slug) {
    return this.model.query().where('slug', slug);
  }
    
}    

module.exports = CategoriesRepository
