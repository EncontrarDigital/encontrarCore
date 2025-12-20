
    'use strict'
    const Database = use("Database");
    const ProductsRepository = use("App/Modules/Catalog/Repositories/ProductsRepository");
    const ShopService = use('App/Modules/Catalog/Services/ShopService')

    class ProductsService{
        
    constructor(){}

    async findAllProductss(filters) {
      const search = filters.input("search");
      const options = {
        page: filters.input("page") || 1,
        perPage: filters.input("perPage") || 10,
        orderBy: filters.input("orderBy") || "id",
        typeOrderBy: filters.input("typeOrderBy") || "DESC",
        searchBy: ["name", "description"],
        isPaginate: true
      };
  
      let query = new ProductsRepository()
        .findAll(search, options) 
        .where(function () {}).where('is_deleted', 0)
      return query.paginate(options.page, options.perPage || 10);
    }
    /**
     *
     * @param {*} Payload
     * @returns
     */
    async createdProductss(ModelPayload, UserId) {
      return await new ProductsRepository().create({
        ...ModelPayload,
        user_id: UserId,
      });  
    }
     
   
    /**
     *
     * @param {*} Id
     * @returns
     */
    async findProductsById(Id) {
      return await new ProductsRepository().findById(Id) 
        //.where('is_deleted', 0)
        .first();
    }

    async getProductsByShop(filters, UserId) {
      const shop = await new ShopService().findShopByUserId(UserId)
      const shopId = shop.id;

      const search = filters.input("search");
      const options = {
        page: filters.input("page") || 1,
        perPage: filters.input("perPage") || 10,
        orderBy: filters.input("orderBy") || "id",
        typeOrderBy: filters.input("typeOrderBy") || "DESC",
        searchBy: ["name", "description"],
        isPaginate: true
      };
  
      let query = new ProductsRepository()
        .findAll(search, options) 
        .where(function () {})
        .where('shopId', shopId)
        .where('is_deleted', 0)
      return query.paginate(options.page, options.perPage || 10);
    }

    /**
     *
     * @param {*} Payload
     * @param {*} Id
     * @returns
     */
    async updatedProducts(Id, ModelPayload) {
      return await new ProductsRepository().update(Id, ModelPayload);
    } 
  
    /**
     * @author "caniggiamoreira@gmail.com"
     * @deprecated "Elimina os dados de forma temporariamente."
     * @param {*} Id 
     * @returns 
     */
    async deleteTemporarilyProducts(Id) {
      return await new ProductsRepository().delete(Id); 
    }

    /**
     * @author "caniggiamoreira@gmail.com"
     * @deprecated "Elimina os dados de definitivamente."
     * @param {*} Id 
     * @returns 
    */
    async deleteDefinitiveProducts(Id) {
      return await new ProductsRepository().deleteDefinitive(Id); 
    }

    /**
     * @author "caniggiamoreira@gmail.com"
     * @deprecated "Listar Lixeira -  registos eliminados temporariamente."
     * @param {*} Payload 
     * @returns 
     */ 
    async findAllProductssTrash(filters) {
        const options = {
        ...new ProductsRepository().setOptions(filters),
        typeOrderBy: "DESC",
        };
        let query = new ProductsRepository()
        .findTrash(options.search, options) 
        .where(function () {}).where('is_deleted', 1)
        return query.paginate(options.page, options.perPage || 10);
    }
    
    }
    module.exports = ProductsService
    