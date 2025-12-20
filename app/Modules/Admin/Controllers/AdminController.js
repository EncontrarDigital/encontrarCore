
'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */
const ProductsService = use('App/Modules/Catalog/Services/ProductsService')
const ShopService = use('App/Modules/Catalog/Services/ShopService')
const ShopOrderService = use('App/Modules/Sales/Services/ShopOrderService')

/**
 * Resourceful controller for interacting with icttrunkouts
 */
class AdminController{
 
  async getProductsByShop ({ request, response, auth  }) {
    const filters = request;
    const UserId = auth.user.id;
    const shop = await new ShopService().findShopByUserId(UserId)
    const shopId = shop.id;
    const data = await new ProductsService().getProductsByShop(filters, shopId);
    return response.ok(data);
  }

  async getShopInfo ({ response, auth  }) {
    const UserId = auth.user.id;
    const shop = await new ShopService().findShopByUserId(UserId)
    return response.ok(shop);
  }

  async getAllOrdersByShop ({ request, response, auth  }) {
    const filters = request;
    const UserId = auth.user.id;
    const shop = await new ShopOrderService().getAllOrdersByShop(filters,UserId)
    return response.ok(shop);
  }

  async acceptOrderByShop ({ params, response, auth }) {
    const UserId = auth.user.id;
    const OrderId = params.id
    const data = await new ShopOrderService().acceptOrderByShop(OrderId, UserId);
    return response.created(data, {message: "Pedido Aceite com sucesso"});
  }

  async cancelOrderByShop ({ params, response, auth }) {
    const UserId = auth.user.id;
    const OrderId = params.id
    const data = await new ShopOrderService().cancelOrderByShop(OrderId, UserId);
    return response.created(data, {message: "Pedido Cancelado com sucesso"});
  }


}

module.exports = AdminController
    