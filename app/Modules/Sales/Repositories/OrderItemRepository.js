
    'use strict'
    const BaseStorageRepository = use('App/Repositories/BaseStorageRepository');
    class OrderItemRepository extends BaseStorageRepository{
        
    constructor() {
      super("OrderItem", "App/Modules/Sales/Models/")
    } 
    
    }    
    module.exports = OrderItemRepository
    