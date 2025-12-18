# Postman - Teste de Criação de Ordem

## 1. POST /api/v1/orders - Criar Ordem

**URL:** `http://localhost:3381/api/v1/orders`

**Method:** POST

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "fullName": "João Silva",
  "contactEmail": "joao@example.com",
  "contactPhone": "+351912345678",
  "message": "Entrega rápida, se possível",
  "items": [
    {
      "product_id": 1,
      "quantity": 2
    },
    {
      "product_id": 2,
      "quantity": 1
    }
  ],
  "delivery": {
    "methodId": 1,
    "addressId": null
  },
  "payment": {
    "methodId": 1
  }
}
```

---

## 2. POST /api/v1/orders - Com Endereço Específico

**URL:** `http://localhost:3381/api/v1/orders`

**Method:** POST

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "fullName": "Maria Santos",
  "contactEmail": "maria@example.com",
  "contactPhone": "+351987654321",
  "message": "Deixar na receção",
  "items": [
    {
      "product_id": 1,
      "quantity": 3
    }
  ],
  "delivery": {
    "methodId": 1,
    "addressId": 5
  },
  "payment": {
    "methodId": 2
  }
}
```

---

## 3. GET /api/v1/orders - Listar Todas as Ordens

**URL:** `http://localhost:3381/api/v1/orders?page=1&limit=10`

**Method:** GET

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 4. GET /api/v1/orders/{id} - Obter Detalhes da Ordem

**URL:** `http://localhost:3381/api/v1/orders/1`

**Method:** GET

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## Exemplos de Respostas

### ✅ Sucesso ao Criar Ordem (201 Created)
```json
{
  "data": {
    "id": 1,
    "user_id": null,
    "fullName": "João Silva",
    "contactEmail": "joao@example.com",
    "contactPhone": "+351912345678",
    "message": "Entrega rápida, se possível",
    "order_number": "ORD-20251218-000001",
    "delivery_method_id": 1,
    "delivery_address_id": null,
    "delivery_price": 5.50,
    "payment_method_id": 1,
    "total": 125.50,
    "created": "2025-12-18T10:30:00.000Z",
    "updated": "2025-12-18T10:30:00.000Z",
    "items": [
      {
        "id": 1,
        "order_id": 1,
        "product_id": 1,
        "quantity": 2,
        "price": 50.00
      },
      {
        "id": 2,
        "order_id": 1,
        "product_id": 2,
        "quantity": 1,
        "price": 20.00
      }
    ],
    "delivery_method": {
      "id": 1,
      "name": "Entrega Normal",
      "price": 5.50
    },
    "payment_method": {
      "id": 1,
      "name": "Cartão de Crédito"
    }
  },
  "message": "Registo efectuado com sucesso"
}
```

### ❌ Erro - Stock Insuficiente (422)
```json
{
  "error": "Stock insuficiente para \"iPhone 15\". Disponível: 1"
}
```

### ❌ Erro - Produto Não Encontrado (422)
```json
{
  "error": "Produto 999 não encontrado"
}
```

### ❌ Erro - Método de Entrega Não Encontrado (422)
```json
{
  "error": "Método de entrega não encontrado"
}
```

### ❌ Erro - Ordem Sem Itens (422)
```json
{
  "error": "Ordem deve conter pelo menos um item"
}
```

---

## 📝 Notas

- Substitui `YOUR_JWT_TOKEN` pelo token obtido no login
- Os `product_id`, `delivery.methodId` e `payment.methodId` devem corresponder a registos existentes na base de dados
- O campo `addressId` é opcional - se não fornecido, usa o preço do método de entrega
- O número da ordem é gerado automaticamente com o formato: `ORD-YYYYMMDD-XXXXXX`
- O `total` é calculado automaticamente: soma dos itens + taxa de entrega

---

## 🔄 Fluxo Recomendado para Testes

1. **Primeiro, obtém um JWT token** via `/api/v1/login`
2. **Verifica produtos existentes** para obter IDs válidos
3. **Verifica métodos de entrega** para obter ID válido
4. **Verifica métodos de pagamento** para obter ID válido
5. **Cria uma ordem** com dados válidos
6. **Testa cenários de erro** (stock insuficiente, IDs inválidos, etc)
7. **Consulta a ordem criada** via GET
