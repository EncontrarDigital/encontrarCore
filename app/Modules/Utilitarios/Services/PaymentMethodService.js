
    'use strict'
    const Database = use("Database");
    const PaymentMethodRepository = use("App/Modules/Utilitarios/Repositories/PaymentMethodRepository");

    class PaymentMethodService{
        
    constructor(){}

    async findAllPaymentMethods(filters) {
      const options = {
        ...new PaymentMethodRepository().setOptions(filters),
        typeOrderBy: "DESC",
      };
  
      let query = new PaymentMethodRepository()
        .findAll(options.search, options) 
        .where(function () {})//.where('is_deleted', 0)
      return query.paginate(options.page, options.perPage || 10);
    }
    /**
     *
     * @param {*} Payload
     * @returns
     */
    async createdPaymentMethods(ModelPayload, UserId) {
      return await new PaymentMethodRepository().create({
        ...ModelPayload,
        user_id: UserId,
      });  
    }
     
   
    /**
     *
     * @param {*} Id
     * @returns
     */
    async findPaymentMethodById(Id) {
      return await new PaymentMethodRepository().findById(Id) 
        //.where('is_deleted', 0)
        .first();
    }

    /**
     *
     * @param {*} Payload
     * @param {*} Id
     * @returns
     */
    async updatedPaymentMethod(Id, ModelPayload) {
      return await new PaymentMethodRepository().update(Id, ModelPayload);
    } 
  
    /**
     * @author "caniggiamoreira@gmail.com"
     * @deprecated "Elimina os dados de forma temporariamente."
     * @param {*} Id 
     * @returns 
     */
    async deleteTemporarilyPaymentMethod(Id) {
      return await new PaymentMethodRepository().delete(Id); 
    }

    /**
     * @author "caniggiamoreira@gmail.com"
     * @deprecated "Elimina os dados de definitivamente."
     * @param {*} Id 
     * @returns 
    */
    async deleteDefinitivePaymentMethod(Id) {
      return await new PaymentMethodRepository().deleteDefinitive(Id); 
    }

    /**
     * @author "caniggiamoreira@gmail.com"
     * @deprecated "Listar Lixeira -  registos eliminados temporariamente."
     * @param {*} Payload 
     * @returns 
     */ 
    async findAllPaymentMethodsTrash(filters) {
        const options = {
        ...new PaymentMethodRepository().setOptions(filters),
        typeOrderBy: "DESC",
        };
        let query = new PaymentMethodRepository()
        .findTrash(options.search, options) 
        .where(function () {})//.where('is_deleted', 1)
        return query.paginate(options.page, options.perPage || 10);
    }
    
    }
    module.exports = PaymentMethodService
    