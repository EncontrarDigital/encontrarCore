/**
 * @swagger
 * tags:
 *   name: Addresses
 *   description: Endpoints para gestão de endereços
 */

/**
 * @swagger
 * /api/adresses:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags: [Addresses]
 *     summary: Listar todos os endereços
 *     parameters:
 *       - name: page
 *         in: query
 *         description: Número da página
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: perPage
 *         in: query
 *         description: Itens por página
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Lista de endereços
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Address'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /api/adresses/buildAddressTree:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags: [Addresses]
 *     summary: Obter árvore hierárquica de endereços
 *     responses:
 *       200:
 *         description: Árvore de endereços retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AddressTreeNode'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /api/adresses:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     tags: [Addresses]
 *     summary: Criar um novo endereço
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAddressInput'
 *     responses:
 *       201:
 *         description: Endereço criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Address'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /api/adresses/{id}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags: [Addresses]
 *     summary: Obter detalhes de um endereço
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do endereço
 *     responses:
 *       200:
 *         description: Detalhes do endereço
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Address'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * /api/adresses/{id}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     tags: [Addresses]
 *     summary: Atualizar um endereço
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do endereço
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAddressInput'
 *     responses:
 *       200:
 *         description: Endereço atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Address'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * /api/adresses/{id}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     tags: [Addresses]
 *     summary: Excluir um endereço
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do endereço
 *     responses:
 *       204:
 *         description: Endereço excluído com sucesso
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Address:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: "Endereço Principal"
 *         address_line1:
 *           type: string
 *           example: "Rua Exemplo, 123"
 *         address_line2:
 *           type: string
 *           example: "Apto 101"
 *         city:
 *           type: string
 *           example: "São Paulo"
 *         state:
 *           type: string
 *           example: "SP"
 *         postal_code:
 *           type: string
 *           example: "01234-567"
 *         country:
 *           type: string
 *           example: "Brasil"
 *         is_primary:
 *           type: boolean
 *           example: true
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *
 *     AddressTreeNode:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: "São Paulo"
 *         children:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AddressTreeNode'
 *
 *     CreateAddressInput:
 *       type: object
 *       required:
 *         - name
 *         - address_line1
 *         - city
 *         - state
 *         - postal_code
 *         - country
 *       properties:
 *         name:
 *           type: string
 *           example: "Casa"
 *         address_line1:
 *           type: string
 *           example: "Rua Exemplo, 123"
 *         address_line2:
 *           type: string
 *           example: "Apto 101"
 *         city:
 *           type: string
 *           example: "São Paulo"
 *         state:
 *           type: string
 *           example: "SP"
 *         postal_code:
 *           type: string
 *           example: "01234-567"
 *         country:
 *           type: string
 *           example: "Brasil"
 *         is_primary:
 *           type: boolean
 *           example: false
 *
 *     UpdateAddressInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Trabalho"
 *         address_line1:
 *           type: string
 *           example: "Av. Paulista, 1000"
 *         address_line2:
 *           type: string
 *           example: "10º andar"
 *         city:
 *           type: string
 *           example: "São Paulo"
 *         state:
 *           type: string
 *           example: "SP"
 *         postal_code:
 *           type: string
 *           example: "01310-100"
 *         country:
 *           type: string
 *           example: "Brasil"
 *         is_primary:
 *           type: boolean
 *           example: true
 */

/**
 * @swagger
 * components:
 *   responses:
 *     UnauthorizedError:
 *       description: Acesso não autorizado
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: "E_UNAUTHORIZED_ACCESS: Unauthorized"
 *
 *     NotFoundError:
 *       description: Recurso não encontrado
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: "E_ROW_NOT_FOUND: Cannot find database row for addresses"
 *
 *     ValidationError:
 *       description: Erro de validação
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: "E_VALIDATION_FAILED: Validation failed"
 *               errors:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     field:
 *                       type: string
 *                       example: "name"
 *                     message:
 *                       type: string
 *                       example: "O nome é obrigatório"
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
