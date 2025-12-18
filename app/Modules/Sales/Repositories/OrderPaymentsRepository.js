'use strict'

const OrderPayments = use('App/Modules/Sales/Models/OrderPayments')

class OrderPaymentsRepository {
  async create(payload) {
    return await OrderPayments.create(payload)
  }

  async findById(id) {
    return await OrderPayments.find(id)
  }

  async update(id, payload) {
    const orderPayment = await OrderPayments.find(id)
    if (!orderPayment) return null
    orderPayment.merge(payload)
    await orderPayment.save()
    return orderPayment
  }

  async delete(id) {
    const orderPayment = await OrderPayments.find(id)
    if (!orderPayment) return null
    await orderPayment.delete()
    return true
  }
}

module.exports = OrderPaymentsRepository