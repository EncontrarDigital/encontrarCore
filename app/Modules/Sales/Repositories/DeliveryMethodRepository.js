
    'use strict'
    const BaseStorageRepository = use('App/Repositories/BaseStorageRepository');
    class DeliveryMethodRepository extends BaseStorageRepository{
        
    constructor() {
      super("DeliveryMethod", "App/Modules/Sales/Models/")
    } 
    
    }    
    module.exports = DeliveryMethodRepository
    