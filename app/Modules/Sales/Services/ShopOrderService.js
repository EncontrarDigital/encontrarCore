
'use strict'
  const Database = use("Database");
  const ShopService = use('App/Modules/Catalog/Services/ShopService')
  const OrderService = use('App/Modules/Sales/Services/OrderService')
  const ShopOrderRepository = use("App/Modules/Sales/Repositories/ShopOrderRepository");
  const ShopOrderItemRepository = use("App/Modules/Sales/Repositories/ShopOrderItemRepository");


    class ShopOrderService{
        
    constructor(){}

    async getAllOrdersByShop(filters, ShopId) {
      const selectColumn = `shop_orders.id, shop_orders.order_id, shop_orders.shop_id, shop_orders.status, shop_orders.total_amount, shop_orders.created_at, shop_orders.updated_at, orders."fullName" ,orders."contactEmail", orders."order_number"`;

      const search = filters.input("search");
      const options = {
        page: filters.input("page") || 1,
        perPage: filters.input("perPage") || 10,
        orderBy: filters.input("orderBy") || "shop_orders.id",
        typeOrderBy: filters.input("typeOrderBy") || "DESC",
        status: filters.input("status") || "",
        searchBy: ["status"],
        isPaginate: true
      };  

      let query = new ShopOrderRepository()
        .findAll(search, options, selectColumn) 
        .innerJoin("orders", "orders.id", "shop_orders.order_id")
        .where(function () {
          if (options.status ) {
            if (options.status == 'LOADING') {
              this.where('shop_orders.status', 'accepted');
              } else if(options.status == 'CONFIRMED'){
              this.where('orders.status', 'delivered').orWhere('shop_orders.status', 'confirmed');
              } else {
                this.where('shop_orders.status', 'PENDING');
              }
            }
        }).where('shop_id', ShopId)
        // .whereIn('order_id', Database.select('id').from('orders').where("id", "orders.id"))
      return query.paginate(options.page, options.perPage || 10);
    }

    async getOrderByShop(OrderId, filters, ShopId) {
        const selectColumn =
      `shop_orders.id, shop_orders.order_id, shop_orders.shop_id, shop_orders.status, shop_orders.total_amount, shop_orders.created_at, shop_orders.updated_at, orders."fullName" ,orders."contactEmail", orders."order_number"`;
      const search = filters.input("search");
      const options = {
        page: filters.input("page") || 1,
        perPage: filters.input("perPage") || 10,
        orderBy: filters.input("orderBy") || "shop_orders.id",
        typeOrderBy: filters.input("typeOrderBy") || "DESC",
        status: filters.input("status") || "",
        searchBy: ["status"],
        isPaginate: true
      };  
      
      let query = new ShopOrderRepository()
        .findAll(search, options, selectColumn) 
        .innerJoin("orders", "orders.id", "shop_orders.order_id")
        .where(function () {
          if (options.status ) {
            if (options.status == 'LOADING') {
              this.where('shop_orders.status', 'accepted');
              } else if(options.status == 'CONFIRMED'){
              this.where('shop_orders.status', 'delivered');
              } else {
              this.where('shop_orders.status', options.status);
              }
          }
        }).where('shop_id', ShopId)
        .where('order_id', OrderId)
        // .whereIn('order_id', Database.select('id').from('orders').where("id", OrderId))
        .with('orderItems')
      return query.paginate(options.page, options.perPage || 10);
    }

    /**
     *
     * @param {*} Payload
     * @returns
     */
    async createdShopOrders(ModelPayload) {
      return await new ShopOrderRepository().create({
        ...ModelPayload
      });  
    }

    static async createFromOrderItems (orderId, orderItems) {
    const grouped = this.groupByShop(orderItems)

    for (const shopId in grouped) {
      const items = grouped[shopId]

      const total = items.reduce((sum, i) => {
        return sum + Number(i.price) * Number(i.quantity)
      }, 0)

      const shopOrder = await new ShopOrderRepository().create({
        order_id: orderId,
        shop_id: shopId,
        status: 'PENDING',
        total_amount: total
      })

      await this.attachItems(shopOrder.id, items)
    }
  }

   static groupByShop (items) {
    return items.reduce((acc, item) => {
      acc[item.shopId] = acc[item.shopId] || []
      acc[item.shopId].push(item)
      return acc
    }, {})
  }

  static async attachItems (shopOrderId, items) {
    for (const item of items) {
      await new ShopOrderItemRepository().create({
        shop_order_id: shopOrderId,
        order_item_id: item.id
      })
    }
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

      const shopOrder =  await this.findShopOrderByOrderId(OrderId);
      if(!shopOrder) throw new NotFoundException("Pedido da loja não foi encontrado.");

      return await new ShopOrderRepository().update(
        shopOrder.id,
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

    async findShopOrderByOrderId(OrderId) {
      return await new ShopOrderRepository()
        .findAll() 
        .where('order_id', OrderId).first()
        // .whereIn('order_id', Database.select('id').from('orders').where("id", "orders.id"))
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
    