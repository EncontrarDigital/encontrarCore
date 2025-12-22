const PricingService = use('App/Modules/Sales/Services/PricingService')
const OrderPaymentsRepository = use('App/Modules/Sales/Repositories/OrderPaymentsRepository')
// const DeliveryService = use('App/Modules/Sales/Repositories/DeliveryService')
const OrderNumberGenerator = use('App/Modules/Sales/Services/OrderNumberGenerator')
const OrderItemRepository = use('App/Modules/Sales/Repositories/OrderItemRepository')
const OrderRepository = use('App/Modules/Sales/Repositories/OrderRepository')
const DeliveryMethodRepository = use('App/Modules/Sales/Repositories/DeliveryMethodRepository')
const OrderDeliveriesRepository = use('App/Modules/Sales/Repositories/OrderDeliveriesRepository')
const PaymentMethodRepository = use('App/Modules/Sales/Repositories/PaymentMethodRepository')

class OrderFactory {
  async create (orderData, userId, trx) {
    // 1. Validar entrega   
    const delivery = await this._validateAndProcessDelivery(orderData.delivery)

    // 2. Validar pagamento
    const payment = await this._validateAndProcessPayment(orderData.payment)

    // 3. Processar itens + calcular totais
    const pricing = await PricingService.calculate(
      orderData.items,
      delivery
    )

    // 4. Criar pedido
    const order = await new OrderRepository().create({
      userId,
      fullName: orderData.fullName,
      contactEmail: orderData.contactEmail,
      contactPhone: orderData.contactPhone,
      message: orderData.message,
      deliveryId: delivery?.methodId || null,
      paymentId: payment?.methodId || null,
      // total_amount: pricing.total
    })

    if(order){
    // 5. Gerar número do pedido
      const orderNumber = new OrderNumberGenerator().generate(order)

      
      await new OrderRepository().update(
        order.id,
        { order_number: orderNumber }
      )
    }

    // 6. Criar itens
    let items = []

    for (const item of pricing.items) {
      const createdItem = await new OrderItemRepository().create({
        orderId: order.id,
        productId: item.product_id,
        quantity: item.quantity,
        price: item.price
      })

      // items.push(createdItem)
    }

    
    await order.load('items')
    return order
  }

  
    /**
     * Validar utilizador
     * @private
     */
    async _validateUser(userId) {
      const user = await new UserRepository()
        .findAll('', { searchBy: 'id' })
        .where('id', userId)
        .first()

      if (!user) {
        throw new Error('Utilizador não encontrado')
      }

      return user
    }

    /**
     * Validar e processar itens da ordem
     * @private
     */
    async _validateAndProcessItems(items) {
      if (!items || !Array.isArray(items) || items.length === 0) {
        throw new Error('Ordem deve conter pelo menos um item')
      }

      const processedItems = []

      for (const itemData of items) {
        if (!itemData.product_id || !itemData.quantity) {
          throw new Error('Item inválido: product_id e quantity são obrigatórios')
        }

        // Buscar produto
        const product = await new ProductRepository()
          .findAll('', { searchBy: 'id' })
          .where('id', itemData.product_id)
          .first()

        if (!product) {
          throw new Error(`Produto ${itemData.product_id} não encontrado`)
        }

        // Validar stock
        if (product.stock < itemData.quantity) {
          throw new Error(`Stock insuficiente para "${product.name}". Disponível: ${product.stock}`)
        }

        processedItems.push({
          product_id: product.id,
          quantity: itemData.quantity,
          price: product.price
        })
      }

      return processedItems
    }

    /**
     * Validar e processar método de entrega
     * @private
     */
    async _validateAndProcessDelivery(deliveryData, trx) {
      if (!deliveryData || !deliveryData.methodId) {
        throw new Error('Método de entrega é obrigatório')
      }

      // Buscar método de entrega
      const deliveryMethod = await new DeliveryMethodRepository()
        .findAll('', { searchBy: 'id' })
        .where('id', deliveryData.methodId)
        .first()

      if (!deliveryMethod) {
        throw new Error('Método de entrega não encontrado')
      }

      let price = deliveryMethod.price
      let addressId = null

      // Se houver endereço com preço específico, sobrepõe
      if (deliveryData.addressId) {
        const address = await new AddressRepository()
          .findAll('', { searchBy: 'id' })
          .where('id', deliveryData.addressId)
          .first()

        if (address && address.price) {
          price = address.price
          addressId = address.id
        }
      }

      // Criar registo em order_deliveries via Repository
      const deliveryPayload = {
        deliveryStatus: 'pending',
        address: deliveryData.address || 'N/A',
        city: deliveryData.city || 'N/A',
        postalCode: deliveryData.postalCode || 'N/A',
        country: deliveryData.country || 'N/A',
        methodId: deliveryMethod.id,
        price: price,
        addressEntityId: addressId || null
      }
      const orderDelivery = await new OrderDeliveriesRepository().create(deliveryPayload)
      return {
        methodId: orderDelivery.id,
        addressId: addressId,
        price: price
      }
    }

    /**
     * Validar e processar método de pagamento
     * @private
     */
    async _validateAndProcessPayment(paymentData, trx) {
      if (!paymentData || !paymentData.methodId) {
        throw new Error('Método de pagamento é obrigatório')
      }

      // Buscar método de pagamento
      const paymentMethod = await new PaymentMethodRepository()
        .findAll('', { searchBy: 'id' })
        .where('id', paymentData.methodId)
        .first()

      if (!paymentMethod) {
        throw new Error('Método de pagamento não encontrado')
      }

      // Criar registo em order_payments via Repository
      const paymentPayload = {
        paymentStatus: 'pending',
        methodId: paymentMethod.id
      }
      const orderPayment = await new OrderPaymentsRepository().create(paymentPayload)

      return {
        methodId: orderPayment.id
      }
    }

    /**
     * Calcular totais da ordem
     * @private
     */
    _calculateTotals(items, deliveryData) {
      const itemsTotal = items.reduce((acc, item) => {
        return acc + (item.price * item.quantity)
      }, 0)

      const deliveryPrice = deliveryData.price || 0
      const total = itemsTotal + deliveryPrice

      return {
        itemsTotal: Math.round(itemsTotal * 100) / 100,
        deliveryPrice: deliveryPrice,
        total: Math.round(total * 100) / 100
      }
    }
}

module.exports = OrderFactory
