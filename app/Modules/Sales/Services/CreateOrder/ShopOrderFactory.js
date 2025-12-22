'use strict'

const Database = use('Database')
const ShopOrderRepository = use('App/Modules/Sales/Repositories/ShopOrderRepository')
const ShopOrderItemRepository = use('App/Modules/Sales/Repositories/ShopOrderItemRepository')


class ShopOrderFactory {
  async createFromOrder (order, trx) {
    console.log(order.items)
    const itemsByShop = {}

      await order.load('items')

    for (const item of order.items) {
      const shopItem = await Database
        .table('shop_items')
        .where('productId', item.productId)
        .first()
        // .transacting(trx)

      if (!shopItem) {
        throw new Error(`Produto ${item.productId} sem loja`)
      }

      const shopId = shopItem.shopId

      itemsByShop[shopId] ||= []
      itemsByShop[shopId].push(item)
    }

    for (const shopId in itemsByShop) {
      const shopItems = itemsByShop[shopId]

      const total = shopItems.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0
      )

      const shopOrder = await ShopOrderRepository.create({
        order_id: order.id,
        shop_id: shopId,
        status: 'PENDING',
        total_amount: total
      })

      for (const item of shopItems) {
        await ShopOrderItemRepository.create({
          shop_order_id: shopOrder.id,
          order_item_id: item.id
        })
      }
    }
  }
}

module.exports = ShopOrderFactory
