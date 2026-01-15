
    'use strict'
    const Database = use("Database");
    const CategoriesRepository = use("App/Modules/Catalog/Repositories/CategoriesRepository");
    const LocalFilesService = use("App/Services/LocalFilesService");
    const NotFoundException = use("App/Exceptions/NotFoundException");

    class CategoriesService{
        
    constructor(){
      this.categoriesRepository = new CategoriesRepository();
      this.localFilesService = new LocalFilesService();
    }

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
  
      let query = this.categoriesRepository
        .findAll(search, options) 
        .where(function () {
          if (options.default) {
            this.whereNull("parentCategoryId");
          }
        })//.where('is_deleted', 0)
      
      const result = await query.paginate(options.page, options.perPage || 10);
      
      // Add iconUrl to each category
      if (result.data && Array.isArray(result.data)) {
        result.data = result.data.map(cat => {
          const category = cat.toJSON ? cat.toJSON() : cat;
          return {
            ...category,
            iconUrl: cat.iconUrl || null
          };
        });
      }
      
      return result;
    }

    async buildCategoriesTree(filters) {
      const selectColumn =
      `categories.id, categories.name, categories.description, categories.slug, categories."parentCategoryId", categories.icon_path`;
      const search = filters.input("search");

      const options = {
        searchBy: ["name", "description"],
        isPaginate: false
      };

      const categoriesResult = await this.categoriesRepository
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
          iconUrl: category.icon_path ? this.getIconUrl(category.icon_path) : null,
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
     * Get public URL for category icon
     * @param {string} iconPath - Path to icon in Supabase
     * @returns {string} Public URL
     */
    getIconUrl(iconPath) {
      if (!iconPath) return null;
      
      const Env = use('Env');
      const supabaseUrl = Env.get('SUPABASE_URL');
      const bucket = Env.get('SUPABASE_BUCKET', 'uploads');
      return `${supabaseUrl}/storage/v1/object/public/${bucket}/${iconPath}`;
    }


    /**
     *
     * @param {*} Payload
     * @returns
     */
    async createdCategoriess(ModelPayload, UserId) {
      return await this.categoriesRepository.create({
        ...ModelPayload,
        user_id: UserId,
      });
    }

    /**
     * Upload category icon
     * @param {number} categoryId - Category ID
     * @param {Object} file - File object from request
     * @returns {Promise<Object>} Updated category with iconUrl
     */
    async uploadCategoryIcon(categoryId, file) {
      // Check if category exists
      const category = await this.categoriesRepository.findById(categoryId).first();

      if (!category) {
        throw new NotFoundException(`Category with id ${categoryId} not found`);
      }

      // Validate file is an image
      if (!file || !file.type || !file.type.startsWith('image/')) {
        throw new Error('Invalid file. Please upload a valid image.');
      }

      try {
        // Save icon to Supabase
        const { path, mimeType } = await this.localFilesService.savePhoto(file);

        // Update category with icon path
        category.icon_path = path;
        await category.save();

        return {
          ...category.toJSON(),
          iconUrl: category.iconUrl
        };
      } catch (error) {
        throw new Error(`Failed to upload category icon: ${error.message}`);
      }
    }

    /**
     * Delete category icon
     * @param {number} categoryId - Category ID
     * @returns {Promise<Object>} Updated category
     */
    async deleteCategoryIcon(categoryId) {
      const category = await this.categoriesRepository.findById(categoryId).first();

      if (!category) {
        throw new NotFoundException(`Category with id ${categoryId} not found`);
      }

      category.icon_path = null;
      await category.save();

      return category.toJSON();
    }


    /**
     *
     * @param {*} Id
     * @returns
     */
    async findCategoriesById(Id) {
      const category = await this.categoriesRepository.findById(Id).first();
      
      if (!category) {
        return null;
      }

      const categoryJson = category.toJSON();
      return {
        ...categoryJson,
        iconUrl: category.iconUrl || null
      };
    }

    /**
     *
     * @param {*} Payload
     * @param {*} Id
     * @returns
     */
    async updatedCategories(Id, ModelPayload) {
      return await this.categoriesRepository.update(Id, ModelPayload);
    }

    /**
     * @author "caniggiamoreira@gmail.com"
     * @deprecated "Elimina os dados de forma temporariamente."
     * @param {*} Id
     * @returns
     */
    async deleteTemporarilyCategories(Id) {
      return await this.categoriesRepository.delete(Id);
    }

    /**
     * @author "caniggiamoreira@gmail.com"
     * @deprecated "Elimina os dados de definitivamente."
     * @param {*} Id
     * @returns
    */
    async deleteDefinitiveCategories(Id) {
      return await this.categoriesRepository.deleteDefinitive(Id);
    }

    /**
     * @author "caniggiamoreira@gmail.com"
     * @deprecated "Listar Lixeira -  registos eliminados temporariamente."
     * @param {*} Payload
     * @returns
     */
    async findAllCategoriessTrash(filters) {
        const options = {
        ...this.categoriesRepository.setOptions(filters),
        typeOrderBy: "DESC",
        };
        let query = this.categoriesRepository
        .findTrash(options.search, options)
        .where(function () {})//.where('is_deleted', 1)
        return query.paginate(options.page, options.perPage || 10);
    }

    }
    module.exports = CategoriesService
