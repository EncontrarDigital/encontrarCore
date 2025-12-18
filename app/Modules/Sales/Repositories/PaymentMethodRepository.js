
    'use strict'
    const BaseStorageRepository = use('App/Repositories/BaseStorageRepository');
    class PaymentMethodRepository extends BaseStorageRepository{
        
    constructor() {
      super("PaymentMethod", "App/Modules/Sales/Models/")
    } 
    
    }    
    module.exports = PaymentMethodRepository
    