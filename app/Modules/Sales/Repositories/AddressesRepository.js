
    'use strict'
    const BaseStorageRepository = use('App/Repositories/BaseStorageRepository');
    class AddressesRepository extends BaseStorageRepository{
        
    constructor() {
      super("Addresses", "App/Modules/Sales/Models/")
    } 
    
    }    
    module.exports = AddressesRepository
    