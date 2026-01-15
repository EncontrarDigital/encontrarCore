
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
    const data = await new CategoriesService().findAllCategoriess(filters);
    return response.ok(data);
  }


  async buildCategoriesTree ({ request, response,  }) {
    const filters = request;
    const data = await new CategoriesService().buildCategoriesTree(filters);
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
