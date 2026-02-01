# 🎬 Cenários Reais: Sistema de Notificações

## 📱 Como Funciona na Prática

Este documento mostra cenários reais de como o sistema de notificações desacoplado funciona no dia a dia.

---

## 🎯 Cenário 1: Cliente Faz Pedido pelo App Mobile

### Fluxo:
1. Cliente adiciona produtos ao carrinho
2. Cliente finaliza checkout
3. Pedido criado com `status: 'pending'`

### O Que Acontece:
```javascript
// OrderService.createdOrders()
const order = await new CreateOrderUseCase().execute(orderData, userId)
// Status inicial: 'pending'

// Notificação enviada via OrderService (não via hook, pois é criação)
await firebaseService.notifyNewOrder(order, orderItems)
```

### Cliente Recebe:
📲 **"Pedido Confirmado"**  
"O seu pedido #ORD-12345 foi recebido e está sendo preparado."

### No App:
- Tab **PENDING** mostra o pedido
- Status: "Aguardando confirmação"

---

## 🎯 Cenário 2: Admin Aprova Pedido no Painel Web

### Fluxo:
1. Admin acessa painel web (Next.js)
2. Admin vê lista de pedidos pendentes
3. Admin clica em "Aprovar Pedido"
4. Frontend chama API: `PUT /api/admin/orders/123`

### O Que Acontece:
```javascript
// OrderController.update()
async update({ params, request }) {
  const order = await Order.find(params.id)
  order.status = 'open'  // Mudança de status
  await order.save()     // ✅ Hook dispara aqui!
  
  return order
}
```

### Hook Detecta:
```javascript
// Order.js - afterUpdate hook
// Status mudou: 'pending' → 'open'
// Envia notificação automaticamente
await firebaseService.notifyOrderStatusUpdate(order, 'open', 'O seu pedido está sendo preparado')
```

### Cliente Recebe:
📲 **"Atualização de Pedido"**  
"O seu pedido #ORD-12345 está sendo preparado"

### No App:
- Pedido move de **PENDING** para **LOADING**
- Status: "Sendo preparado"

---

## 🎯 Cenário 3: Sistema de Pagamento Confirma (Webhook)

### Fluxo:
1. Cliente paga com cartão/transferência
2. Gateway de pagamento processa
3. Gateway envia webhook: `POST /api/webhooks/payment`

### O Que Acontece:
```javascript
// WebhookController.handlePayment()
async handlePayment({ request }) {
  const { orderId, status } = request.all()
  
  const order = await Order.find(orderId)
  
  if (status === 'approved') {
    order.status = 'open'      // Mudança de status
    order.payment_confirmed_at = new Date()
    await order.save()         // ✅ Hook dispara aqui!
  }
}
```

### Hook Detecta:
```javascript
// Status mudou: 'pending' → 'open'
// Envia notificação automaticamente
```

### Cliente Recebe:
📲 **"Atualização de Pedido"**  
"O seu pedido #ORD-12345 está sendo preparado"

### No App:
- Pedido move de **PENDING** para **LOADING**

---

## 🎯 Cenário 4: Transportadora Atualiza Entrega (Webhook)

### Fluxo:
1. Transportadora coleta pedido
2. Transportadora envia webhook: `POST /api/webhooks/delivery`
3. Webhook contém: `{ trackingCode: 'ABC123', status: 'delivered' }`

### O Que Acontece:
```javascript
// WebhookController.handleDelivery()
async handleDelivery({ request }) {
  const { trackingCode, status } = request.all()
  
  const order = await Order.query()
    .where('tracking_code', trackingCode)
    .first()
  
  if (status === 'delivered') {
    order.status = 'delivered'  // Mudança de status
    order.delivered_at = new Date()
    await order.save()          // ✅ Hook dispara aqui!
  }
}
```

### Hook Detecta:
```javascript
// Status mudou: 'confirmed' → 'delivered'
// Envia notificação automaticamente
```

### Cliente Recebe:
📲 **"Atualização de Pedido"**  
"O seu pedido #ORD-12345 foi entregue com sucesso"

