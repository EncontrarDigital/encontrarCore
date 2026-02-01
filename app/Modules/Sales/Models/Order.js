'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Order extends Model {
  static boot() {
    super.boot();
    this.addTrait("@provider:Auditable");

    // Map para armazenar status anterior temporariamente (fora da instância)
    const previousStatusMap = new Map()

    /**
     * Hook: Detecta mudanças de status ANTES de salvar
     * Armazena o status anterior para comparação
     */
    this.addHook('beforeUpdate', async (orderInstance) => {
      // Armazenar status anterior se o status foi modificado
      if (orderInstance.dirty.status) {
        const oldStatus = orderInstance.$originalAttributes.status
        // Usar Map externo para não poluir a instância
        previousStatusMap.set(orderInstance.id, oldStatus)
      }
    })

    /**
     * Hook: Envia notificação APÓS salvar mudança de status
     * Funciona independente da origem da mudança (API, outro backend, script, DB direto)
     */
    this.addHook('afterUpdate', async (orderInstance) => {
      // Verificar se temos status anterior armazenado
      const previousStatus = previousStatusMap.get(orderInstance.id)
      
      if (previousStatus && previousStatus !== orderInstance.status) {
        try {
          const FirebaseService = use('App/Services/FirebaseService')
          const firebaseService = new FirebaseService()

          // Mapear status para mensagens amigáveis
          const statusMessages = {
            'pending': `Pedido #${orderInstance.order_number || orderInstance.id} está aguardando confirmação`,
            'open': `Pedido #${orderInstance.order_number || orderInstance.id} está sendo preparado`,
            'delivered': `Pedido #${orderInstance.order_number || orderInstance.id} foi entregue com sucesso`,
            'confirmed': `🎉 Pedido #${orderInstance.order_number || orderInstance.id} concluído! Obrigado pela sua preferência. Continue a explorar mais produtos incríveis na nossa loja!`,
            'cancelled': `Pedido #${orderInstance.order_number || orderInstance.id} foi cancelado`,
            'returned': `Pedido #${orderInstance.order_number || orderInstance.id} foi devolvido`
          }

          const message = statusMessages[orderInstance.status] || `Pedido #${orderInstance.order_number || orderInstance.id} - Estado atualizado para ${orderInstance.status}`

          // Preparar dados do pedido para notificação
          const orderData = {
            id: orderInstance.id,
            order_number: orderInstance.order_number,
            userId: orderInstance.userId,
            status: orderInstance.status
          }

          // Enviar notificação em background (não bloqueia)
          firebaseService.notifyOrderStatusUpdate(
            orderData,
            orderInstance.status,
            message
          ).catch(error => {
            console.error('❌ Erro ao enviar notificação de mudança de status:', error.message)
          })

          console.log(`📲 Notificação enviada: Pedido #${orderInstance.order_number || orderInstance.id} - ${previousStatus} → ${orderInstance.status}`)
          
        } catch (error) {
          console.error('❌ Erro no hook afterUpdate:', error.message)
        } finally {
          // Limpar do Map após uso
          previousStatusMap.delete(orderInstance.id)
        }
      }
    })
  }

  static get table () {
    return 'orders'
  }

  static get createdAtColumn() {
    return 'created'
  }

  static get updatedAtColumn() {
    return 'updated'
  }

  items() {
    return this.hasMany('App/Modules/Sales/Models/OrderItem', 'order_id', 'id')
  }
}

module.exports = Order
