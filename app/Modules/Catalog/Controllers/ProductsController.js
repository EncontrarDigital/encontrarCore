
'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */
const ProductsService = use('App/Modules/Catalog/Services/ProductsService')
const TranslationHelper = use('App/Helpers/TranslationHelper')
/**
 * Resourceful controller for interacting with icttrunkouts
 */
class ProductsController{
  /**
   * Show a list of all icttrunkouts.
   * GET icttrunkouts
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   
   */
  async index ({ request, response,  }) { 
    try {
      const filters = request;
      const data = await new ProductsService().findAllProductss(filters);
      
      // Converter lastPage para número de forma robusta
      let lastPageValue = data.lastPage || data.pages?.total || 1;
      if (typeof lastPageValue === 'string') {
        lastPageValue = Number(lastPageValue);
      }
      
      // Converter para objeto simples para evitar erro toObject
      const responseData = {
        total: data.total || data.rows?.length || data.data?.length || 0,
        perPage: data.perPage || data.rows?.length || data.data?.length || 0,
        page: data.page || 1,
        lastPage: lastPageValue,
        data: data.data || data.rows || []
      };
      
      return response.ok(responseData);
    } catch (error) {
      console.error('❌ [ProductsController] index - Error:', error.message);
      return response.status(500).json({
        success: false,
        message: 'Error fetching products',
        error: error.message
      });
    }
  } 
  /**
   * Create/save a new icttrunkout.
   * POST icttrunkouts
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response, auth }) {
    try {
      const ModelPayload = request.all();
      const UserId = auth.user?.id;
      const data = await new ProductsService().createdProduct({...ModelPayload}, UserId);
      
      // Garantir que data é um objeto simples
      const productData = data.toJSON ? data.toJSON() : data;
      
      return response.created(productData, {message: "Registo efectuado com sucesso"});
    } catch (error) {
      console.error('❌ [ProductsController] Error creating product:', error);
      return response.status(500).json({
        success: false,
        message: 'Error creating product',
        error: error.message
      });
    }
  }

  /**
   * Display a single icttrunkout.
   * GET icttrunkouts/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   
   */
  async show ({ params, request, response  }) {
    const Id = params.id;
    const locale = request.locale || 'pt';
    
    const data = await new ProductsService().findProductsById(Id);
    
    if (!data) {
      return response.notFound({ message: 'Product not found' });
    }
    
    // Apply translation to single product
    const productJson = data.toJSON ? data.toJSON() : data;
    
    const translatedProduct = {
      ...productJson,
      name: TranslationHelper.translateField(productJson, 'name', locale),
      description: TranslationHelper.translateField(productJson, 'description', locale)
    };
    
    return response.ok(translatedProduct);
  }

  async getProductsByCategory ({ params, request, response,  }) { 
    try {
      const filters = request;
      const CategoryId = params.id;
      
      console.log('🎯 [CONTROLLER] getProductsByCategory - CategoryId:', CategoryId, 'Query params:', request.all());
      
      const data = await new ProductsService().getProductsByCategory(filters, CategoryId);
      
      console.log('🎯 [CONTROLLER] Service returned:', JSON.stringify({
        total: data.total,
        perPage: data.perPage,
        page: data.page,
        lastPage: data.lastPage,
        dataLength: data.data?.length,
        rowsLength: data.rows?.length,
        hasData: !!data.data,
        hasRows: !!data.rows
      }, null, 2));
      
      // Converter lastPage para número de forma robusta
      let lastPageValue = data.lastPage || data.pages?.total || 1;
      if (typeof lastPageValue === 'string') {
        lastPageValue = Number(lastPageValue);
      }
      
      // Converter para objeto simples
      const responseData = {
        total: data.total || data.rows?.length || data.data?.length || 0,
        perPage: data.perPage || data.rows?.length || data.data?.length || 0,
        page: data.page || 1,
        lastPage: lastPageValue,
        data: data.data || data.rows || []
      };
      
      console.log('🎯 [CONTROLLER] Sending response:', JSON.stringify({
        total: responseData.total,
        perPage: responseData.perPage,
        page: responseData.page,
        lastPage: responseData.lastPage,
        dataCount: responseData.data?.length
      }, null, 2));
      
      return response.ok(responseData);
    } catch (error) {
      console.error('❌ [ProductsController] getProductsByCategory - Error:', error.message);
      console.error('❌ [ProductsController] Stack:', error.stack);
      return response.status(500).json({
        success: false,
        message: 'Error fetching products by category',
        error: error.message
      });
    }
  } 