### No App:
- Pedido permanece em **CONFIRMED** (delivered também vai para CONFIRMED)
- Status: "Entregue"

---

## 🎯 Cenário 5: Job Automático Processa Pedidos

### Fluxo:
1. Job roda a cada hora (cron)
2. Job busca pedidos pendentes há mais de 1 hora
3. Job valida e aprova automaticamente

### O Que Acontece:
```javascript
// Jobs/ProcessPendingOrders.js
async handle() {
  const orders = await Order.query()
    .where('status', 'pending')
    .where('created', '<', Database.raw("NOW() - INTERVAL '1 hour'"))
    .fetch()
  
  for (const order of orders.rows) {
    // Validar pagamento, estoque, etc.
    const isValid = await this.validateOrder(order)
    
    if (isValid) {
      order.status = 'open'    // Mudança de status
      await order.save()       // ✅ Hook dispara aqui!
    }
  }
}
```

### Hook Detecta:
```javascript
// Para cada pedido:
// Status mudou: 'pending' → 'open'
// Envia notificação automaticamente
```

### Clientes Recebem:
📲 **"Atualização de Pedido"** (cada um)  
"O seu pedido #ORD-XXXXX está sendo preparado"

### No App:
- Cada pedido move de **PENDING** para **LOADING**

---

## 🎯 Cenário 6: Script de Migração (Manutenção)

### Fluxo:
1. Dev precisa migrar status antigos
2. Dev roda script: `node ace run:script migrate-order-status.js`

### O Que Acontece:
```javascript
// scripts/migrate-order-status.js
async run() {
  // Migrar status antigo 'processing' para 'open'
  const oldOrders = await Order.query()
    .where('status', 'processing')
    .fetch()
  
  console.log(`Migrando ${oldOrders.rows.length} pedidos...`)
  
  for (const order of oldOrders.rows) {
    order.status = 'open'      // Mudança de status
    await order.save()         // ✅ Hook dispara aqui!
  }
  
  console.log('Migração concluída!')
}
```

### Hook Detecta:
```javascript
// Para cada pedido:
// Status mudou: 'processing' → 'open'
// Envia notificação automaticamente
```

### Clientes Recebem:
📲 **"Atualização de Pedido"** (cada um)  
"O seu pedido #ORD-XXXXX está sendo preparado"

---

## 🎯 Cenário 7: Outro Backend Atualiza Pedido

### Fluxo:
1. Sistema de gestão de estoque (outro backend)
2. Detecta que produto ficou disponível
3. Atualiza pedidos que estavam aguardando

### O Que Acontece:
```javascript
// outro-backend/services/stock-sync.js
async updatePendingOrders(productId) {
  // Conecta no mesmo banco de dados
  const Order = require('encontrar-core/app/Models/Order')
  
  const orders = await Order.query()
    .where('status', 'pending')
    .whereHas('items', (builder) => {
      builder.where('product_id', productId)
    })
    .fetch()
  
  for (const order of orders.rows) {
    order.status = 'open'      // Mudança de status
    await order.save()         // ✅ Hook dispara aqui!
  }
}
```

### Hook Detecta:
```javascript
// Status mudou: 'pending' → 'open'
// Envia notificação automaticamente
```

### Clientes Recebem:
📲 **"Atualização de Pedido"**  
"O seu pedido #ORD-XXXXX está sendo preparado"

---

## 🎯 Cenário 8: Admin Cancela Pedido Manualmente

### Fluxo:
1. Cliente liga pedindo cancelamento
2. Admin acessa painel web
3. Admin clica em "Cancelar Pedido"
4. Admin informa motivo

### O Que Acontece:
```javascript
// OrderController.cancel()
async cancel({ params, request }) {
  const order = await Order.find(params.id)
  const reason = request.input('reason')
  
  order.status = 'cancelled'           // Mudança de status
  order.cancellation_reason = reason
  order.cancelled_at = new Date()
  await order.save()                   // ✅ Hook dispara aqui!
  
  return order
}
```

