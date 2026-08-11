
'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */
const CategoriesService = use('App/Modules/Catalog/Services/CategoriesService')
/**
 * Resourceful controller for interacting with icttrunkouts
 */
class CategoriesController{
  /**
   * Show a list of all icttrunkouts.
   * GET icttrunkouts
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response

   */
  async index ({ request, response,  }) {
    const filters = request;
    filters.locale = request.locale || 'pt';
    const data = await new CategoriesService().findAllCategoriess(filters);
    return response.ok(data);
  }


  async buildCategoriesTree ({ request, response,  }) {
    const filters = request;
    filters.locale = request.locale || 'pt';
    const data = await new CategoriesService().buildCategoriesTree(filters);
    return response.ok(data);
  }

  /**
   * Get subcategories of a specific category
   * GET /categories/:id/subcategories
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {Object} ctx.params
   */
  async getSubcategories ({ params, request, response }) {
    const parentCategoryId = params.id;
    const locale = request.locale || 'pt';
    
    // ✨ MUDANÇA: Só passa version se vier explicitamente na query
    // Isso permite que o service busque subcategorias de qualquer versão quando não especificado
    const version = request.input('version'); // Remove default 'v1'
    
    const data = await new CategoriesService().getSubcategories(parentCategoryId, locale, version);
    return response.ok(data);
  }
  /**
   * Create/save a new icttrunkout.
   * POST icttrunkouts
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response, auth }) {
    const ModelPayload = request.all();
    const UserId = auth.user.id;
    const data = await new CategoriesService().createdCategoriess({...ModelPayload}, UserId);
    return response.created(data, {message: "Registo efectuado com sucesso"});
  }

  /**
   * Display a single icttrunkout.
   * GET icttrunkouts/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response

   */
  async show ({ params, response  }) {
    const Id = params.id;
    const data = await new CategoriesService().findCategoriesById(Id);
    return response.ok(data);
  }

  /**
   * Find category by SEO slug (URLs bonitas)
   * GET /categories/slug/:slug
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {Object} ctx.params
   */
  async findBySlug ({ params, request, response }) {
    console.log(`🔍 [CategoriesController] findBySlug called with slug: "${params.slug}"`);
    
    const seoSlug = params.slug;
    const locale = request.locale || 'pt';
    const version = request.input('version', 'v1');
    
    console.log(`🔍 [CategoriesController] Locale: ${locale}, Version: ${version}`);
    
    try {
      const data = await new CategoriesService().findCategoryBySeoSlug(seoSlug, locale, version);
      console.log(`✅ [CategoriesController] Category found: ID ${data.id}, name: "${data.name}"`);
      return response.ok(data);
    } catch (error) {
      console.error(`❌ [CategoriesController] Error finding category: ${error.message}`);
      return response.notFound({ message: error.message });
    }
  }

  /**
   * Update icttrunkout details.
   * PUT or PATCH icttrunkouts/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params, request, response }) {
    const ModelPayload = request.all();
    const Id = params.id;
    const data = await new CategoriesService().updatedCategories(Id, ModelPayload);
    return response.ok(data, {message: "Registo actualizado com sucesso"});
  }

  /**
   * Delete a icttrunkout with id.
   * DELETE icttrunkouts/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params, response }) {
    const Id = params.id;
    const data = await new CategoriesService().deleteTemporarilyCategories(Id);
    return response.ok(data, {message: "Registo excluido com sucesso"});
  }

  /**
   * Upload category icon
   * POST /categories/:id/icon
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {Object} ctx.params
   */
  async uploadIcon ({ params, request, response }) {
    try {
      const categoryId = params.id;
      const file = request.file('icon', {
        types: ['image'],
        size: '5mb'
      });

      if (!file) {
        return response.badRequest({ 
          message: 'No icon file provided' 
        });
      }

      const categoriesService = new CategoriesService();
      const data = await categoriesService.uploadCategoryIcon(categoryId, file);

      return response.ok(data, { message: "Icon uploaded successfully" });
    } catch (error) {
      return response.badRequest({ 
        message: error.message || 'Failed to upload icon' 
      });
    }
  }

  /**
   * Delete category icon
   * DELETE /categories/:id/icon
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {Object} ctx.params
   */
  async deleteIcon ({ params, request, response }) {
    try {
      const categoryId = params.id;
      const categoriesService = new CategoriesService();
      const data = await categoriesService.deleteCategoryIcon(categoryId);

      return response.ok(data, { message: "Icon deleted successfully" });
    } catch (error) {
      return response.badRequest({ 
        message: error.message || 'Failed to delete icon' 
      });
    }
  }
}

module.exports = CategoriesController
