/**
 * @swagger
 * /api/v1/categories:
 *   get:
 *     security:
 *     - bearerAuth: []
 *     tags:
 *       - Categories
 *     summary: Listar todas as categorias
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
 *         description: Lista de categorias recuperada com sucesso
 *         example:
 *           data:
 *             - id: 1
 *               name: "Electronics"
 *               description: "Electronic products"
 *       401:
 *         description: Não autorizado
 */

/**
 * @swagger
 * /api/v1/categories:
 *   post:
 *     security:
 *     - bearerAuth: []
 *     tags:
 *       - Categories
 *     summary: Criar nova categoria
 *     parameters:
 *       - name: name
 *         description: Nome da categoria
 *         in: formData
 *         type: string
 *         required: true
 *       - name: description
 *         description: Descrição da categoria
 *         in: formData
 *         type: string
 *         required: false
 *     responses:
 *       201:
 *         description: Categoria criada com sucesso
 *         example:
 *           data:
 *             id: 1
 *             name: "Electronics"
 *             description: "Electronic products"
 *       422:
 *         description: Erro de validação
 */

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   get:
 *     security:
 *     - bearerAuth: []
 *     tags:
 *       - Categories
 *     summary: Obter detalhes de uma categoria
 *     parameters:
 *       - name: id
 *         description: ID da categoria
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: Categoria encontrada
 *         example:
 *           data:
 *             id: 1
 *             name: "Electronics"
 *             description: "Electronic products"
 *       404:
 *         description: Categoria não encontrada
 */

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   put:
 *     security:
 *     - bearerAuth: []
 *     tags:
 *       - Categories
 *     summary: Atualizar categoria
 *     parameters:
 *       - name: id
 *         description: ID da categoria
 *         in: path
 *         required: true
 *         type: integer
 *       - name: name
 *         description: Nome da categoria
 *         in: formData
 *         type: string
 *         required: false
 *       - name: description
 *         description: Descrição da categoria
 *         in: formData
 *         type: string
 *         required: false
 *     responses:
 *       200:
 *         description: Categoria atualizada com sucesso
 *         example:
 *           data:
 *             id: 1
 *             name: "Electronics & Gadgets"
 *       404:
 *         description: Categoria não encontrada
 */

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   delete:
 *     security:
 *     - bearerAuth: []
 *     tags:
 *       - Categories
 *     summary: Eliminar categoria
 *     parameters:
 *       - name: id
 *         description: ID da categoria
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: Categoria eliminada com sucesso
 *         example:
 *           message: "Categoria eliminada com sucesso"
 *       404:
 *         description: Categoria não encontrada
 */