### Hook Detecta:
```javascript
// Status mudou: 'open' → 'cancelled'
// Envia notificação automaticamente
```

### Cliente Recebe:
📲 **"Atualização de Pedido"**  
"O seu pedido #ORD-12345 foi cancelado"

### No App:
- Pedido some das tabs (cancelled não aparece)
- Histórico mostra como cancelado

---

## 🎯 Cenário 9: Loja Confirma Pedido pelo App Mobile (Lojista)

### Fluxo:
1. Lojista recebe notificação de novo pedido
2. Lojista abre app de lojista
3. Lojista clica em "Confirmar Pedido"

### O Que Acontece:
```javascript
// ShopOrderController.confirm()
async confirm({ params, auth }) {
  const order = await Order.find(params.id)
  
  // Verificar se lojista tem permissão
  const shop = await auth.user.shop().first()
  
  order.status = 'confirmed'     // Mudança de status
  order.confirmed_by = shop.id
  order.confirmed_at = new Date()
  await order.save()             // ✅ Hook dispara aqui!
  
  return order
}
```

### Hook Detecta:
```javascript
// Status mudou: 'open' → 'confirmed'
// Envia notificação automaticamente
```

### Cliente Recebe:
📲 **"Atualização de Pedido"**  
"O seu pedido #ORD-12345 foi confirmado e está a caminho"

### No App:
- Pedido permanece em **LOADING** ou move para **CONFIRMED**

---

## 🎯 Cenário 10: Sistema Automático Cancela Pedidos Expirados

### Fluxo:
1. Job roda diariamente à meia-noite
2. Job busca pedidos pendentes há mais de 24h
3. Job cancela automaticamente

### O Que Acontece:
```javascript
// Jobs/CancelExpiredOrders.js
async handle() {
  const expiredOrders = await Order.query()
    .where('status', 'pending')
    .where('created', '<', Database.raw("NOW() - INTERVAL '24 hours'"))
    .fetch()
  
  console.log(`Cancelando ${expiredOrders.rows.length} pedidos expirados...`)
  
  for (const order of expiredOrders.rows) {
    order.status = 'cancelled'                    // Mudança de status
    order.cancellation_reason = 'Pagamento não confirmado em 24h'
    order.cancelled_at = new Date()
    await order.save()                            // ✅ Hook dispara aqui!
  }
}
```

### Hook Detecta:
```javascript
// Para cada pedido:
// Status mudou: 'pending' → 'cancelled'
// Envia notificação automaticamente
```

### Clientes Recebem:
📲 **"Atualização de Pedido"**  
"O seu pedido #ORD-XXXXX foi cancelado"

---

## 📊 Resumo dos Cenários

| Cenário | Origem | Hook Dispara? | Cliente Notificado? |
|---------|--------|---------------|---------------------|
| 1. Pedido criado | App Mobile | ❌ (usa notifyNewOrder) | ✅ |
| 2. Admin aprova | Painel Web | ✅ | ✅ |
| 3. Pagamento confirmado | Webhook | ✅ | ✅ |
| 4. Entrega confirmada | Webhook | ✅ | ✅ |
| 5. Job processa | Cron Job | ✅ | ✅ |
| 6. Script migração | CLI | ✅ | ✅ |
| 7. Outro backend | Sistema Externo | ✅ | ✅ |
| 8. Admin cancela | Painel Web | ✅ | ✅ |
| 9. Loja confirma | App Lojista | ✅ | ✅ |
| 10. Auto-cancelamento | Cron Job | ✅ | ✅ |

## 🎉 Conclusão

O sistema de notificações desacoplado garante que:

✅ **Cliente sempre é notificado**, independente de quem/como mudou o status  
✅ **Não precisa lembrar** de chamar serviço de notificação manualmente  
✅ **Funciona com múltiplos sistemas** (web, mobile, webhooks, jobs)  
✅ **Consistência total** em todas as origens de mudança  
✅ **Manutenção simplificada** - lógica centralizada no modelo  

---

**Implementado**: 2026-02-01  
**Testado**: Aguardando validação  
**Status**: ✅ Pronto para uso em produção
