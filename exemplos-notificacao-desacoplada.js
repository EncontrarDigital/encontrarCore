/**
 * Exemplos de Uso: Sistema de Notificações Desacoplado
 * 
 * Este arquivo demonstra diferentes cenários onde as notificações
 * são enviadas automaticamente via Model Hooks.
 */

'use strict'

const Order = use('App/Modules/Sales/Models/Order')
const Database = use('Database')

class ExemplosNotificacaoDesacoplada {
  
  /**
   * EXEMPLO 1: Atualização via Controller (Cenário Normal)
   * Quando admin atualiza pedido via API REST
   */
  async exemplo1_ViaController(orderId, newStatus) {
    console.log('📝 EXEMPLO 1: Atualização via Controller')
    
    const order = await Order.find(orderId)
    order.status = newStatus
    await order.save()
    
    // ✅ Hook dispara automaticamente
    // ✅ Cliente recebe notificação
    
    console.log('✅ Pedido atualizado via controller')
    console.log('📲 Notificação enviada automaticamente!')
  }

  /**
   * EXEMPLO 2: Webhook de Sistema Externo
   * Quando transportadora envia atualização de entrega
   */
  async exemplo2_WebhookTransportadora(trackingCode, deliveryStatus) {
    console.log('📝 EXEMPLO 2: Webhook de Transportadora')
    
    const order = await Order.query()
      .where('tracking_code', trackingCode)
      .first()
    
    if (!order) {
      console.log('❌ Pedido não encontrado')
      return
    }

    // Mapear status da transportadora para nosso sistema
    const statusMap = {
      'out_for_delivery': 'open',
      'delivered': 'delivered',
      'failed': 'pending'
    }

    order.status = statusMap[deliveryStatus] || 'open'
    await order.save()
    
    // ✅ Hook dispara automaticamente
    // ✅ Cliente notificado sobre entrega
    
    console.log('✅ Status atualizado via webhook')
    console.log('📲 Cliente notificado automaticamente!')
  }

  /**
   * EXEMPLO 3: Job de Processamento em Lote
   * Processar pedidos pendentes automaticamente
   */
  async exemplo3_JobProcessamento() {
    console.log('📝 EXEMPLO 3: Job de Processamento em Lote')
    
    // Buscar pedidos pendentes há mais de 1 hora
    const orders = await Order.query()
      .where('status', 'pending')
      .where('created', '<', Database.raw("NOW() - INTERVAL '1 hour'"))
      .fetch()

    console.log(`📦 Encontrados ${orders.rows.length} pedidos para processar`)

    for (const order of orders.rows) {
      // Validar pagamento, estoque, etc...
      const isValid = await this.validateOrder(order)
      
      if (isValid) {
        order.status = 'open'
        await order.save()
        // ✅ Cada cliente notificado automaticamente
      }
    }
    
    console.log('✅ Lote processado')
    console.log('📲 Todos os clientes notificados!')
  }

  /**
   * EXEMPLO 4: Script de Migração
   * Migrar pedidos antigos para novo sistema de status
   */
  async exemplo4_ScriptMigracao() {
    console.log('📝 EXEMPLO 4: Script de Migração')
    
    // Migrar status antigo "processing" para "open"
    const oldOrders = await Order.query()
      .where('status', 'processing')
      .fetch()

    console.log(`📦 Migrando ${oldOrders.rows.length} pedidos`)

    for (const order of oldOrders.rows) {
      order.status = 'open'
      await order.save()
      // ✅ Cliente notificado da mudança
    }
    
    console.log('✅ Migração concluída')
    console.log('📲 Clientes notificados!')
  }

  /**
   * EXEMPLO 5: Integração com Painel Administrativo
   * Admin aprova pedidos manualmente
   */
  async exemplo5_AprovacaoManual(orderId, adminId) {
    console.log('📝 EXEMPLO 5: Aprovação Manual pelo Admin')
    
    const order = await Order.find(orderId)
    
    // Adicionar informação do admin que aprovou
    order.status = 'confirmed'
    order.approved_by = adminId
    order.approved_at = new Date()
    await order.save()
    
    // ✅ Hook dispara automaticamente
    // ✅ Cliente notificado da aprovação
    
    console.log('✅ Pedido aprovado pelo admin')
    console.log('📲 Cliente notificado!')
  }

  /**
   * EXEMPLO 6: Cancelamento Automático
   * Cancelar pedidos não pagos após 24h
   */
  async exemplo6_CancelamentoAutomatico() {
    console.log('📝 EXEMPLO 6: Cancelamento Automático')
    
    const expiredOrders = await Order.query()
      .where('status', 'pending')
      .where('created', '<', Database.raw("NOW() - INTERVAL '24 hours'"))
      .fetch()

    console.log(`📦 Cancelando ${expiredOrders.rows.length} pedidos expirados`)

    for (const order of expiredOrders.rows) {
      order.status = 'cancelled'
      order.cancellation_reason = 'Pagamento não confirmado em 24h'
      await order.save()
      // ✅ Cliente notificado do cancelamento
    }
    
    console.log('✅ Pedidos cancelados')
    console.log('📲 Clientes notificados!')
  }

