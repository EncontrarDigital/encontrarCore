'use strict'

const ProductRating = use('App/Modules/Catalog/Models/ProductRating')
const Product = use('App/Modules/Catalog/Models/Product')
const Database = use('Database')

class ProductRatingService {
  
  /**
   * Buscar todas as avaliações de um produto
   */
  async getProductRatings(productId) {
    try {
      const ratings = await ProductRating
        .query()
        .where('productId', productId)
        .orderBy('created', 'desc')
        .fetch()

      return ratings.toJSON().map(rating => ({
        id: rating.id,
        productId: rating.productId,
        rating: rating.rating,
        comment: rating.comment,
        user: {
          name: 'Usuário'  // Simplificado - pode adicionar relacionamento depois
        },
        created: rating.created
      }))
    } catch (error) {
      console.error('❌ Error fetching product ratings:', error)
      throw error
    }
  }

  /**
   * Calcular média de rating de um produto
   */
  async getProductAverageRating(productId) {
    const result = await Database
      .from('product_ratings')
      .where('productId', productId)
      .avg('rating as average')
      .count('* as total')
      .first()

    return {
      average: parseFloat(result.average) || 0,
      total: parseInt(result.total) || 0
    }
  }

  /**
   * Criar nova avaliação
   */
  async createRating(productId, data, auth) {
    // Verificar se produto existe
    const product = await Product.find(productId)
    if (!product) {
      throw new Error('Produto não encontrado')
    }

    // Validar rating (1-5)
    if (data.rating < 1 || data.rating > 5) {
      throw new Error('Rating deve ser entre 1 e 5')
    }

    // Verificar se usuário já avaliou este produto
    if (auth && auth.user) {
      const existingRating = await ProductRating
        .query()
        .where('productId', productId)
        .where('userId', auth.user.id)
        .first()

      if (existingRating) {
        // Atualizar avaliação existente
        existingRating.rating = data.rating
        existingRating.comment = data.comment || null
        await existingRating.save()
        return existingRating
      }
    }

    // Criar nova avaliação
    const rating = await ProductRating.create({
      productId: productId,
      userId: auth && auth.user ? auth.user.id : null,
      rating: data.rating,
      comment: data.comment || null
    })

    return rating
  }

  /**
   * Atualizar avaliação
   */
  async updateRating(ratingId, data, auth) {
    const rating = await ProductRating.find(ratingId)
    
    if (!rating) {
      throw new Error('Avaliação não encontrada')
    }

    // Verificar se usuário é dono da avaliação
    if (auth && auth.user && rating.userId !== auth.user.id) {
      throw new Error('Você não tem permissão para editar esta avaliação')
    }

    rating.rating = data.rating
    rating.comment = data.comment || null
    await rating.save()

    return rating
  }

  /**
   * Deletar avaliação
   */
  async deleteRating(ratingId, auth) {
    const rating = await ProductRating.find(ratingId)
    
    if (!rating) {
      throw new Error('Avaliação não encontrada')
    }

    // Verificar se usuário é dono da avaliação
    if (auth && auth.user && rating.userId !== auth.user.id) {
      throw new Error('Você não tem permissão para deletar esta avaliação')
    }

    await rating.delete()
    return { message: 'Avaliação deletada com sucesso' }
  }
}

module.exports = ProductRatingService
