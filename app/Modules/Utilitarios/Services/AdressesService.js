
    'use strict'
    const Database = use("Database");
    const AdressesRepository = use("App/Modules/Utilitarios/Repositories/AddressesRepository");

    class AdressesService{
        
    constructor(){}

        
  

       async findAllAdressess(filters) {
      const search = filters.input("search");
      const options = {
        page: filters.input("page") || 1,
        perPage: filters.input("perPage") || 10,
        orderBy: filters.input("orderBy") || "id",
        typeOrderBy: filters.input("typeOrderBy") || "DESC",
        searchBy: ["name", "slug"],
        default: filters.input("default") || false,
        isPaginate: true
      };
  
      let query = new AdressesRepository()
        .findAll(search, options) 
        .where(function () {
          if (options.default) {
            this.whereNull("parentAddressId");
          }
        })//.where('is_deleted', 0)
      return query.paginate(options.page, options.perPage || 10);
    }

    async buildAddressTree(filters) {
      const search = filters.input("search");

      const options = {
        searchBy: ["name", "slug"],
        isPaginate: false
      };

      const addressesResult = await new AdressesRepository()
        .findAll(search, options)
        .where((query) => {
        }).fetch();

        const categories = addressesResult.toJSON();

      return this.buildTree(categories);
    }

    buildTree(addresses) {
      const map = {};
      const roots = [];

      // Criar map e adicionar children
      addresses.forEach(address => {
        map[address.id] = {
          ...address,
          children: []
        };
      });

      // Relacionar pais e filhos
      addresses.forEach(address => {
        if (address.parentAddressId) {
          const parent = map[address.parentAddressId];
          if (parent) {
            parent.children.push(map[address.id]);
          }
        } else {
          roots.push(map[address.id]);
        }
      });

      return roots;
    }
    /**
     *
     * @param {*} Payload
     * @returns
     */
    async createdAdressess(ModelPayload, UserId) {
      return await new AdressesRepository().create({
        ...ModelPayload,
        user_id: UserId,
      });  
    }
     
   
    /**
     *
     * @param {*} Id
     * @returns
     */
    async findAdressesById(Id) {
      return await new AdressesRepository().findById(Id) 
        //.where('is_deleted', 0)
        .first();
    }

    /**
     *
     * @param {*} Payload
     * @param {*} Id
     * @returns
     */
    async updatedAdresses(Id, ModelPayload) {
      return await new AdressesRepository().update(Id, ModelPayload);
    } 
  
    /**
     * @author "caniggiamoreira@gmail.com"
     * @deprecated "Elimina os dados de forma temporariamente."
     * @param {*} Id 
     * @returns 
     */
    async deleteTemporarilyAdresses(Id) {
      return await new AdressesRepository().delete(Id); 
    }

    /**
     * @author "caniggiamoreira@gmail.com"
     * @deprecated "Elimina os dados de definitivamente."
     * @param {*} Id 
     * @returns 
    */
    async deleteDefinitiveAdresses(Id) {
      return await new AdressesRepository().deleteDefinitive(Id); 
    }

    /**
     * @author "caniggiamoreira@gmail.com"
     * @deprecated "Listar Lixeira -  registos eliminados temporariamente."
     * @param {*} Payload 
     * @returns 
     */ 
    async findAllAdressessTrash(filters) {
        const options = {
        ...new AdressesRepository().setOptions(filters),
        typeOrderBy: "DESC",
        };
        let query = new AdressesRepository()
        .findTrash(options.search, options) 
        .where(function () {})//.where('is_deleted', 1)
        return query.paginate(options.page, options.perPage || 10);
    }
    
    }
    module.exports = AdressesService
    