
    'use strict'
    const Database = use("Database");
    const ProductsRepository = use("App/Modules/Catalog/Repositories/ProductsRepository");
    const ShopService = use('App/Modules/Catalog/Services/ShopService')
    const TranslationHelper = use('App/Helpers/TranslationHelper')

    class ProductsService{
        
    constructor(){}

    async findAllProductss(filters) {
      const search = filters.input("search");
      const locale = filters.locale || 'pt';
      
      const options = {
        page: filters.input("page") || 1,
        perPage: filters.input("perPage") || 6,
        orderBy: filters.input("orderBy") || "id",
        typeOrderBy: filters.input("typeOrderBy") || "DESC",
        searchBy: ["name", "description"],
        isPaginate: true,
        withRalationships: ["photos"],
        isVisible: filters.input("isVisible") !== undefined ? filters.input("isVisible") : true
      };
      
      let query = new ProductsRepository()
      .findAll(search, options) 
      .where(function () {
        if (options.isVisible) {
          this.where('visible', true)
        }
      })
      .where('is_deleted', 0)
      .with('photos')
      
      const result = await query.paginate(options.page, options.perPage || 10);
      
      // AdonisJS pode usar 'rows' ou 'data' dependendo da versão
      const products = result.rows || result.data || [];
      
      // Apply translations to products
      if (products && products.length > 0) {
        const translatedProducts = products.map(product => {
          const productJson = product.toJSON ? product.toJSON() : product;
          
          return {
            ...productJson,
            name: TranslationHelper.translateField(productJson, 'name', locale),
            description: TranslationHelper.translateField(productJson, 'description', locale)
          };
        });
        
        // Update both rows and data for compatibility
        result.rows = translatedProducts;
        result.data = translatedProducts;
      }
      
      // ✅ FIX: Garantir que campos de paginação sempre existam (compatibilidade com apps mobile/partner)
      // AdonisJS Lucid retorna paginação em result.pages quando usa paginate()
      const paginationData = result.pages || result;
      
      return {
        rows: result.rows || result.data || [],
        data: result.data || result.rows || [],
        page: paginationData.page ?? parseInt(options.page),
        perPage: paginationData.perPage ?? parseInt(options.perPage),
        total: paginationData.total ? parseInt(paginationData.total) : 0,
        lastPage: paginationData.lastPage ?? 1
      };
    }
    
    async getProductsByCategory(filters, CategoryId) {
      const search = filters.input("search");
      const locale = filters.locale || 'pt';
      
      const options = {
        page: filters.input("page") || 1,
        perPage: filters.input("perPage") || 6,
        orderBy: filters.input("orderBy") || "id",
        typeOrderBy: filters.input("typeOrderBy") || "DESC",
        searchBy: ["name", "description"],
        withRalationships: ["photos"],
        isPaginate: true,
        isVisible: filters.input("isVisible") !== undefined ? filters.input("isVisible") : true
      };
       // Verificar se é categoria V2 com v1_category_id
      const categoryInfo = await Database.table('categories')
        .where('id', CategoryId)
        .first();
      
      let targetCategoryIds = [CategoryId];
      
      if (categoryInfo) {
        // Se for V2 e tiver v1_category_id, buscar produtos na categoria V1 e suas subcategorias
        if (categoryInfo.category_version === 'v2' && categoryInfo.v1_category_id) {
          console.log(`✅ [ProductsService.getProductsByCategory] V2 category found, will search in V1 category: ${categoryInfo.v1_category_id}`);
          
          // Buscar todas as subcategorias V1
          const v1Subcategories = await Database.table('categories')
            .where('parentCategoryId', categoryInfo.v1_category_id)
            .where('category_version', 'v1')
            .select('id');
          
          // Incluir a categoria pai V1 + todas as subcategorias V1
          targetCategoryIds = [
            categoryInfo.v1_category_id,
            ...v1Subcategories.map(cat => cat.id)
          ];
          
          console.log(`🎯 [ProductsService.getProductsByCategory] Searching in V1 category + subcategories: [${targetCategoryIds.join(', ')}]`);
        } else {
          // Para qualquer categoria (V1 ou V2), incluir suas subcategorias
          const subcategories = await Database.table('categories')
            .where('parentCategoryId', CategoryId)
            .select('id');
          
          if (subcategories.length > 0) {
            targetCategoryIds = [
              CategoryId,
              ...subcategories.map(cat => cat.id)
            ];
            console.log(`🎯 [ProductsService.getProductsByCategory] Including subcategories: [${targetCategoryIds.join(', ')}]`);
          }
        }
      }
      
      console.log(`🎯 [ProductsService.getProductsByCategory] Final target categories:`, targetCategoryIds);
      
      // Use DISTINCT para evitar duplicatas causadas pelo innerJoin
      let query = new ProductsRepository()
      .findAll(search, options) 
      .distinct('products.*')  // ← FIX: DISTINCT para evitar duplicatas
      .innerJoin('categories_products_products', 'categories_products_products.productsId', 'products.id')
      .where(function () {
        this.whereIn('categories_products_products.categoriesId', targetCategoryIds)
        this.where('products.is_deleted', 0)
        if (options.isVisible) {
          this.where('products.visible', true)
        }
      })
      .with('photos')
      
      // 🔍 DEBUG - Ver SQL gerada
      console.log('🔍 [SQL QUERY] CategoryId:', CategoryId, 'Generated SQL:', query.toSQL ? query.toSQL() : 'N/A');
      
      console.log('🔍 [BEFORE PAGINATE] CategoryId:', CategoryId, 'Page:', options.page, 'PerPage:', options.perPage);
      
      const result = await query.paginate(options.page, options.perPage || 10);
      
      // AdonisJS pode usar 'rows' ou 'data'
      const products = result.rows || result.data || [];
         
      // Apply translations to products - PADRÃO FAQ
      if (products && products.length > 0) {
        
        const translatedProducts = products.map(product => {
          const productJson = product.toJSON ? product.toJSON() : product;
          
          const translated = {
            ...productJson,
            name: TranslationHelper.translateField(productJson, 'name', locale),
            description: TranslationHelper.translateField(productJson, 'description', locale)
          };
          
          return translated;
        });
        
        result.rows = translatedProducts;
        result.data = translatedProducts;
        
      } else {
        console.log('⚠️ [NO PRODUCTS] No products to translate for CategoryId:', CategoryId);
      }
      
      // ✅ FIX: Garantir que campos de paginação sempre existam (compatibilidade com apps mobile/partner)
      // AdonisJS Lucid retorna paginação em result.pages quando usa paginate()
      const paginationData = result.pages || result;
      
      const finalResult = {
        rows: result.rows || result.data || [],
        data: result.data || result.rows || [],
        page: paginationData.page ?? parseInt(options.page),
        perPage: paginationData.perPage ?? parseInt(options.perPage),
        total: paginationData.total ? parseInt(paginationData.total) : 0,
        lastPage: paginationData.lastPage ?? 1
      };
      
      console.log('🔍 [FINAL RESULT] Returning:', JSON.stringify({
        page: finalResult.page,
        perPage: finalResult.perPage,
        total: finalResult.total,
        lastPage: finalResult.lastPage,
        dataCount: finalResult.data?.length || finalResult.rows?.length || 0,
        hasData: !!(finalResult.data?.length),
        hasRows: !!(finalResult.rows?.length)
      }, null, 2));
      
      return finalResult;
    }
    /**
     *
     * @param {*} Payload
     * @returns
    */
   async createdProduct(ModelPayload, UserId) {
     const shop = await new ShopService().findShopByUserId(UserId)
     const ShopId = shop.id;
     const purchasePrice = ModelPayload.purchasePrice;
     const price = Math.round(ModelPayload.price) || await this.calculatePrice(purchasePrice)
     
     // Tratar description vazia - converter para string com valor padrão
     const description = ModelPayload.description && ModelPayload.description.trim() !== '' 
       ? ModelPayload.description 
       : '-';
     
     return await new ProductsRepository().create({
       ...ModelPayload,
       description: description,
       price: price,
       shopId: ShopId,
      });  
    }
    
    async calculatePrice(purchasePrice, profitMargin = 0) {
      const comissao = await Database.table('settings').where('name', 'Comissão').first();
      if (comissao) {
        profitMargin = comissao.value;
      }
      return purchasePrice + Math.round((purchasePrice * (profitMargin / 100)));
    }
    
    
    /**
     *
     * @param {*} Id
     * @returns
    */
   async findProductsById(Id) {
     const product = await new ProductsRepository().findById(Id) 
     .with('photos')
     //.where('is_deleted', 0)
     .first();
     
     // Note: For single product, we don't have access to request headers here
     // Translation should be handled at controller level if needed
     // Or we can add a locale parameter
     return product;
    }

    async getProductsByShop(filters, ShopId) {

      const search = filters.input("search");
      const locale = filters.locale || 'pt';
      const options = {
        page: filters.input("page") || 1,
        perPage: filters.input("perPage") || 10,
        orderBy: filters.input("orderBy") || "id",
        typeOrderBy: filters.input("typeOrderBy") || "DESC",
        searchBy: ["name", "description"],
        isPaginate: true,
        withRalationships: ["photos"],
        isVisible: filters.input("isVisible") !== undefined ? filters.input("isVisible") : true
      };
  
      let query = new ProductsRepository()
        .findAll(search, options) 
        .where(function () {
          this.where('shopId', ShopId)
          this.where('is_deleted', 0)
          if (options.isVisible) {
            this.where('visible', true)
          }
        })
        .with('photos')
      
      const result = await query.paginate(options.page, options.perPage || 10);
      
      // AdonisJS pode usar 'rows' ou 'data'
      const products = result.rows || result.data || [];
      
      // Apply translations to products - PADRÃO FAQ
      if (products && products.length > 0) {
        const translatedProducts = products.map(product => {
          const productJson = product.toJSON ? product.toJSON() : product;
          return {
            ...productJson,
            name: TranslationHelper.translateField(productJson, 'name', locale),
            description: TranslationHelper.translateField(productJson, 'description', locale)
          };
        });
        
        result.rows = translatedProducts;
        result.data = translatedProducts;
      }
      
      return result;
    }

    async getProductsByCategorySlug(filters, slug) {
      const selectColumn = `products.*`
      const search = filters.input("search");
      const locale = filters.locale || 'pt';
      const options = {
        page: filters.input("page") || 1,
        perPage: filters.input("perPage") || 10,
        orderBy: filters.input("orderBy") || "products.id",
        typeOrderBy: filters.input("typeOrderBy") || "DESC",
        searchBy: ["name", "description"],
        withRalationships: ["photos"],
        isPaginate: true,
        isVisible: filters.input("isVisible") !== undefined ? filters.input("isVisible") : true
      };
      
      // Use DISTINCT para evitar duplicatas causadas pelo innerJoin
      let query = new ProductsRepository()
        .findAll(search, options, selectColumn)
        .distinct('products.*')  // ← FIX: DISTINCT para evitar duplicatas 
        .innerJoin('categories_products_products', 'categories_products_products.productsId', 'products.id')
        .innerJoin('categories', 'categories.id', 'categories_products_products.categoriesId')
        .where(function () {
          this.where('categories.slug', slug)
          this.where('products.is_deleted', 0)
          if (options.isVisible) {
            this.where('products.visible', true)
          }
        })
        .with('photos')
      
      const result = await query.paginate(options.page, options.perPage || 10);
      
      // AdonisJS pode usar 'rows' ou 'data'
      const products = result.rows || result.data || [];
      
      // Apply translations to products - PADRÃO FAQ
      if (products && products.length > 0) {
        const translatedProducts = products.map(product => {
          const productJson = product.toJSON ? product.toJSON() : product;
          return {
            ...productJson,
            name: TranslationHelper.translateField(productJson, 'name', locale),
            description: TranslationHelper.translateField(productJson, 'description', locale)
          };
        });
        
        result.rows = translatedProducts;
        result.data = translatedProducts;
      }
      
      // ✅ FIX: Garantir que campos de paginação sempre existam (compatibilidade com apps mobile/partner)
      // AdonisJS Lucid retorna paginação em result.pages quando usa paginate()
      const paginationData = result.pages || result;
      
      return {
        rows: result.rows || result.data || [],
        data: result.data || result.rows || [],
        page: paginationData.page ?? parseInt(options.page),
        perPage: paginationData.perPage ?? parseInt(options.perPage),
        total: paginationData.total ? parseInt(paginationData.total) : 0,
        lastPage: paginationData.lastPage ?? 1
      };
    }

    /**
     *
     * @param {*} Payload
     * @param {*} Id
     * @returns
     */
    async updatedProducts(Id, ModelPayload) {
      return await new ProductsRepository().update(Id, ModelPayload);
    } 
  
    /**
     * @author "caniggiamoreira@gmail.com"
     * @deprecated "Elimina os dados de forma temporariamente."
     * @param {*} Id 
     * @returns 
     */
    async deleteTemporarilyProducts(Id) {
      return await new ProductsRepository().delete(Id); 
    }

    /**
     * @author "caniggiamoreira@gmail.com"
     * @deprecated "Elimina os dados de definitivamente."
     * @param {*} Id 
     * @returns 
    */
    async deleteDefinitiveProducts(Id) {
      return await new ProductsRepository().deleteDefinitive(Id); 
    }

    /**
     * @author "caniggiamoreira@gmail.com"
     * @deprecated "Listar Lixeira -  registos eliminados temporariamente."
     * @param {*} Payload 
     * @returns 
     */ 
    async findAllProductssTrash(filters) {
        const options = {
        ...new ProductsRepository().setOptions(filters),
        typeOrderBy: "DESC",
        };
        let query = new ProductsRepository()
        .findTrash(options.search, options) 
        .where(function () {}).where('is_deleted', 1)
        return query.paginate(options.page, options.perPage || 10);
    }
    
    }
    module.exports = ProductsService
    