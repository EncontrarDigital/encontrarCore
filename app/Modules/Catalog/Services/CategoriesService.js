
    'use strict'
    const Database = use("Database");
    const CategoriesRepository = use("App/Modules/Catalog/Repositories/CategoriesRepository");

    class CategoriesService{
        
    constructor(){}

    async findAllCategoriess(filters) {
      const search = filters.input("search");
      const options = {
        page: filters.input("page") || 1,
        perPage: filters.input("perPage") || 10,
        orderBy: filters.input("orderBy") || "id",
        typeOrderBy: filters.input("typeOrderBy") || "DESC",
        searchBy: ["name", "description"],
        default: filters.input("default") || false,
        isPaginate: true
      };
  
      let query = new CategoriesRepository()
        .findAll(search, options) 
        .where(function () {
          if (options.default) {
            this.whereNull("parentCategoryId");
          }
        })//.where('is_deleted', 0)
      return query.paginate(options.page, options.perPage || 10);
    }

    async buildCategoriesTree(filters) {
      const selectColumn =
      `categories.id, categories.name, categories.description, categories.slug, categories."parentCategoryId"`;
      const search = filters.input("search");

      const options = {
        searchBy: ["name", "description"],
        isPaginate: false
      };

      const categoriesResult = await new CategoriesRepository()
        .findAll(search, options, selectColumn)
        .where((query) => {
        }).fetch();

        const categories = categoriesResult.toJSON();

      return this.buildTree(categories);
    }

    buildTree(categories) {
      const map = {};
      const roots = [];

      // Criar map e adicionar children
      categories.forEach(category => {
        map[category.id] = {
          ...category,
          children: []
        };
      });

      // Relacionar pais e filhos
      categories.forEach(category => {
        if (category.parentCategoryId) {
          const parent = map[category.parentCategoryId];
          if (parent) {
            parent.children.push(map[category.id]);
          }
        } else {
          roots.push(map[category.id]);
        }
      });

      return roots;
    }


    /**
     *
     * @param {*} Payload
     * @returns
     */
    async createdCategoriess(ModelPayload, UserId) {
      return await new CategoriesRepository().create({
        ...ModelPayload,
        user_id: UserId,
      });
    }


    /**
     *
     * @param {*} Id
     * @returns
     */
    async findCategoriesById(Id) {
      return await new CategoriesRepository().findById(Id)
        //.where('is_deleted', 0)
        .first();
    }

    /**
     *
     * @param {*} Payload
     * @param {*} Id
     * @returns
     */
    async updatedCategories(Id, ModelPayload) {
      return await new CategoriesRepository().update(Id, ModelPayload);
    }

    /**
     * @author "caniggiamoreira@gmail.com"
     * @deprecated "Elimina os dados de forma temporariamente."
     * @param {*} Id
     * @returns
     */
    async deleteTemporarilyCategories(Id) {
      return await new CategoriesRepository().delete(Id);
    }

    /**
     * @author "caniggiamoreira@gmail.com"
     * @deprecated "Elimina os dados de definitivamente."
     * @param {*} Id
     * @returns
    */
    async deleteDefinitiveCategories(Id) {
      return await new CategoriesRepository().deleteDefinitive(Id);
    }

    /**
     * @author "caniggiamoreira@gmail.com"
     * @deprecated "Listar Lixeira -  registos eliminados temporariamente."
     * @param {*} Payload
     * @returns
     */
    async findAllCategoriessTrash(filters) {
        const options = {
        ...new CategoriesRepository().setOptions(filters),
        typeOrderBy: "DESC",
        };
        let query = new CategoriesRepository()
        .findTrash(options.search, options)
        .where(function () {})//.where('is_deleted', 1)
        return query.paginate(options.page, options.perPage || 10);
    }

    }
    module.exports = CategoriesService
