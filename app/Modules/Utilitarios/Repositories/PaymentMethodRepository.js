
    'use strict'
    const BaseStorageRepository = use('App/Repositories/BaseStorageRepository');
    class PaymentMethodRepository extends BaseStorageRepository{
        
    constructor() {
      super("PaymentMethod", "App/Modules/Utilitarios/Models/")
    } 
    
    }    
    module.exports = PaymentMethodRepository
    