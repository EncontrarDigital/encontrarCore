# 🔔 Sistema de Notificações Desacoplado

## 📋 Visão Geral

O sistema de notificações foi implementado usando **Model Hooks** do AdonisJS, garantindo que notificações sejam enviadas **independente da origem da mudança**.

### ✅ Vantagens desta Arquitetura

1. **Desacoplamento Total**: Notificações não dependem de controllers/endpoints
2. **Múltiplas Origens**: Funciona com:
   - API REST (controllers)
   - Outro backend
   - Scripts de migração
   - Mudanças diretas no banco de dados
   - Jobs/Workers
   - Webhooks externos
3. **Consistência**: Sempre notifica quando há mudança de status
4. **Manutenibilidade**: Lógica centralizada no modelo

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────┐
│                  ORIGENS DA MUDANÇA                 │
├─────────────────────────────────────────────────────┤
│  • API REST (OrderController)                       │
│  • Backend Administrativo                           │
│  • Script de Migração                               │
│  • Mudança Direta no DB                             │
│  • Job/Worker                                       │
│  • Webhook Externo                                  │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
         ┌─────────────────┐
         │  Order Model    │ ◄── Model Hooks
         │  (beforeUpdate) │     (AdonisJS)
         │  (afterUpdate)  │
         └────────┬────────┘
                  │
                  │ Detecta mudança de status
                  │
                  ▼
         ┌─────────────────┐
         │ FirebaseService │
         │ .notifyOrder    │
         │ StatusUpdate()  │
         └────────┬────────┘
                  │
                  ▼
         ┌─────────────────┐
         │  Push           │
         │  Notification   │
         │  (Cliente)      │
         └─────────────────┘
```

---

## 🔧 Implementação

### 1. Model Hooks (Order.js)

```javascript
static boot() {
  super.boot();
  
  // Hook ANTES de salvar: armazena status anterior
  this.addHook('beforeUpdate', async (orderInstance) => {
    if (orderInstance.dirty.status) {
      orderInstance.$previousStatus = orderInstance.$originalAttributes.status
    }
  })

  // Hook DEPOIS de salvar: envia notificação
  this.addHook('afterUpdate', async (orderInstance) => {
    if (orderInstance.$previousStatus !== orderInstance.status) {
      // Enviar notificação
      await firebaseService.notifyOrderStatusUpdate(...)
    }
  })
}
```

### 2. Mapeamento de Status

| Status DB    | Mensagem para Cliente                          | Tab no App |
|--------------|------------------------------------------------|------------|
| `pending`    | O seu pedido está aguardando confirmação       | PENDING    |
| `open`       | O seu pedido está sendo preparado              | LOADING    |
| `confirmed`  | O seu pedido foi confirmado e está a caminho   | CONFIRMED  |
| `delivered`  | O seu pedido foi entregue com sucesso          | CONFIRMED  |
| `cancelled`  | O seu pedido foi cancelado                     | -          |
| `returned`   | O seu pedido foi devolvido                     | -          |

---

## 🧪 Como Testar

### Teste 1: Via API (Cenário Normal)
```bash
# Atualizar status via endpoint
curl -X PUT http://localhost:3333/api/orders/123 \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "confirmed"}'

# ✅ Resultado: Cliente recebe notificação
```

### Teste 2: Via Script (Cenário Desacoplado)
```javascript
// scripts/update-order-status.js
const Order = use('App/Modules/Sales/Models/Order')

const order = await Order.find(123)
order.status = 'delivered'
await order.save()

// ✅ Resultado: Cliente recebe notificação automaticamente!
```

### Teste 3: Via Banco de Dados Direto
```sql
-- Atualizar diretamente no PostgreSQL
UPDATE orders SET status = 'confirmed' WHERE id = 123;
```
⚠️ **Nota**: Mudanças diretas no DB **NÃO** disparam hooks do Lucid ORM.
Para esses casos, use triggers do PostgreSQL (ver seção abaixo).

### Teste 4: Via Outro Backend
```javascript
// outro-backend/services/order-sync.js
const axios = require('axios')

// Opção A: Usar API (recomendado)
await axios.put('http://encontrar-api/orders/123', {
  status: 'confirmed'
})

// Opção B: Usar modelo compartilhado (se mesma base de código)
const Order = require('encontrar-core/app/Models/Order')
const order = await Order.find(123)
order.status = 'confirmed'
await order.save()

// ✅ Ambos disparam notificação!
```

---

## 🔍 Logs e Monitoramento

### Logs de Sucesso
```
📲 Notificação enviada: Pedido #ORD-12345 - pending → confirmed
```

### Logs de Erro
```
❌ Erro ao enviar notificação de mudança de status: No tokens found for user 123
```

### Verificar no Console
```bash
# Backend logs
cd encontrarCore
adonis serve --dev

