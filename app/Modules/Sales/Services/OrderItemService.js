const OrderItemRepository = use("App/Modules/Sales/Repositories/OrderItemRepository")
const Database = use('Database')

class OrderItemService {
  static async createItems (orderId, items) {
    const createdItems = []

    for (const item of items) {
      const created = await new OrderItemRepository().create({
        orderId,
        productId: item.product_id,
        quantity: item.quantity,
        price: item.price
      }, null, false)

      created.shopId = await this.resolveShop(item.product_id)
      createdItems.push(created)
    }

    return createdItems
  }

  static async resolveShop (productId) {
    const shopItem = await Database
      .from('shop_items')
      .where('productId', productId)
      .first()

    if (!shopItem) {
      throw new Error(`Produto ${productId} não pertence a nenhuma loja`)
    }

    return shopItem.shopId
  }
}

module.exports = OrderItemService