
    'use strict'
    const BaseStorageRepository = use('App/Repositories/BaseStorageRepository');
    class ShopOrderRepository extends BaseStorageRepository{
        
    constructor() {
      super("ShopOrder", "App/Modules/Sales/Models/")
    } 
    
    }    
    module.exports = ShopOrderRepository
    