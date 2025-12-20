
'use strict'
  const Database = use("Database");
  const ShopService = use('App/Modules/Catalog/Services/ShopService')
  const OrderService = use('App/Modules/Sales/Services/OrderService')
  const ShopOrderRepository = use("App/Modules/Sales/Repositories/ShopOrderRepository");

    class ShopOrderService{
        
    constructor(){}

    async getAllOrdersByShop(filters, ShopId) {
      const search = filters.input("search");
      const options = {
        page: filters.input("page") || 1,
        perPage: filters.input("perPage") || 10,
        orderBy: filters.input("orderBy") || "id",
        typeOrderBy: filters.input("typeOrderBy") || "DESC",
        status: filters.input("status") || "",
        searchBy: ["name", "description"],
        isPaginate: true
      };
  
      let query = new ShopOrderRepository()
        .findAll(search, options) 
        .where(function () {
          if (options.status) {
            this.where('status', options.status);
          }
        }).where('shop_id', ShopId)
      return query.paginate(options.page, options.perPage || 10);
    }

    /**
     *
     * @param {*} Payload
     * @returns
     */
    async createdShopOrders(ModelPayload, UserId) {
      return await new ShopOrderRepository().create({
        ...ModelPayload,
        user_id: UserId,
      });  
    }

    async acceptOrderByShop(OrderId, UserId) {
      return await this.updateOrderStatus(OrderId, 'accepted', UserId);
    }

    async cancelOrderByShop(OrderId, UserId) {
      return await this.updateOrderStatus(OrderId, 'canceled', UserId);  
    }

    async updateOrderStatus(OrderId, Status, UserId) {
      const NotFoundException = use("App/Exceptions/NotFoundException");
      
      const order = await new OrderService().findOrderById(OrderId);
      if(!order) throw new NotFoundException("Pedido não foi encontrado.");
      
      const shop = await new ShopService().findShopByUserId(UserId);
      if(!shop) throw new NotForbiddenException();

      return await new ShopOrderRepository().update(
        OrderId,
        {
        status: Status,
      });  
    }
     
    /**
     *
     * @param {*} Id
     * @returns
     */
    async findShopOrderById(Id) {
      return await new ShopOrderRepository().findById(Id) 
        //.where('is_deleted', 0)
        .first();
    }

    /**
     *
     * @param {*} Payload
     * @param {*} Id
     * @returns
     */
    async updatedShopOrder(Id, ModelPayload) {
      return await new ShopOrderRepository().update(Id, ModelPayload);
    } 
  
    /**
     * @author "caniggiamoreira@gmail.com"
     * @deprecated "Elimina os dados de forma temporariamente."
     * @param {*} Id 
     * @returns 
     */
    async deleteTemporarilyShopOrder(Id) {
      return await new ShopOrderRepository().delete(Id); 
    }

    /**
     * @author "caniggiamoreira@gmail.com"
     * @deprecated "Elimina os dados de definitivamente."
     * @param {*} Id 
     * @returns 
    */
    async deleteDefinitiveShopOrder(Id) {
      return await new ShopOrderRepository().deleteDefinitive(Id); 
    }

    /**
     * @author "caniggiamoreira@gmail.com"
     * @deprecated "Listar Lixeira -  registos eliminados temporariamente."
     * @param {*} Payload 
     * @returns 
     */ 
    async findAllShopOrdersTrash(filters) {
        const options = {
        ...new ShopOrderRepository().setOptions(filters),
        typeOrderBy: "DESC",
        };
        let query = new ShopOrderRepository()
        .findTrash(options.search, options) 
        .where(function () {})//.where('is_deleted', 1)
        return query.paginate(options.page, options.perPage || 10);
    }
    
    }
    module.exports = ShopOrderService
    