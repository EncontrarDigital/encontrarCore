/**
 * @swagger
 * /api/v1/shops:
 *   get:
 *     security:
 *     - bearerAuth: []
 *     tags:
 *       - Shops
 *     summary: Listar todas as lojas
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
 *     responses:
 *       200:
 *         description: Lista de lojas recuperada com sucesso
 *         example:
 *           data:
 *             - id: 1
 *               name: "Loja Centro"
 *               address: "Rua Principal, 123"
 *               city: "Lisboa"
 *       401:
 *         description: Não autorizado
 */

/**
 * @swagger
 * /api/v1/shops:
 *   post:
 *     security:
 *     - bearerAuth: []
 *     tags:
 *       - Shops
 *     summary: Criar nova loja
 *     parameters:
 *       - name: name
 *         description: Nome da loja
 *         in: formData
 *         type: string
 *         required: true
 *       - name: address
 *         description: Endereço da loja
 *         in: formData
 *         type: string
 *         required: true
 *       - name: city
 *         description: Cidade
 *         in: formData
 *         type: string
 *         required: true
 *       - name: phone
 *         description: Telefone de contacto
 *         in: formData
 *         type: string
 *         required: false
 *     responses:
 *       201:
 *         description: Loja criada com sucesso
 *         example:
 *           data:
 *             id: 1
 *             name: "Loja Centro"
 *             address: "Rua Principal, 123"
 *             city: "Lisboa"
 *       422:
 *         description: Erro de validação
 */

/**
 * @swagger
 * /api/v1/shops/{id}:
 *   get:
 *     security:
 *     - bearerAuth: []
 *     tags:
 *       - Shops
 *     summary: Obter detalhes de uma loja
 *     parameters:
 *       - name: id
 *         description: ID da loja
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: Loja encontrada
 *         example:
 *           data:
 *             id: 1
 *             name: "Loja Centro"
 *             address: "Rua Principal, 123"
 *             city: "Lisboa"
 *       404:
 *         description: Loja não encontrada
 */

/**
 * @swagger
 * /api/v1/shops/{id}:
 *   put:
 *     security:
 *     - bearerAuth: []
 *     tags:
 *       - Shops
 *     summary: Atualizar loja
 *     parameters:
 *       - name: id
 *         description: ID da loja
 *         in: path
 *         required: true
 *         type: integer
 *       - name: name
 *         description: Nome da loja
 *         in: formData
 *         type: string
 *         required: false
 *       - name: address
 *         description: Endereço da loja
 *         in: formData
 *         type: string
 *         required: false
 *       - name: city
 *         description: Cidade
 *         in: formData
 *         type: string
 *         required: false
 *       - name: phone
 *         description: Telefone de contacto
 *         in: formData
 *         type: string
 *         required: false
 *     responses:
 *       200:
 *         description: Loja atualizada com sucesso
 *         example:
 *           data:
 *             id: 1
 *             name: "Loja Centro - Sede"
 *       404:
 *         description: Loja não encontrada
 */

/**
 * @swagger
 * /api/v1/shops/{id}:
 *   delete:
 *     security:
 *     - bearerAuth: []
 *     tags:
 *       - Shops
 *     summary: Eliminar loja
 *     parameters:
 *       - name: id
 *         description: ID da loja
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: Loja eliminada com sucesso
 *         example:
 *           message: "Loja eliminada com sucesso"
 *       404:
 *         description: Loja não encontrada
 */
