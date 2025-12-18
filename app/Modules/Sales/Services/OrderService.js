
    'use strict'
    const Database = use("Database");
    const OrderRepository = use("App/Modules/Sales/Repositories/OrderRepository");

    class OrderService{
        
    constructor(){}

    async findAllOrders(filters) {
      const options = {
        ...new OrderRepository().setOptions(filters),
        typeOrderBy: "DESC",
      };
  
      let query = new OrderRepository()
        .findAll(options.search, options) 
        .where(function () {})//.where('is_deleted', 0)
      return query.paginate(options.page, options.perPage || 10);
    }
    /**
     *
     * @param {*} Payload
     * @returns
     */
    async createdOrders(ModelPayload, UserId) {
      return await new OrderRepository().create({
        ...ModelPayload,
        user_id: UserId,
      });  
    }
     
   
    /**
     *
     * @param {*} Id
     * @returns
     */
    async findOrderById(Id) {
      return await new OrderRepository().findById(Id) 
        //.where('is_deleted', 0)
        .first();
    }

    /**
     *
     * @param {*} Payload
     * @param {*} Id
     * @returns
     */
    async updatedOrder(Id, ModelPayload) {
      return await new OrderRepository().update(Id, ModelPayload);
    } 
  
    /**
     * @author "caniggiamoreira@gmail.com"
     * @deprecated "Elimina os dados de forma temporariamente."
     * @param {*} Id 
     * @returns 
     */
    async deleteTemporarilyOrder(Id) {
      return await new OrderRepository().delete(Id); 
    }

    /**
     * @author "caniggiamoreira@gmail.com"
     * @deprecated "Elimina os dados de definitivamente."
     * @param {*} Id 
     * @returns 
    */
    async deleteDefinitiveOrder(Id) {
      return await new OrderRepository().deleteDefinitive(Id); 
    }

    /**
     * @author "caniggiamoreira@gmail.com"
     * @deprecated "Listar Lixeira -  registos eliminados temporariamente."
     * @param {*} Payload 
     * @returns 
     */ 
    async findAllOrdersTrash(filters) {
        const options = {
        ...new OrderRepository().setOptions(filters),
        typeOrderBy: "DESC",
        };
        let query = new OrderRepository()
        .findTrash(options.search, options) 
        .where(function () {})//.where('is_deleted', 1)
        return query.paginate(options.page, options.perPage || 10);
    }
    
    }
    module.exports = OrderService
    