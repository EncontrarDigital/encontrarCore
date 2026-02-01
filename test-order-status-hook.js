/**
 * Script de Teste: Model Hooks de Notificação
 * 
 * Este script testa se as notificações são enviadas automaticamente
 * quando o status de um pedido é alterado, independente da origem.
 * 
 * USO:
 * node ace run:script test-order-status-hook.js --orderId=123 --newStatus=confirmed
 */

'use strict'

const Order = use('App/Modules/Sales/Models/Order')

class TestOrderStatusHook {
  async run(args) {
    try {
      // Obter parâmetros
      const orderId = args.orderId || process.argv[2]
      const newStatus = args.newStatus || process.argv[3] || 'confirmed'

      if (!orderId) {
        console.log('❌ Erro: orderId é obrigatório')
        console.log('Uso: node ace run:script test-order-status-hook.js --orderId=123 --newStatus=confirmed')
        return
      }

      console.log('🧪 Iniciando teste de notificação automática...')
      console.log(`📦 Pedido ID: ${orderId}`)
      console.log(`🔄 Novo Status: ${newStatus}`)
      console.log('─'.repeat(50))

      // Buscar pedido
      const order = await Order.find(orderId)

      if (!order) {
        console.log(`❌ Pedido #${orderId} não encontrado`)
        return
      }

      console.log(`✅ Pedido encontrado: #${order.order_number || order.id}`)
      console.log(`📊 Status atual: ${order.status}`)
      console.log(`👤 Cliente ID: ${order.userId}`)
      console.log('─'.repeat(50))

      // Verificar se status é diferente
      if (order.status === newStatus) {
        console.log(`⚠️  Status já é "${newStatus}". Nenhuma mudança necessária.`)
        console.log('💡 Dica: Use um status diferente para testar a notificação.')
        return
      }

      // Atualizar status (isso deve disparar o hook automaticamente)
      console.log(`🔄 Atualizando status: ${order.status} → ${newStatus}`)
      
      const oldStatus = order.status
      order.status = newStatus
      await order.save()

      console.log('─'.repeat(50))
      console.log('✅ Status atualizado com sucesso!')
      console.log(`📲 Hook deve ter enviado notificação automaticamente`)
      console.log('─'.repeat(50))
      console.log('📋 Resumo:')
      console.log(`   • Pedido: #${order.order_number || order.id}`)
      console.log(`   • Mudança: ${oldStatus} → ${newStatus}`)
      console.log(`   • Cliente: ${order.userId}`)
      console.log('─'.repeat(50))
      console.log('🔍 Verifique os logs acima para:')
      console.log('   1. "📲 Notificação enviada: Pedido #..."')
      console.log('   2. Mensagens do FirebaseService')
      console.log('   3. Possíveis erros de token')
      console.log('─'.repeat(50))
      console.log('📱 No app mobile:')
      console.log('   • Abra a tela de pedidos')
      console.log('   • Verifique se recebeu notificação push')
      console.log('   • Verifique se status foi atualizado')

    } catch (error) {
      console.error('❌ Erro no teste:', error.message)
      console.error(error.stack)
    }
  }
}

module.exports = TestOrderStatusHook
