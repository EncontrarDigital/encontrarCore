
    'use strict'
    const BaseStorageRepository = use('App/Repositories/BaseStorageRepository');
    class AddressesRepository extends BaseStorageRepository{
        
    constructor() {
      super("Addresses", "App/Modules/Utilitarios/Models/")
    } 
    
    }    
    module.exports = AddressesRepository
    