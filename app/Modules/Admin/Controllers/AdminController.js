
'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */
const ProductsService = use('App/Modules/Catalog/Services/ProductsService')
const ShopService = use('App/Modules/Catalog/Services/ShopService')
const ShopOrderService = use('App/Modules/Sales/Services/ShopOrderService')
const OrderService = use('App/Modules/Sales/Services/OrderService')
const AuthenticatedRepository = use('App/Modules/Security/Auth/Repositories/AuthenticatedRepository')
const User = use('App/Modules/Security/Users/Models/User')


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
    const shop = await new ShopService().findShopByUserId(UserId)
    const shopId = shop.id;

    const data = await new ShopOrderService().getAllOrdersByShop(filters,shopId)
    return response.ok(data);
  }

    async getOrderByShop ({ params, request, response, auth  }) {
    const filters = request;
    const UserId = auth.user.id;
    const OrderId = params.id

    const shop = await new ShopService().findShopByUserId(UserId)
    const shopId = shop.id;

    const data = await new ShopOrderService().getOrderByShop(OrderId, filters,shopId)
    return response.ok(data);
  }


  async findAllOrderByClient ({ request, response, auth  }) {
    const filters = request;
    const UserEmail = auth.user.email;
    const order = await new OrderService().findAllOrderByClient(filters,UserEmail)
    return response.ok(order);
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

    async authenticateAsPartner({ request, response, auth }) {
    const requestAndRole = {
      request,
      role: 'sales'
    }

    const { email } = request.all();

    // Garantir que o utilizador existe
    const user = await User.findBy('email', email);
    if (!user) {
      return response.unauthorized({
        message: 'Credenciais inválidas',
      });
    }

    // Verificar se o utilizador tem a role "sales"
    const role = await user.role;
    if ( role !='sales') {
      return response.forbidden('Credenciais inválidas');
    }

    // Se passou na validação de role, segue o fluxo normal de autenticação
    const data = await new AuthenticatedRepository().authenticate(requestAndRole, auth, response);
    return data;
  }


}

module.exports = AdminController
    