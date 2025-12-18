
    'use strict'
    const BaseStorageRepository = use('App/Repositories/BaseStorageRepository');
    class OrderRepository extends BaseStorageRepository{
        
    constructor() {
      super("Order", "App/Modules/Sales/Models/")
    } 
    
    }    
    module.exports = OrderRepository
    