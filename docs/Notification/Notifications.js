/**
 * @swagger
 * /api/notifications:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Notifications
 *     summary: Listar todas as notificações do utilizador autenticado
 *     parameters:
 *       - name: page
 *         description: Número da página
 *         in: query
 *         type: integer
 *       - name: limit
 *         description: Quantidade de registos por página
 *         in: query
 *         type: integer
 *     responses:
 *       200:
 *         description: Lista de notificações recuperada com sucesso
 *         example:
 *           data:
 *             - id: 1
 *               title: "Novo pedido"
 *               message: "Você recebeu um novo pedido #123"
 *               type: "order"
 *               is_read: false
 *               created_at: "2023-01-01T12:00:00.000Z"
 *       401:
 *         description: Não autorizado
 */

/**
 * @swagger
 * /api/notifications:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Notifications
 *     summary: Criar uma nova notificação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - message
 *               - type
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Novo pedido"
 *               message:
 *                 type: string
 *                 example: "Você recebeu um novo pedido #123"
 *               type:
 *                 type: string
 *                 example: "order"
 *     responses:
 *       201:
 *         description: Notificação criada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 */

/**
 * @swagger
 * /api/notifications/{id}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Notifications
 *     summary: Obter detalhes de uma notificação
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: string
 *         description: ID da notificação
 *     responses:
 *       200:
 *         description: Detalhes da notificação
 *         example:
 *           data:
 *             id: 1
 *             title: "Novo pedido"
 *             message: "Você recebeu um novo pedido #123"
 *             type: "order"
 *             is_read: false
 *             created_at: "2023-01-01T12:00:00.000Z"
 *       404:
 *         description: Notificação não encontrada
 *       401:
 *         description: Não autorizado
 */

/**
 * @swagger
 * /api/notifications/{id}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Notifications
 *     summary: Atualizar uma notificação
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: string
 *         description: ID da notificação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Pedido atualizado"
 *               message:
 *                 type: string
 *                 example: "O status do seu pedido #123 foi atualizado"
 *               type:
 *                 type: string
 *                 example: "order"
 *               is_read:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Notificação atualizada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Notificação não encontrada
 */

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Notifications
 *     summary: Excluir uma notificação
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: string
 *         description: ID da notificação
 *     responses:
 *       200:
 *         description: Notificação excluída com sucesso
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Notificação não encontrada
 */
