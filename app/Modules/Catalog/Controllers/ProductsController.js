
'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */
const ProductsService = use('App/Modules/Catalog/Services/ProductsService')
/**
 * Resourceful controller for interacting with icttrunkouts
 */
class ProductsController{
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
    const data = await new ProductsService().findAllProductss(filters);
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
    const data = await new ProductsService().createdProduct({...ModelPayload}, UserId);
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
    const data = await new ProductsService().findProductsById(Id);
    return response.ok(data);
  }

  async getProductsByShop ({ request, response, auth  }) {
    const filters = request;
    const UserId = auth.user.id;
    const data = await new ProductsService().getProductsByShop(filters, UserId);
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
    const data = await new ProductsService().updatedProducts(Id, ModelPayload);
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
    const data = await new ProductsService().deleteTemporarilyProducts(Id);
    return response.ok(data, {message: "Registo excluido com sucesso"});
  }
}

module.exports = ProductsController
    