  /**
   * EXEMPLO 7: Atualização via Outro Backend
   * Sistema de gestão de estoque atualiza pedidos
   */
  async exemplo7_OutroBackend(orderId) {
    console.log('📝 EXEMPLO 7: Atualização via Outro Backend')
    
    // Outro sistema pode usar o mesmo modelo
    const order = await Order.find(orderId)
    
    // Verificar estoque e atualizar
    const hasStock = await this.checkStock(order)
    
    if (hasStock) {
      order.status = 'open'
    } else {
      order.status = 'pending'
      order.notes = 'Aguardando reposição de estoque'
    }
    
    await order.save()
    // ✅ Hook dispara automaticamente
    // ✅ Cliente notificado
    
    console.log('✅ Status atualizado por outro sistema')
    console.log('📲 Cliente notificado!')
  }

  /**
   * EXEMPLO 8: Atualização em Massa com Transação
   * Confirmar múltiplos pedidos de uma vez
   */
  async exemplo8_AtualizacaoEmMassa(orderIds) {
    console.log('📝 EXEMPLO 8: Atualização em Massa')
    
    const trx = await Database.beginTransaction()
    
    try {
      for (const orderId of orderIds) {
        const order = await Order.find(orderId)
        order.useTransaction(trx)
        order.status = 'confirmed'
        await order.save()
        // ✅ Cada save() dispara o hook
        // ✅ Cada cliente notificado
      }
      
      await trx.commit()
      console.log('✅ Todos os pedidos confirmados')
      console.log('📲 Todos os clientes notificados!')
      
    } catch (error) {
      await trx.rollback()
      console.error('❌ Erro na atualização em massa:', error.message)
    }
  }

  /**
   * EXEMPLO 9: Integração com Sistema de Pagamento
   * Webhook de confirmação de pagamento
   */
  async exemplo9_WebhookPagamento(paymentId, paymentStatus) {
    console.log('📝 EXEMPLO 9: Webhook de Pagamento')
    
    const order = await Order.query()
      .where('payment_id', paymentId)
      .first()
    
    if (!order) {
      console.log('❌ Pedido não encontrado')
      return
    }

    if (paymentStatus === 'approved') {
      order.status = 'open'
      order.payment_confirmed_at = new Date()
    } else if (paymentStatus === 'rejected') {
      order.status = 'cancelled'
      order.cancellation_reason = 'Pagamento rejeitado'
    }
    
    await order.save()
    // ✅ Hook dispara automaticamente
    // ✅ Cliente notificado do status do pagamento
    
    console.log('✅ Status atualizado via webhook de pagamento')
    console.log('📲 Cliente notificado!')
  }

  /**
   * EXEMPLO 10: Atualização Condicional
   * Atualizar apenas se condições forem atendidas
   */
  async exemplo10_AtualizacaoCondicional(orderId) {
    console.log('📝 EXEMPLO 10: Atualização Condicional')
    
    const order = await Order.find(orderId)
    
    // Verificar múltiplas condições
    const paymentConfirmed = await this.isPaymentConfirmed(order)
    const stockAvailable = await this.checkStock(order)
    const addressValid = await this.validateAddress(order)
    
    if (paymentConfirmed && stockAvailable && addressValid) {
      order.status = 'open'
      await order.save()
      // ✅ Hook dispara apenas se todas as condições OK
      // ✅ Cliente notificado
      
      console.log('✅ Todas as condições atendidas')
      console.log('📲 Cliente notificado!')
    } else {
      console.log('⚠️  Condições não atendidas, status não alterado')
      console.log('📲 Nenhuma notificação enviada')
    }
  }

  // ========== MÉTODOS AUXILIARES ==========

  async validateOrder(order) {
    // Lógica de validação
    return true
  }

  async checkStock(order) {
    // Verificar estoque
    return true
  }

  async validateAddress(order) {
    // Validar endereço
    return true
  }

  async isPaymentConfirmed(order) {
    // Verificar pagamento
    return true
  }
}

module.exports = ExemplosNotificacaoDesacoplada

/**
 * COMO USAR ESTES EXEMPLOS:
 * 
 * 1. Via Ace Command:
 *    node ace run:script exemplos-notificacao-desacoplada.js
 * 
 * 2. Importar em outro arquivo:
 *    const Exemplos = use('App/Scripts/exemplos-notificacao-desacoplada')
 *    const exemplos = new Exemplos()
 *    await exemplos.exemplo1_ViaController(123, 'confirmed')
 * 
 * 3. Testar individualmente:
 *    node ace tinker
 *    > const Exemplos = use('App/Scripts/exemplos-notificacao-desacoplada')
 *    > const ex = new Exemplos()
 *    > await ex.exemplo1_ViaController(123, 'confirmed')
 */
