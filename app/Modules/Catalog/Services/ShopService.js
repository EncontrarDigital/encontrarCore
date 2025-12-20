
    'use strict'
    const Database = use("Database");
    const ShopRepository = use("App/Modules/Catalog/Repositories/ShopRepository");

    class ShopService{
        
    constructor(){}

    async findAllShops(filters) {
      const options = {
        ...new ShopRepository().setOptions(filters),
        typeOrderBy: "DESC"
      };
  
      let query = new ShopRepository()
        .findAll(options.search, options)
      return query.paginate(options.page, options.perPage || 10);
    }
    /**
     *
     * @param {*} Payload
     * @returns
     */
    async createdShops(ModelPayload, UserId) {
      return await new ShopRepository().create({
        ...ModelPayload,
        user_id: UserId,
      });  
    }
     
   
    /**
     *
     * @param {*} Id
     * @returns
     */
    async findShopById(Id) {
      const data = await new ShopRepository()
        .findById(Id, '*', ['products'])
        .first();
        return await data
    }

    async findShopByUserId(UserId) {
      const data = await new ShopRepository()
        .findShopByUserId(UserId, '*', ['products'])
        .first();
        return await data
    }

    /**
     *
     * @param {*} Payload
     * @param {*} Id
     * @returns
     */
    async updatedShop(Id, ModelPayload) {
      return await new ShopRepository().update(Id, ModelPayload);
    } 
  
    /**
     * @author "caniggiamoreira@gmail.com"
     * @deprecated "Elimina os dados de forma temporariamente."
     * @param {*} Id 
     * @returns 
     */
    async deleteTemporarilyShop(Id) {
      return await new ShopRepository().delete(Id); 
    }

    /**
     * @author "caniggiamoreira@gmail.com"
     * @deprecated "Elimina os dados de definitivamente."
     * @param {*} Id 
     * @returns 
    */
    async deleteDefinitiveShop(Id) {
      return await new ShopRepository().deleteDefinitive(Id); 
    }

    /**
     * @author "caniggiamoreira@gmail.com"
     * @deprecated "Listar Lixeira -  registos eliminados temporariamente."
     * @param {*} Payload 
     * @returns 
     */ 
    async findAllShopsTrash(filters) {
        const options = {
        ...new ShopRepository().setOptions(filters),
        typeOrderBy: "DESC",
        };
        let query = new ShopRepository()
        .findTrash(options.search, options) 
        .where(function () {})
        .with('products')
        //.where('is_deleted', 1)
        return query.paginate(options.page, options.perPage || 10);
    }
    
    }
    module.exports = ShopService
    