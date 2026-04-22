'use strict'

const axios = require('axios')
const Env = use('Env')

class WebhookService {
  constructor() {
    // URL da API principal (ecommerce-api)
    this.mainApiUrl = Env.get('MAIN_API_URL', 'https://api.encontrarshopping.com')
  }

  /**
   * Envia notificação de novo pedido para a API principal
   * @param {Object} order - Dados do pedido
   * @param {Array} orderItems - Itens do pedido
   * @returns {Promise<boolean>}
   */
  async notifyNewOrder(order, orderItems = []) {
    try {
      const url = `${this.mainApiUrl}/webhooks/order-notification`
      
      console.log(`📤 Enviando notificação de pedido para API principal: ${url}`)
      
      const notificationData = {
        type: 'new_order',
        title: `Novo pedido #${order.order_number || order.id}`,
        message: `Um novo pedido foi realizado: #${order.order_number || order.id}`,
        orderId: order.id,
        orderNumber: order.order_number || `#${order.id}`,
        orderStatus: order.status || 'pending',
        userId: order.userId,
        totalAmount: order.total || 0,
        createdAt: order.created || new Date().toISOString(),
        source: 'mobile_app',
        metadata: {
          itemsCount: orderItems.length,
          items: orderItems,
          contactPhone: order.contactPhone,
          fullName: order.fullName,
          contactEmail: order.contactEmail,
          // Adicionar informações de delivery e payment se disponíveis
          delivery: {
            id: order.deliveryId,
            price: order.delivery_price || 0
          },
          payment: {
            id: order.paymentId
          }
        }
      }

      const response = await axios.post(url, notificationData, {
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Source': 'encontrarCore'
        },
        timeout: 5000
      })

      if (response.status === 200 || response.status === 201) {
        console.log(`✅ Notificação de pedido enviada com sucesso`)
        return true
      }

      console.warn(`⚠️  API principal retornou status ${response.status}`)
      return false
    } catch (error) {
      console.error(`❌ Erro ao enviar notificação de pedido:`, error.message)
      
      if (Env.get('NODE_ENV') === 'development') {
        console.error('Detalhes do erro:', {
          url: `${this.mainApiUrl}/webhooks/order-notification`,
          message: error.message,
          response: error.response?.data
        })
      }
      
      return false
    }
  }

  /**
   * Envia notificação de atualização de status de pedido
   * @param {Object} order - Dados do pedido
   * @param {string} newStatus - Novo status
   * @returns {Promise<boolean>}
   */
  async notifyOrderStatusUpdate(order, newStatus) {
    try {
      const url = `${this.mainApiUrl}/webhooks/order-notification`
      
      console.log(`📤 Enviando atualização de status para API principal: ${url}`)
      
      const notificationData = {
        type: 'order_status_update',
        title: `Pedido #${order.order_number || order.id} atualizado`,
        message: `Status do pedido atualizado para: ${newStatus}`,
        orderId: order.id,
        orderNumber: order.order_number || `#${order.id}`,
        orderStatus: newStatus,
        userId: order.userId,
        totalAmount: order.total || 0,
        createdAt: order.updated || new Date().toISOString(),
        source: 'mobile_app',
        metadata: {
          oldStatus: order.status,
          newStatus: newStatus
        }
      }

      const response = await axios.post(url, notificationData, {
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Source': 'encontrarCore'
        },
        timeout: 5000
      })

      if (response.status === 200 || response.status === 201) {
        console.log(`✅ Atualização de status enviada com sucesso`)
        return true
      }

      console.warn(`⚠️  API principal retornou status ${response.status}`)
      return false
    } catch (error) {
      console.error(`❌ Erro ao enviar atualização de status:`, error.message)
      
      if (Env.get('NODE_ENV') === 'development') {
        console.error('Detalhes do erro:', {
          url: `${this.mainApiUrl}/webhooks/order-notification`,
          message: error.message,
          response: error.response?.data
        })
      }
      
      return false
    }
  }
}

module.exports = WebhookService
