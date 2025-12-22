
    'use strict'
    const BaseStorageRepository = use('App/Repositories/BaseStorageRepository');
    class ShopOrderItemRepository extends BaseStorageRepository{
        
    constructor() {
      super("ShopOrderItem", "App/Modules/Sales/Models/")
    } 
    
    }    
    module.exports = ShopOrderItemRepository
    