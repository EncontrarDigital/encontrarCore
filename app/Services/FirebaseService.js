'use strict'

const Firebase = require('../../config/firebase')
const ShopService = use('App/Modules/Catalog/Services/ShopService')
const UsersService = use('App/Modules/Authentication/Services/UsersService')
const Database = use("Database");
const NotificationService = use('App/Modules/Notification/Services/NotificationService')



class FirebaseService {
  /**
   * Envia notificação quando um novo pedido é criado
   * Notifica tanto o cliente quanto os parceiros (shops)
   */
  async notifyNewOrder(order, orderItems) {
    try {
      // Buscar cliente usando Database em vez de Service (mais rápido)
      const customer = await Database.table('users').where('id', order.userId).first()
      if (!customer) {
        return
      }

      // Usar order_number se disponível, senão usar id
      const orderIdentifier = order.order_number || order.id

      // Notificação para o cliente
      const customerNotification = {
        title: 'Pedido Confirmado',
        body: `O seu pedido #${orderIdentifier} foi recebido e está sendo preparado.`
      }

      const customerData = {
        type: 'new_order',
        orderId: order.id.toString(),
        orderNumber: orderIdentifier.toString(),
        orderStatus: order.status || 'PENDING'
      }

      // 1. Armazenar notificação na BD
      await new NotificationService().createdNotifications({
        title: customerNotification.title,
        message: customerNotification.body,
        type: 'new_order'
      }, customer.id)

      // 2. Enviar push notification via Firebase
      await this.notifyUser(customer.id, customerNotification, customerData)

      // Otimizar: Buscar todos os shopIds em uma única query
      if (orderItems && orderItems.length > 0) {
        const productIds = orderItems.map(item => item.product_id)
        
        // Uma única query para pegar todos os shops
        const shopProducts = await Database
          .table('products')
          .whereIn('id', productIds)
          .distinct('shopId')
          .select('shopId')
        
        // Extrair shopIds únicos
        const shopIds = [...new Set(shopProducts.map(p => p.shopId).filter(id => id))]

        // Notificar para cada shop em paralelo
        await Promise.all(
          shopIds.map(async (shopId) => {
            try {
              const shopNotification = {
                title: 'Novo Pedido',
                body: `Você recebeu um novo pedido #${orderIdentifier}`
              }

        const shopData = {
          type: 'new_order_shop',
          orderId: order.id.toString(),
          orderNumber: orderIdentifier.toString(),
          customerId: order.userId.toString(),
          orderStatus: order.status || 'PENDING'
        }

              // // Buscar shop owners/managers
              // const shopUsers = await Database.table('shops')
              //   .innerJoin('users', 'users.id', 'shops.userId')
              //   .where('shops.id', shopId)
              //   .where('users.role', 'sales')
              //   .select('users.id')

              // // Armazenar e notificar cada shop user
              // for (const shopUser of shopUsers) {
              //   // Armazenar na BD
              //   await new NotificationService().createdNotifications({
              //     title: shopNotification.title,
              //     message: shopNotification.body,
              //     type: 'new_order_shop'
              //   }, shopUser.id)

              //   // Enviar push notification
              //   await this.notifyUser(shopUser.id, shopNotification, shopData)
              // }
            } catch (error) {
              console.error(`Error notifying shop ${shopId}:`, error.message)
            }
          })
        )
      }

    } catch (error) {
      console.error('Error sending order notifications:', error.message)
    }
  }  /**
   * Envia notificação para um usuário específico
   */
  async notifyUser(userId, notification, data = {}) {
    try {
      const tokens = await Database.table('device_tokens').where('user_id', userId).where('is_active', true).select('id', 'token');
      
      if (!tokens || tokens.length === 0) {
        console.log(`No tokens found for user ${userId}`)
        return
      }

      const tokenList = tokens.map(t => ({ id: t.id, token: t.token }))
      
      if (tokenList.length === 1) {
        const result = await Firebase.sendNotification(tokenList[0].token, notification, data)
        
        // Desativar token se inválido
        if (!result.success && result.shouldDeactivate) {
          await this.deactivateToken(tokenList[0].id)
        }
      } else {
        // Enviar para múltiplos tokens
        for (const tokenData of tokenList) {
          const result = await Firebase.sendNotification(tokenData.token, notification, data)
          
          // Desativar token se inválido
          if (!result.success && result.shouldDeactivate) {
            await this.deactivateToken(tokenData.id)
          }
        }
      }
    } catch (error) {
      console.error('Error notifying user:', error.message)
    }
  }

  /**
   * Desativa um token no banco de dados
   */
  async deactivateToken(tokenId) {
    try {
      await Database.table('device_tokens')
        .where('id', tokenId)
        .update({
          is_active: false,
          updated_at: new Date()
        })
      console.log(`🗑️  Token ${tokenId} desativado automaticamente`)
    } catch (error) {
      console.error('Error deactivating token:', error.message)
    }
  }

