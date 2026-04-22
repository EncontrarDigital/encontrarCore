const PricingService = use('App/Modules/Sales/Services/PricingService')
const OrderPaymentsRepository = use('App/Modules/Sales/Repositories/OrderPaymentsRepository')
// const DeliveryService = use('App/Modules/Sales/Repositories/DeliveryService')
const OrderNumberGenerator = use('App/Modules/Sales/Services/OrderNumberGenerator')
const OrderItemRepository = use('App/Modules/Sales/Repositories/OrderItemRepository')
const OrderRepository = use('App/Modules/Sales/Repositories/OrderRepository')
const DeliveryMethodRepository = use('App/Modules/Sales/Repositories/DeliveryMethodRepository')
const OrderDeliveriesRepository = use('App/Modules/Sales/Repositories/OrderDeliveriesRepository')
const PaymentMethodRepository = use('App/Modules/Sales/Repositories/PaymentMethodRepository')
const AddressRepository = use("App/Modules/Utilitarios/Repositories/AddressesRepository");

class OrderFactory {
  async create (orderData, userId, trx, request = null) {
    // 1. Validar entrega   
    const delivery = await this._validateAndProcessDelivery(orderData.delivery)

    // 2. Validar pagamento
    const payment = await this._validateAndProcessPayment(orderData.payment)

    // 3. Processar itens + calcular totais
    const pricing = await PricingService.calculate(
      orderData.items,
      delivery
    )

    // 4. Detectar origem do pedido
    const sourceInfo = this._detectOrderSource(request, orderData)

    // 5. Criar pedido
    const order = await new OrderRepository().create({
      userId: userId || null,
      fullName: orderData.fullName,
      contactEmail: orderData.contactEmail,
      contactPhone: orderData.contactPhone,
      message: orderData.message,
      deliveryId: delivery?.methodId || null,
      paymentId: payment?.methodId || null,
      source: sourceInfo.source,
      source_details: sourceInfo.details
      // total_amount: pricing.total
    })

    if(order){
    // 5. Gerar número do pedido
      const orderNumber = new OrderNumberGenerator().generate(order)

      
      await new OrderRepository().update(
        order.id,
        { order_number: orderNumber }
      )
      
      // Atualizar o objeto order com o order_number gerado
      order.order_number = orderNumber
    }

    for (const item of pricing.items) {
      await new OrderItemRepository().create({
        orderId: order.id,
        productId: item.product_id,
        quantity: item.quantity,
        price: item.price
      })
    }
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

    /**
     * Detectar origem do pedido baseado no request
     * @private
     */
    _detectOrderSource(request, orderData) {
      // Se não houver request, usar dados do orderData (webhook, etc)
      if (!request) {
        return {
          source: orderData.source || 'unknown',
          details: orderData.source_details || null
        }
      }

      const userAgent = request.header('user-agent') || ''
      const ua = userAgent.toLowerCase()
      const referer = request.header('referer') || request.header('origin') || ''
      const ipAddress = request.ip()

      // 1. Verificar headers customizados (mais confiável)
      const customPlatform = request.header('X-Platform') || request.header('x-platform')
      if (customPlatform) {
        return {
          source: customPlatform.toLowerCase(),
          details: {
            user_agent: userAgent,
            app_version: request.header('X-App-Version') || request.header('x-app-version'),
            device_model: request.header('X-Device-Model') || request.header('x-device-model'),
            os_version: request.header('X-OS-Version') || request.header('x-os-version'),
            ip_address: ipAddress
          }
        }
      }

      // 2. Detectar por User-Agent
      let source = 'unknown'
      let platform_type = 'unknown'

      // Mobile App Flutter
      if (ua.includes('encontrarapp')) {
        if (ua.includes('android')) {
          source = 'android'
          platform_type = 'mobile-app'
        } else if (ua.includes('ios')) {
          source = 'ios'
          platform_type = 'mobile-app'
        } else {
          source = 'mobile-app'
          platform_type = 'mobile-app'
        }
      }
      // Dart/Flutter genérico - MELHORADO
      else if (ua.includes('dart')) {
        // Se é Dart mas não tem referer/origin, provavelmente é mobile app
        if (!referer || referer === '') {
          // Tentar detectar pela estrutura do IP
          // IPs privados/internos geralmente indicam mobile app
          if (ipAddress.includes('::ffff:') || ipAddress.includes('100.64.') || ipAddress.includes('10.') || ipAddress.includes('192.168.')) {
            // Não conseguimos distinguir Android de iOS sem mais informações
            // Vamos marcar como mobile-app genérico
            source = 'mobile-app'
            platform_type = 'mobile-app'
          } else {
            source = 'unknown'
            platform_type = 'unknown'
          }
        } else {
          // Se tem referer, pode ser web
          source = 'web'
          platform_type = 'web-app'
        }
      }
      // Web browsers
      else if (ua.includes('mozilla') || ua.includes('chrome') || ua.includes('safari') || ua.includes('firefox')) {
        source = 'web'
        platform_type = 'web-app'
        
        // Detectar browser específico
        if (ua.includes('chrome') && !ua.includes('edg')) {
          source = 'web-chrome'
        } else if (ua.includes('firefox')) {
          source = 'web-firefox'
        } else if (ua.includes('safari') && !ua.includes('chrome')) {
          source = 'web-safari'
        } else if (ua.includes('edg')) {
          source = 'web-edge'
        }
      }
      // API clients
      else if (ua.includes('postman')) {
        source = 'postman'
        platform_type = 'api-client'
      }
      else if (ua.includes('insomnia')) {
        source = 'insomnia'
        platform_type = 'api-client'
      }

      // Extrair versão do app se disponível
      let app_version = 'unknown'
      const versionMatch = ua.match(/encontrarapp\/([\d.]+)/i)
      if (versionMatch) {
        app_version = versionMatch[1]
      }

      return {
        source: source,
        details: {
          user_agent: userAgent,
          platform_type: platform_type,
          app_version: app_version,
          ip_address: ipAddress,
          referer: referer,
          detection_note: ua.includes('dart') && source === 'mobile-app' ? 'Detected as mobile app based on Dart user-agent and network characteristics. Update app to send X-Platform header for precise detection.' : null
        }
      }
    }
}

module.exports = OrderFactory
