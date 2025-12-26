
    'use strict'
    const Database = use("Database");
    const NotificationRepository = use("App/Modules/Notification/Repositories/NotificationRepository");

    class NotificationService{
        
    constructor(){}

    async findAllNotifications(filters) {
      const search = filters.input("search");
      const options = {
        page: filters.input("page") || 1,
        perPage: filters.input("perPage") || 10,
        orderBy: filters.input("orderBy") || "id",
        typeOrderBy: filters.input("typeOrderBy") || "DESC",
        searchBy: ["message"],
        isPaginate: true
      };
  
      let query = new NotificationRepository()
        .findAll(search, options) 
        .where(function () {})//.where('is_deleted', 0)
      return query.paginate(options.page, options.perPage || 10);
    }

    /**
     *
     * @param {*} Payload
     * @returns
     */
    async createdNotifications(ModelPayload, UserId) {
      return await new NotificationRepository().create({
        ...ModelPayload,
        user_id: UserId,
      });  
    }
     
   
    /**
     *
     * @param {*} Id
     * @returns
     */
    // async findNotificationById(Id) {
    //   return await new NotificationRepository().findById(Id) 
    //     //.where('is_deleted', 0)
    //     .first();
    // }

    async findNotificationById(filters, Id) {
      return await this.findNotificationBy(filters, 'id', Id);
    }

    async findNotificationByUserId(filters, UserId) {
      return await this.findNotificationBy(filters, 'userId', UserId);
    }

    async findNotificationBy(filters, Column, Value) {
      const search = filters.input("search");
      const options = {
        page: filters.input("page") || 1,
        perPage: filters.input("perPage") || 10,
        orderBy: filters.input("orderBy") || "id",
        typeOrderBy: filters.input("typeOrderBy") || "DESC",
        isRead: filters.input("isRead") || 'false',
        searchBy: ["message"],
        isPaginate: true
      };
  
      let query = new NotificationRepository()
        .findAll(search, options) 
        .where(function () {
          if (options.isRead == 'true') {
            this.where('isRead', 'true');
          }
        })
        .where(Column, Value)
        //.where('is_deleted', 0)
      return query.first();
    }

    /**
     *
     * @param {*} Payload
     * @param {*} Id
     * @returns
     */
    async updatedNotification(Id, ModelPayload) {
      return await new NotificationRepository().update(Id, ModelPayload);
    } 
  
    /**
     * @author "caniggiamoreira@gmail.com"
     * @deprecated "Elimina os dados de forma temporariamente."
     * @param {*} Id 
     * @returns 
     */
    async deleteTemporarilyNotification(Id) {
      return await new NotificationRepository().delete(Id); 
    }

    /**
     * @author "caniggiamoreira@gmail.com"
     * @deprecated "Elimina os dados de definitivamente."
     * @param {*} Id 
     * @returns 
    */
    async deleteDefinitiveNotification(Id) {
      return await new NotificationRepository().deleteDefinitive(Id); 
    }

    /**
     * @author "caniggiamoreira@gmail.com"
     * @deprecated "Listar Lixeira -  registos eliminados temporariamente."
     * @param {*} Payload 
     * @returns 
     */ 
    async findAllNotificationsTrash(filters) {
        const options = {
        ...new NotificationRepository().setOptions(filters),
        typeOrderBy: "DESC",
        };
        let query = new NotificationRepository()
        .findTrash(options.search, options) 
        .where(function () {})//.where('is_deleted', 1)
        return query.paginate(options.page, options.perPage || 10);
    }
    
    }
    module.exports = NotificationService
    