  /**
   * Envia notificação para todos os usuários de uma loja
   */
  async notifyShopUsers(shopId, notification, data = {}) {
    try {
      // Buscar todos os usuários que trabalham na loja
      const shopUsers = await Database.table('shops').innerJoin('users', 'users.id', 'shops.userId')
        .where('shops.id', shopId)
        .where('users.role', 'sales')
        .select('users.id')

      for (const user of shopUsers) {
        await this.notifyUser(user.id, notification, data)
      }
    } catch (error) {
      console.error('Error notifying shop users:', error.message)
    }
  }

  /**
   * Notifica múltiplos usuários
   */
  async notifyUsers(userIds, notification, data = {}) {
    try {
      const tokens = await Database.table('device_tokens').whereIn('user_id', userIds).where('is_active', true).select('token');
      if (!tokens || tokens.length === 0) {
        console.log('No tokens found for users')
        return
      }

      const tokenList = tokens.map(t => t.token)
      await Firebase.sendMulticast(tokenList, notification, data)
    } catch (error) {
      console.error('Error notifying multiple users:', error.message)
    }
  }

  /**
   * Notifica via tópico (melhor para broadcast)
   */
  async notifyTopic(topic, notification, data = {}) {
    try {
      await Firebase.sendToTopic(topic, notification, data)
    } catch (error) {
      console.error('Error sending topic notification:', error.message)
    }
  }

  /**
   * Inscreve usuário em um tópico
   */
  async subscribeUserToTopic(userId, topic) {
    try {
      const tokens = await Database.table('device_tokens').where('user_id', userId).where('is_active', true).select('token');

      if (!tokens || tokens.length === 0) {
        console.log(`No tokens found for user ${userId}`)
        return
      }

      const tokenList = tokens.map(t => t.token)
      await Firebase.subscribeToTopic(tokenList, topic)
    } catch (error) {
      console.error('Error subscribing to topic:', error.message)
    }
  }

  /**
   * Remove inscrição de usuário de um tópico
   */
  async unsubscribeUserFromTopic(userId, topic) {
    try {
      const tokens = await Database.table('device_tokens').where('user_id', userId).where('is_active', true).select('token');

      if (!tokens || tokens.length === 0) {
        console.log(`No tokens found for user ${userId}`)
        return
      }

      const tokenList = tokens.map(t => t.token)
      await Firebase.unsubscribeFromTopic(tokenList, topic)
    } catch (error) {
      console.error('Error unsubscribing from topic:', error.message)
    }
  }

  /**
   * Notifica atualização de status do pedido
   */
  async notifyOrderStatusUpdate(order, newStatus, message) {
    try {
      // Buscar userId - pode vir como userId ou user_id dependendo da serialização
      const userId = order.userId || order.user_id
      
      if (!userId) {
        console.log('⚠️  userId não encontrado no pedido:', order)
        return
      }

      const customer = await Database.table('users').where('id', userId).first();

      if (!customer) {
        console.log(`⚠️  Cliente não encontrado: userId=${userId}`)
        return
      }

      // Usar order_number se disponível, senão usar id
      const orderIdentifier = order.order_number || order.id
    
      const notification = {
        title: 'Atualização de Pedido',
        body: message || `O seu pedido #${orderIdentifier} foi atualizado para ${newStatus}`
      }

      const data = {
        type: 'order_status_update',
        orderId: order.id.toString(),
        orderNumber: orderIdentifier.toString(),
        orderStatus: newStatus
      }

      console.log(`📤 Enviando notificação para cliente ${customer.id}: Pedido #${orderIdentifier}`)
      
      // 1. Armazenar notificação na BD
      await new NotificationService().createdNotifications({
        title: notification.title,
        message: notification.body,
        type: 'order_status_update'
      }, customer.id)

      // 2. Enviar push notification via Firebase
      await this.notifyUser(customer.id, notification, data)
    } catch (error) {
      console.error('Error notifying order status update:', error.message)
    }
  }

  /**
   * Notifica cancellação de pedido
   */
  async notifyOrderCancelled(order, reason = '') {
    try {
      const customer = await new UsersService().findUsersById(order.userId)

      if (!customer) return

      const orderIdentifier = order.order_number || order.id

      const notification = {
        title: 'Pedido Cancelado',
        body: `O seu pedido #${orderIdentifier} foi cancelado. ${reason}`
      }

      const data = {
        type: 'order_cancelled',
        orderId: order.id.toString(),
        orderNumber: orderIdentifier.toString(),
        reason: reason
      }

      await this.notifyUser(customer.id, notification, data)
    } catch (error) {
      console.error('Error notifying order cancellation:', error.message)
    }
  }
}

module.exports = FirebaseService
