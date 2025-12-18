'use strict'

const OrderDeliveries = use('App/Modules/Sales/Models/OrderDeliveries')

class OrderDeliveriesRepository {
  async create(payload) {
    return await OrderDeliveries.create(payload)
  }

  async findById(id) {
    return await OrderDeliveries.find(id)
  }

  async update(id, payload) {
    const orderDelivery = await OrderDeliveries.find(id)
    if (!orderDelivery) return null
    orderDelivery.merge(payload)
    await orderDelivery.save()
    return orderDelivery
  }

  async delete(id) {
    const orderDelivery = await OrderDeliveries.find(id)
    if (!orderDelivery) return null
    await orderDelivery.delete()
    return true
  }
}

module.exports = OrderDeliveriesRepository