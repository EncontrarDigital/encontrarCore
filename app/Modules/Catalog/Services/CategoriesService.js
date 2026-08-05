
    'use strict'
    const Database = use("Database");
    const CategoriesRepository = use("App/Modules/Catalog/Repositories/CategoriesRepository");
    const LocalFilesService = use("App/Services/LocalFilesService");
    const NotFoundException = use("App/Exceptions/NotFoundException");
    const TranslationHelper = use("App/Helpers/TranslationHelper");

    class CategoriesService{
        
    constructor(){
      this.categoriesRepository = new CategoriesRepository();
      this.localFilesService = new LocalFilesService();
    }

    async findAllCategoriess(filters) {
      const search = filters.input("search");
      const locale = filters.locale || 'pt';
      const version = filters.input("version") || "v1"; // v1 = antigo, v2 = novo
      
      const options = {
        page: filters.input("page") || 1,
        perPage: filters.input("perPage") || 10,
        orderBy: filters.input("orderBy") || "id",
        typeOrderBy: filters.input("typeOrderBy") || "DESC",
        searchBy: ["name", "description"],
        default: filters.input("default") || false,
        isPaginate: true,
        version: version
      };
  
      let query = this.categoriesRepository
        .findAll(search, options)
        .where('category_version', version) // Filtrar por versão
        .where(function () {
          if (options.default) {
            this.whereNull("parentCategoryId");
          }
        })//.where('is_deleted', 0)
      
      const result = await query.paginate(options.page, options.perPage || 10);
      
      // Add iconUrl and translate categories
      // Note: AdonisJS paginate() returns 'rows' not 'data'
      const categories = result.rows || result.data || [];
      
      if (categories && Array.isArray(categories)) {
        const processedCategories = categories.map((cat) => {
          const category = cat.toJSON ? cat.toJSON() : cat;
          
          // Traduzir campos
          const translated = TranslationHelper.translateObject(
            category,
            ['name', 'description'],
            locale
          );
          
          // Limpar campos de tradução
          const cleaned = TranslationHelper.cleanTranslationFields(
            translated,
            ['name', 'description']
          );
          
          return {
            ...cleaned,
            iconUrl: cat.iconUrl || null
          };
        });
        
        // Update result with processed categories
        result.rows = processedCategories;
        // Also set data for compatibility
        result.data = processedCategories;
      }
      
      // Convert to plain object for response
      return {
        total: result.total,
        perPage: result.perPage,
        page: result.page,
        lastPage: result.lastPage,
        data: result.data || result.rows || []
      };
    }

    /**
     * Busca categoria por SEO slug (URLs bonitas)
     * Primeiro tenta por seo_slug, se não encontrar tenta por slug técnico
     */
    async findCategoryBySeoSlug(seoSlug, locale = 'pt', version = 'v1') {
      console.log(`🔍 [CategoriesService] Buscando categoria por seo_slug: "${seoSlug}" (versão: ${version})`);
      
      // Tentar buscar por seo_slug primeiro
      let category = await this.categoriesRepository
        .findBySeoSlug(seoSlug)
        .where('category_version', version)
        .first();
      
      // Se não encontrou, tentar por slug técnico (fallback)
      if (!category) {
        console.log(`⚠️  [CategoriesService] Não encontrou por seo_slug, tentando slug técnico...`);
        category = await this.categoriesRepository
          .findBySlug(seoSlug)
          .where('category_version', version)
          .first();
      }
      
      if (!category) {
        console.log(`❌ [CategoriesService] Categoria não encontrada: "${seoSlug}"`);
        throw new NotFoundException(`Category with seo_slug/slug "${seoSlug}" not found`);
      }
      
      console.log(`✅ [CategoriesService] Categoria encontrada: ID ${category.id}, nome: "${category.name}"`);
      
      const categoryData = category.toJSON ? category.toJSON() : category;
      
      // Traduzir
      const translated = TranslationHelper.translateObject(
        categoryData,
        ['name', 'description'],
        locale
      );
      
      // Limpar campos de tradução
      const cleaned = TranslationHelper.cleanTranslationFields(
        translated,
        ['name', 'description']
      );
      
      return {
        ...cleaned,
        iconUrl: category.iconUrl || null
      };
    }

    async buildCategoriesTree(filters) {
      const locale = filters.locale || 'pt'; // Obter locale do middleware
      const version = filters.input ? filters.input("version") || "v1" : "v1";
      
      const selectColumn =
      `categories.id, categories.name, categories.name_en, categories.description, categories.description_en, categories.slug, categories."parentCategoryId", categories.icon_path, categories.category_version`;
      const search = filters.input ? filters.input("search") : "";

      const options = {
        searchBy: ["name", "description"],
        isPaginate: false
      };

      const categoriesResult = await this.categoriesRepository
        .findAll(search, options, selectColumn)
        .where('category_version', version) // Filtrar por versão
        .where((query) => {
        }).fetch();

        const categories = categoriesResult.toJSON();
        
        // Traduzir categorias
        const translatedCategories = categories.map(cat => {
          const translated = TranslationHelper.translateObject(
            cat,
            ['name', 'description'],
            locale
          );
          return TranslationHelper.cleanTranslationFields(
            translated,
            ['name', 'description']
          );
        });

      return this.buildTree(translatedCategories);
    }

    buildTree(categories) {
      const map = {};
      const roots = [];

      // Criar map e adicionar children
      categories.forEach(category => {
        map[category.id] = {
          ...category,
          iconUrl: category.icon_path ? this.getIconUrl(category.icon_path) : null,
          childCategories: [] // Changed from 'children' to 'childCategories'
        };
      });

      // Relacionar pais e filhos
      categories.forEach(category => {
        if (category.parentCategoryId) {
          const parent = map[category.parentCategoryId];
          if (parent) {
            parent.childCategories.push(map[category.id]); // Changed from 'children' to 'childCategories'
          }
        } else {
          roots.push(map[category.id]);
        }
      });

      return roots;
    }

    /**
     * Get subcategories of a specific category
     * @param {number} parentCategoryId - Parent category ID
     * @param {string} locale - Language code (pt, en)
     * @param {string} version - Category version (v1, v2)
     * @returns {Promise<Array>} Array of subcategories
     */
    async getSubcategories(parentCategoryId, locale = 'pt', version = 'v1') {
      const selectColumn =
        `categories.id, categories.name, categories.name_en, categories.description, categories.description_en, categories.slug, categories."parentCategoryId", categories.icon_path, categories.category_version, categories.v1_category_id`;

      const subcategoriesResult = await this.categoriesRepository
        .findAll('', { isPaginate: false }, selectColumn)
        .where('parentCategoryId', parentCategoryId)
        .where('category_version', version) // Filtrar por versão
        .fetch();

      const subcategories = subcategoriesResult.toJSON();

      return subcategories.map(cat => {
        // Traduzir
        const translated = TranslationHelper.translateObject(
          cat,
          ['name', 'description'],
          locale
        );
        
        // Limpar campos de tradução
        const cleaned = TranslationHelper.cleanTranslationFields(
          translated,
          ['name', 'description']
        );
        
        return {
          ...cleaned,
          iconUrl: cat.icon_path ? this.getIconUrl(cat.icon_path) : null,
          v1CategoryId: cat.v1_category_id || null // Adicionar ID da categoria V1 original
        };
      });
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
