
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
      
      return result;
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
      
      let query = new ProductsRepository()
      .findAll(search, options) 
      .innerJoin('categories_products_products', 'categories_products_products.productsId', 'products.id')
      .where(function () {
        this.where('categories_products_products.categoriesId', CategoryId)
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
          
          const translated = {
            ...productJson,
            name: TranslationHelper.translateField(productJson, 'name', locale),
            description: TranslationHelper.translateField(productJson, 'description', locale)
          };
          
          return translated;
        });
        
        result.rows = translatedProducts;
        result.data = translatedProducts;
      }
      
      return result;
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
      
      let query = new ProductsRepository()
        .findAll(search, options, selectColumn) 
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
      
      return result;
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
    