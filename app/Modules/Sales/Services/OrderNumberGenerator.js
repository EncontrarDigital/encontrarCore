'use strict'


class OrderNumberGenerator {
  generate (order) {
    if (!order || !order.id) {
      throw new Error('Order inválida para gerar número')
    }

    const date = new Date()
    const year = date.getFullYear()
    const orderId = String(order.id).padStart(6, '0')
    return `Enc${year}/${orderId}`
  }
}

module.exports = OrderNumberGenerator
