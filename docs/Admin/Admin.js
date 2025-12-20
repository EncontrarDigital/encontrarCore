/**
 * @swagger
 * /api/admin/products/shop:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Admin
 *     summary: Obter produtos da loja do utilizador autenticado
 *     parameters:
 *       - name: page
 *         description: Número da página
 *         in: query
 *         type: integer
 *       - name: limit
 *         description: Quantidade de registos por página
 *         in: query
 *         type: integer
 *       - name: search
 *         description: Pesquisar por nome
 *         in: query
 *         type: string
 *       - name: category_id
 *         description: Filtrar por categoria
 *         in: query
 *         type: integer
 *     responses:
 *       200:
 *         description: Lista de produtos da loja recuperada com sucesso
 *         example:
 *           data:
 *             - id: 1
 *               name: "iPhone 15"
 *               description: "Latest iPhone model"
 *               price: 999.99
 *               category_id: 1
 *       401:
 *         description: Não autorizado
 */

/**
 * @swagger
 * /api/admin/shop/info:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Admin
 *     summary: Obter informações da loja do utilizador autenticado
 *     responses:
 *       200:
 *         description: Informações da loja recuperadas com sucesso
 *         example:
 *           data:
 *             id: 1
 *             name: "Minha Loja"
 *             description: "Descrição da loja"
 *             userId: 1
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Loja não encontrada
 */

/**
 * @swagger
 * /api/admin/shop/orders:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Admin
 *     summary: Obter todas as encomendas da loja do utilizador autenticado
 *     parameters:
 *       - name: page
 *         description: Número da página
 *         in: query
 *         type: integer
 *       - name: limit
 *         description: Quantidade de registos por página
 *         in: query
 *         type: integer
 *       - name: search
 *         description: Pesquisar por número de encomenda ou cliente
 *         in: query
 *         type: string
 *       - name: status
 *         description: Estado da Encomenda
 *         in: query
 *         type: string
 *     responses:
 *       200:
 *         description: Lista de encomendas da loja recuperada com sucesso
 *         example:
 *           data:
 *             - id: 1
 *               order_number: "ORD-2024-001"
 *               userId: 1
 *               fullName: "João Silva"
 *               total_amount: 199.99
 *       401:
 *         description: Não autorizado
 */

/**
 * @swagger
 * /api/admin/order/{id}/acceptOrderByShop:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Admin
 *     summary: Aceitar encomenda pela loja
 *     parameters:
 *       - name: id
 *         description: ID da encomenda
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       201:
 *         description: Encomenda aceite com sucesso
 *         example:
 *           data:
 *             id: 1
 *             status: "accepted"
 *           message: "Pedido Aceite com sucesso"
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Encomenda não encontrada
 */

/**
 * @swagger
 * /api/admin/order/{id}/cancelOrderByShop:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Admin
 *     summary: Cancelar encomenda pela loja
 *     parameters:
 *       - name: id
 *         description: ID da encomenda
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       201:
 *         description: Encomenda cancelada com sucesso
 *         example:
 *           data:
 *             id: 1
 *             status: "cancelled"
 *           message: "Pedido Cancelado com sucesso"
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Encomenda não encontrada
 */

