const Database = use('Database')
const OrderFactory = use('App/Modules/Sales/Services/CreateOrder/OrderFactory')
const ShopOrderFactory = use('App/Modules/Sales/Services/CreateOrder/ShopOrderFactory')

class CreateOrderUseCase {
  async execute (orderData, userId = null) {
    const trx = await Database.beginTransaction()

    try {
      const order = await new OrderFactory().create(orderData, userId, trx)
      // await new ShopOrderFactory().createFromOrder(order, trx)

      await trx.commit()
      return order
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }
}

module.exports = CreateOrderUseCase
