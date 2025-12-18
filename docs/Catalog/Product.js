/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     security:
 *     - bearerAuth: []
 *     tags:
 *       - Products
 *     summary: Listar todos os produtos
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
 *         description: Lista de produtos recuperada com sucesso
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
 * /api/v1/products:
 *   post:
 *     security:
 *     - bearerAuth: []
 *     tags:
 *       - Products
 *     summary: Criar novo produto
 *     parameters:
 *       - name: name
 *         description: Nome do produto
 *         in: formData
 *         type: string
 *         required: true
 *       - name: description
 *         description: Descrição do produto
 *         in: formData
 *         type: string
 *         required: false
 *       - name: price
 *         description: Preço do produto
 *         in: formData
 *         type: number
 *         required: true
 *       - name: category_id
 *         description: ID da categoria
 *         in: formData
 *         type: integer
 *         required: true
 *       - name: stock
 *         description: Quantidade em stock
 *         in: formData
 *         type: integer
 *         required: false
 *     responses:
 *       201:
 *         description: Produto criado com sucesso
 *         example:
 *           data:
 *             id: 1
 *             name: "iPhone 15"
 *             price: 999.99
 *             category_id: 1
 *       422:
 *         description: Erro de validação
 */

/**
 * @swagger
 * /api/v1/products/{id}:
 *   get:
 *     security:
 *     - bearerAuth: []
 *     tags:
 *       - Products
 *     summary: Obter detalhes de um produto
 *     parameters:
 *       - name: id
 *         description: ID do produto
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: Produto encontrado
 *         example:
 *           data:
 *             id: 1
 *             name: "iPhone 15"
 *             description: "Latest iPhone model"
 *             price: 999.99
 *       404:
 *         description: Produto não encontrado
 */

/**
 * @swagger
 * /api/v1/products/{id}:
 *   put:
 *     security:
 *     - bearerAuth: []
 *     tags:
 *       - Products
 *     summary: Atualizar produto
 *     parameters:
 *       - name: id
 *         description: ID do produto
 *         in: path
 *         required: true
 *         type: integer
 *       - name: name
 *         description: Nome do produto
 *         in: formData
 *         type: string
 *         required: false
 *       - name: description
 *         description: Descrição do produto
 *         in: formData
 *         type: string
 *         required: false
 *       - name: price
 *         description: Preço do produto
 *         in: formData
 *         type: number
 *         required: false
 *       - name: category_id
 *         description: ID da categoria
 *         in: formData
 *         type: integer
 *         required: false
 *     responses:
 *       200:
 *         description: Produto atualizado com sucesso
 *         example:
 *           data:
 *             id: 1
 *             name: "iPhone 15 Pro"
 *             price: 1099.99
 *       404:
 *         description: Produto não encontrado
 */

/**
 * @swagger
 * /api/v1/products/{id}:
 *   delete:
 *     security:
 *     - bearerAuth: []
 *     tags:
 *       - Products
 *     summary: Eliminar produto
 *     parameters:
 *       - name: id
 *         description: ID do produto
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: Produto eliminado com sucesso
 *         example:
 *           message: "Produto eliminado com sucesso"
 *       404:
 *         description: Produto não encontrado
 */
