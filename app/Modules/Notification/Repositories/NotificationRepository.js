
    'use strict'
    const BaseStorageRepository = use('App/Repositories/BaseStorageRepository');
    class NotificationRepository extends BaseStorageRepository{
        
    constructor() {
      super("Notification", "App/Modules/Notification/Models/")
    } 
    
    }    
    module.exports = NotificationRepository
    