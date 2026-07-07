
    'use strict'
    const Database = use("Database");
    const UsersRepository = use("App/Modules/Authentication/Repositories/UsersRepository");

    class UsersService{
        
    constructor(){}

    async findAllUserss(filters) {
      const options = {
        ...new UsersRepository().setOptions(filters),
        typeOrderBy: "DESC",
      };

      const selectColumn = '"id", "firstName", "lastName", "email", "role", "registered" as created_at';

      let query = new UsersRepository()
        .findAll(options.search, options, selectColumn) 
        .where(function () {})//.where('is_deleted', 0)
      return query.paginate(options.page, options.perPage || 10);
    }
    /**
     *
     * @param {*} Payload
     * @returns
     */
    async createUser(ModelPayload) {
      return await new UsersRepository().create({
        ...ModelPayload
      });  
    }
     
   
    /**
     *
     * @param {*} Id
     * @returns
     */
    async findUsersById(Id) {
      const selectColumn = '"id", "firstName", "lastName", "email", "role", "registered" as created_at, "default_phone", "default_payment", "default_city", "default_address", "profile_photo_url"';
      return await new UsersRepository().findById(Id, selectColumn) 
        //.where('is_deleted', 0)
        .first();
    }

    async findUsersByEmail(Email, role = null, includeDeleted = false) {
      const selectColumn = '"id", "firstName", "lastName", "email", "role", "registered" as created_at, "default_phone", "default_payment", "default_city", "default_address", "password", "is_deleted", "profile_photo_url"';
      return await new UsersRepository().findAll(null, {}, selectColumn) 
       .where(function () {
          if (!includeDeleted) {
            this.where('is_deleted', 0);
          }
          // if (role === 'sales') {
          //   this.where('role', 'sales');
          // }
        })
        .where('email', Email)
        .first();
    }
937512003

    async getClientInfo(Id) {
      return await new UsersRepository().findById(Id) 
        //.where('is_deleted', 0)
        .first();
    }

    /**
     *
     * @param {*} Payload
     * @param {*} Id
     * @returns
     */
    async updatedUsers(Id, ModelPayload) {
      return await new UsersRepository().update(Id, ModelPayload);
    } 
  
    /**
     * @author "caniggiamoreira@gmail.com"
     * @deprecated "Elimina os dados de forma temporariamente."
     * @param {*} Id 
     * @returns 
     */
    async deleteTemporarilyUsers(Id) {
      return await new UsersRepository().delete(Id); 
    }

    /**
     * @author "caniggiamoreira@gmail.com"
     * @deprecated "Elimina os dados de definitivamente."
     * @param {*} Id 
     * @returns 
    */
    async deleteDefinitiveUsers(Id) {
      return await new UsersRepository().deleteDefinitive(Id); 
    }

    /**
     * @author "caniggiamoreira@gmail.com"
     * @deprecated "Listar Lixeira -  registos eliminados temporariamente."
     * @param {*} Payload 
     * @returns 
     */ 
    async findAllUserssTrash(filters) {
        const options = {
        ...new UsersRepository().setOptions(filters),
        typeOrderBy: "DESC",
        };
        let query = new UsersRepository()
        .findTrash(options.search, options) 
        .where(function () {})//.where('is_deleted', 1)
        return query.paginate(options.page, options.perPage || 10);
    }
    
    }
    module.exports = UsersService
    