
'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */
const PaymentMethodService = use('App/Modules/Utilitarios/Services/PaymentMethodService')
/**
 * Resourceful controller for interacting with icttrunkouts
 */
class PaymentMethodController{
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
    const data = await new PaymentMethodService().findAllPaymentMethods(filters);
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
    const data = await new PaymentMethodService().createdPaymentMethods({...ModelPayload}, UserId);
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
    const data = await new PaymentMethodService().findPaymentMethodById(Id);
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
    const data = await new PaymentMethodService().updatedPaymentMethod(Id, ModelPayload);
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
    const data = await new PaymentMethodService().deleteTemporarilyPaymentMethod(Id);
    return response.ok(data, {message: "Registo excluido com sucesso"});
  }
}

module.exports = PaymentMethodController
    