
'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */
const UsersService = use('App/Modules/Authentication/Services/UsersService')
/**
 * Resourceful controller for interacting with icttrunkouts
 */
class UsersController{
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
    const data = await new UsersService().findAllUserss(filters);
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
    const data = await new UsersService().createUser({...ModelPayload});
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
    const data = await new UsersService().findUsersById(Id);
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
    const data = await new UsersService().updatedUsers(Id, ModelPayload);
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
    const data = await new UsersService().deleteTemporarilyUsers(Id);
    return response.ok(data, {message: "Registo excluido com sucesso"});
  }
}

module.exports = UsersController
    