  async getProductsByShop ({ params, request, response }) {
    try {
      const filters = request;
      const shopId = params.id;
      const data = await new ProductsService().getProductsByShop(filters, shopId);
      
      // Converter lastPage para número de forma robusta
      let lastPageValue = data.lastPage || data.pages?.total || 1;
      if (typeof lastPageValue === 'string') {
        lastPageValue = Number(lastPageValue);
      }
      
      // Converter para objeto simples
      const responseData = {
        total: data.total || data.rows?.length || data.data?.length || 0,
        perPage: data.perPage || data.rows?.length || data.data?.length || 0,
        page: data.page || 1,
        lastPage: lastPageValue,
        data: data.data || data.rows || []
      };
      
      return response.ok(responseData);
    } catch (error) {
      console.error('❌ [ProductsController] getProductsByShop - Error:', error.message);
      return response.status(500).json({
        success: false,
        message: 'Error fetching products by shop',
        error: error.message
      });
    }
  }

  async getProductsByCategorySlug ({ params, request, response }) {
    try {
      const filters = request;
      const slug = params.slug;
      const data = await new ProductsService().getProductsByCategorySlug(filters, slug);
      
      // Converter lastPage para número de forma robusta
      let lastPageValue = data.lastPage || data.pages?.total || 1;
      if (typeof lastPageValue === 'string') {
        lastPageValue = Number(lastPageValue);
      }
      
      // Converter para objeto simples
      const responseData = {
        total: data.total || data.rows?.length || data.data?.length || 0,
        perPage: data.perPage || data.rows?.length || data.data?.length || 0,
        page: data.page || 1,
        lastPage: lastPageValue,
        data: data.data || data.rows || []
      };
      
      return response.ok(responseData);
    } catch (error) {
      console.error('❌ [ProductsController] getProductsByCategorySlug - Error:', error.message);
      return response.status(500).json({
        success: false,
        message: 'Error fetching products by category slug',
        error: error.message
      });
    }
  }

  /**
   * Update icttrunkout details.
   * PUT or PATCH icttrunkouts/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params, request, response }) {
    try {
      const ModelPayload = request.all();
      const Id = params.id;
      const data = await new ProductsService().updatedProducts(Id, ModelPayload);
      
      // Garantir que data é um objeto simples
      const productData = data.toJSON ? data.toJSON() : data;
      
      return response.ok(productData, {message: "Registo actualizado com sucesso"});
    } catch (error) {
      console.error('❌ [ProductsController] Error updating product:', error);
      return response.status(500).json({
        success: false,
        message: 'Error updating product',
        error: error.message
      });
    }
  }

  /**
   * Delete a icttrunkout with id.
   * DELETE icttrunkouts/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params, response }) { 
    try {
      const Id = params.id;
      const data = await new ProductsService().deleteTemporarilyProducts(Id);
      
      // Garantir que data é um objeto simples
      const productData = data.toJSON ? data.toJSON() : data;
      
      return response.ok(productData, {message: "Registo excluido com sucesso"});
    } catch (error) {
      console.error('❌ [ProductsController] Error deleting product:', error);
      return response.status(500).json({
        success: false,
        message: 'Error deleting product',
        error: error.message
      });
    }
  }
}

module.exports = ProductsController
    