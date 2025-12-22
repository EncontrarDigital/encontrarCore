const ProductRepository = use('App/Modules/Catalog/Repositories/ProductsRepository')

class PricingService {
  static async calculate (items, delivery) {
    let total = 0
    const pricedItems = []

    for (const item of items) {
      const product = await new ProductRepository().findById(item.product_id).first();

      if (!product || !product.visible) {
        throw new Error(`Produto inválido: ${item.product_id}`)
      }

      const price = Number(product.price)
      const subtotal = price * item.quantity

      total += subtotal

      pricedItems.push({
        ...item,
        price
      })
    }

    if (delivery?.price) {
      total += Number(delivery.price)
    }

    return { total, items: pricedItems }
  }
}

module.exports = PricingService
