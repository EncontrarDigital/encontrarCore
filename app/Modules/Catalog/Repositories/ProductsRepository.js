
    'use strict'
    const BaseStorageRepository = use('App/Repositories/BaseStorageRepository');
    class ProductsRepository extends BaseStorageRepository{
        
    constructor() {
      super("Product", "App/Modules/Catalog/Models/")
    } 

    findProductsByShopId(ShopId) {
      return this.model.query().where('shopId', ShopId);
    }    
    
    }    
    module.exports = ProductsRepository
    