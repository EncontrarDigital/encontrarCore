
    'use strict'
    const BaseStorageRepository = use('App/Repositories/BaseStorageRepository');
    class SettingRepository extends BaseStorageRepository{

    constructor() {
      super('Setting',"App/Modules/Utilitarios/Models/")
    }

    }
    module.exports = SettingRepository
