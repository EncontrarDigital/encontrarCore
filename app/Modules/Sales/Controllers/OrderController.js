
'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */
const OrderService = use('App/Modules/Sales/Services/OrderService')
/**
 * Resourceful controller for interacting with icttrunkouts
 */
class OrderController{
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
    const data = await new OrderService().findAllOrders(filters);
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
    let userId = null;
    
    try {
      // Tenta obter o usuário autenticado, mas não falha se não estiver autenticado
      await auth.check();
      userId = auth.user ? auth.user.id : null;
    } catch (error) {
      // Se não estiver autenticado, userId permanece null
      console.log('Usuário não autenticado, criando pedido como convidado');
    }
    
    try {
      const data = await new OrderService().createdOrders({...ModelPayload}, userId);
      return response.created(data, {message: "Registro efetuado com sucesso"});
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      return response.status(500).json({
        error: 'Erro ao processar o pedido',
        details: error.message
      });
    }
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
    const data = await new OrderService().findOrderById(Id);
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
    const data = await new OrderService().updatedOrder(Id, ModelPayload);
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
    const data = await new OrderService().deleteTemporarilyOrder(Id);
    return response.ok(data, {message: "Registo excluido com sucesso"});
  }
}

module.exports = OrderController
    