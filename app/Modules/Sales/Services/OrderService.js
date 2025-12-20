'use strict'

const Database = use("Database")
const OrderRepository = use("App/Modules/Sales/Repositories/OrderRepository")
const OrderItemRepository = use("App/Modules/Sales/Repositories/OrderItemRepository")
const ProductRepository = use('App/Modules/Catalog/Repositories/ProductsRepository')
const DeliveryMethodRepository = use('App/Modules/Sales/Repositories/DeliveryMethodRepository')
const PaymentMethodRepository = use('App/Modules/Sales/Repositories/PaymentMethodRepository')
const AddressRepository = use('App/Modules/Sales/Repositories/AddressesRepository')
const UserRepository = use('App/Modules/Authentication/Repositories/UsersRepository')
const OrderDeliveriesRepository = use('App/Modules/Sales/Repositories/OrderDeliveriesRepository')
const OrderPaymentsRepository = use('App/Modules/Sales/Repositories/OrderPaymentsRepository')

    class OrderService{
        
    constructor(){}

    async findAllOrders(filters) {
      const search = filters.input("search");
      const options = {
        page: filters.input("page") || 1,
        perPage: filters.input("perPage") || 10,
        orderBy: filters.input("orderBy") || "id",
        typeOrderBy: filters.input("typeOrderBy") || "DESC",
        searchBy: ["name", "description"],
        isPaginate: true
      };
  
      let query = new OrderRepository()
        .findAll(search, options) 
        .where(function () {})//.where('is_deleted', 0)
      return query.paginate(options.page, options.perPage || 10);
    }
    /**
     * Criar uma nova ordem
     * @param {Object} orderData - Dados da ordem (items, delivery, payment, etc)
     * @param {number} userId - ID do utilizador (opcional)
     * @returns {Object} Ordem criada
     */
    async createdOrders(orderData, userId = null) {
      try {
        // 1. Validar e carregar dados relacionados
        if (userId) {
          await this._validateUser(userId)
        }

        // 2. Validar e processar itens
        const items = await this._validateAndProcessItems(orderData.items)

        // 3. Validar método de entrega
        const deliveryData = await this._validateAndProcessDelivery(orderData.delivery)

        // 4. Validar método de pagamento
        const paymentData = await this._validateAndProcessPayment(orderData.payment)

        // 5. Calcular totais
        const totals = this._calculateTotals(items, deliveryData)

        // 6. Preparar payload da ordem - usando nomes de colunas da base de dados actual
        const orderPayload = {
          userId: userId,
          fullName: orderData.fullName,
          contactEmail: orderData.contactEmail,
          contactPhone: orderData.contactPhone,
          message: orderData.message,
          deliveryId: deliveryData.methodId || null,
          paymentId: paymentData.methodId || null,
          total_amount: totals.total,
        }

        // 7. Salvar ordem via Repository (sem audit para evitar timestamps)
        let savedOrder = await new OrderRepository().create(orderPayload, null, false)

        // 8. Gerar número de ordem
        const orderNumber = this._generateOrderNumber(savedOrder)
        const updatedOrder = await new OrderRepository().update(savedOrder.id, { order_number: orderNumber }, null, true, false)

        // 9. Associar itens à ordem
        for (const item of items) {
          const itemPayload = {
            orderId: updatedOrder.id,
            productId: item.product_id,
            quantity: item.quantity,
            price: item.price
          }
          await new OrderItemRepository().create(itemPayload, null, false)
        }

        // 10. Carregar relações
        const finalOrder = await new OrderRepository().findById(updatedOrder.id, '*', ['items']).first()

        return finalOrder
      } catch (error) {
        console.error('Erro ao criar ordem:', error.message)
        throw error
      }
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
    async _validateAndProcessDelivery(deliveryData) {
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
    async _validateAndProcessPayment(paymentData) {
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
     * Gerar número de ordem único
     * @private
     */
    _generateOrderNumber(order) {
      const date = new Date()
      const year = date.getFullYear()
      const orderId = String(order.id).padStart(6, '0')
      return `Enc${year}/${orderId}`
    }
     
   
    /**
     *
     * @param {*} Id
     * @returns
     */
    async findOrderById(Id) {
      return await new OrderRepository().findById(Id) 
        //.where('is_deleted', 0)
        .first();
    }

    /**
     *
     * @param {*} Payload
     * @param {*} Id
     * @returns
     */
    async updatedOrder(Id, ModelPayload) {
      return await new OrderRepository().update(Id, ModelPayload);
    } 
  
    /**
     * @author "caniggiamoreira@gmail.com"
     * @deprecated "Elimina os dados de forma temporariamente."
     * @param {*} Id 
     * @returns 
     */
    async deleteTemporarilyOrder(Id) {
      return await new OrderRepository().delete(Id); 
    }

    /**
     * @author "caniggiamoreira@gmail.com"
     * @deprecated "Elimina os dados de definitivamente."
     * @param {*} Id 
     * @returns 
    */
    async deleteDefinitiveOrder(Id) {
      return await new OrderRepository().deleteDefinitive(Id); 
    }

    /**
     * @author "caniggiamoreira@gmail.com"
     * @deprecated "Listar Lixeira -  registos eliminados temporariamente."
     * @param {*} Payload 
     * @returns 
     */ 
    async findAllOrdersTrash(filters) {
        const options = {
        ...new OrderRepository().setOptions(filters),
        typeOrderBy: "DESC",
        };
        let query = new OrderRepository()
        .findTrash(options.search, options) 
        .where(function () {})//.where('is_deleted', 1)
        return query.paginate(options.page, options.perPage || 10);
    }
    
    }
    module.exports = OrderService
    