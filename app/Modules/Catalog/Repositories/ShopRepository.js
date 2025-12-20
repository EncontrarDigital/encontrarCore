
    'use strict'
    const BaseStorageRepository = use('App/Repositories/BaseStorageRepository');
    class ShopRepository extends BaseStorageRepository{
        
    constructor() {
      super("Shops", "App/Modules/Catalog/Models/")
    } 

    findShopByUserId(UserId) {
      return this.model.query().where('userId', UserId);
    }    

    }
    module.exports = ShopRepository
    