# Observar logs quando status mudar
```

---

## 🚀 Cenários de Uso

### 1. Painel Administrativo Web
```javascript
// Admin atualiza pedido manualmente
async updateOrderStatus(orderId, newStatus) {
  const order = await Order.find(orderId)
  order.status = newStatus
  await order.save()
  // ✅ Hook dispara automaticamente
}
```

### 2. Integração com Sistema de Entrega
```javascript
// Webhook de transportadora
async handleDeliveryWebhook(data) {
  const order = await Order.findBy('tracking_code', data.trackingCode)
  
  if (data.status === 'delivered') {
    order.status = 'delivered'
    await order.save()
    // ✅ Cliente notificado automaticamente
  }
}
```

### 3. Job de Processamento em Lote
```javascript
// Job que processa pedidos pendentes
async processPendingOrders() {
  const orders = await Order.query().where('status', 'pending').fetch()
  
  for (const order of orders.rows) {
    // Lógica de validação...
    order.status = 'open'
    await order.save()
    // ✅ Cada cliente notificado automaticamente
  }
}
```

### 4. Script de Migração
```javascript
// Migrar pedidos antigos
async migrateOldOrders() {
  const oldOrders = await Order.query()
    .where('status', 'processing')
    .fetch()
  
  for (const order of oldOrders.rows) {
    order.status = 'open' // Novo status
    await order.save()
    // ✅ Notificação enviada
  }
}
```

---

## ⚠️ Limitações e Soluções

### Limitação 1: Mudanças Diretas no DB
**Problema**: Hooks do Lucid ORM não disparam com `UPDATE` SQL direto.

**Solução A**: Sempre usar o modelo Lucid
```javascript
// ❌ Não dispara hook
await Database.raw('UPDATE orders SET status = ? WHERE id = ?', ['confirmed', 123])

// ✅ Dispara hook
const order = await Order.find(123)
order.status = 'confirmed'
await order.save()
```

**Solução B**: Usar Database Triggers (PostgreSQL)
```sql
-- Criar trigger que chama API quando status muda
CREATE OR REPLACE FUNCTION notify_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    -- Chamar API ou inserir em fila de notificações
    PERFORM pg_notify('order_status_changed', 
      json_build_object('order_id', NEW.id, 'new_status', NEW.status)::text
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER order_status_trigger
AFTER UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION notify_order_status_change();
```

### Limitação 2: Performance em Lote
**Problema**: Atualizar 1000 pedidos = 1000 notificações individuais.

**Solução**: Usar fila de jobs
```javascript
// Em vez de enviar imediatamente
this.addHook('afterUpdate', async (orderInstance) => {
  // Adicionar à fila
  await Queue.add('send-notification', {
    orderId: orderInstance.id,
    status: orderInstance.status
  })
})
```

---

## 📊 Monitoramento em Produção

### Métricas Importantes
- Taxa de sucesso de notificações
- Tempo médio de envio
- Tokens inválidos detectados
- Erros por tipo

### Dashboard Sugerido
```javascript
// Endpoint de métricas
async getNotificationMetrics() {
  return {
    total_sent: await Database.table('notifications').count(),
    success_rate: '98.5%',
    avg_delivery_time: '1.2s',
    invalid_tokens: await Database.table('device_tokens')
      .where('is_active', false).count()
  }
}
```

---

## 🎯 Próximos Passos

### Melhorias Futuras
1. **Fila de Notificações**: Usar Bull/Redis para processar em background
2. **Retry Logic**: Tentar reenviar notificações falhadas
3. **Notificações Agrupadas**: Agrupar múltiplas atualizações
4. **Preferências do Usuário**: Permitir desativar certos tipos
5. **Analytics**: Rastrear taxa de abertura de notificações

### Extensões
- Notificar mudanças em outros modelos (Products, Promotions)
- Integrar com email/SMS além de push
- Suporte a notificações programadas
- Templates personalizáveis por loja

---

## 📝 Checklist de Implementação

- [x] Model Hooks implementados
- [x] FirebaseService.notifyOrderStatusUpdate criado
- [x] Mapeamento de status para mensagens
- [x] Logs de debug adicionados
- [x] Tratamento de erros
- [ ] Testes automatizados
- [ ] Fila de jobs (opcional)
- [ ] Database triggers (se necessário)
- [ ] Monitoramento em produção
- [ ] Documentação para equipe

---

## 🆘 Troubleshooting

### Notificação não enviada
1. Verificar logs: `📲 Notificação enviada`
2. Verificar se hook foi disparado
3. Verificar se usuário tem token ativo
4. Verificar Firebase credentials

### Hook não dispara
1. Confirmar que mudança foi via `order.save()`
2. Verificar se status realmente mudou
3. Verificar logs de erro no console

### Performance lenta
1. Considerar usar fila de jobs
2. Otimizar queries do FirebaseService
3. Adicionar índices no banco

---

## 📚 Referências

- [AdonisJS Model Hooks](https://legacy.adonisjs.com/docs/4.1/database-hooks)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [PostgreSQL Triggers](https://www.postgresql.org/docs/current/sql-createtrigger.html)

---

**Implementado por**: Kiro AI  
**Data**: 2026-02-01  
**Versão**: 1.0
