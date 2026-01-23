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
 *         type: integer
 *         default: 1
 *       - name: perPage
 *         in: query
 *         description: Itens por página
 *         required: false
 *         type: integer
 *         default: 10
 *     responses:
 *       200:
 *         description: Lista de endereços
 *         schema:
 *           type: object
 *           properties:
 *             data:
 *               type: array
 *               items:
 *                 $ref: '#/definitions/Address'
 *             meta:
 *               $ref: '#/definitions/PaginationMeta'
 *       401:
 *         $ref: '#/responses/UnauthorizedError'
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
 *         schema:
 *           type: object
 *           properties:
 *             data:
 *               type: array
 *               items:
 *                 $ref: '#/definitions/AddressTreeNode'
 *       401:
 *         $ref: '#/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /api/adresses/getDeliveryTaxByCityName:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags: [Addresses]
 *     summary: Obter taxa de entrega por nome da cidade
 *     parameters:
 *       - name: addressName
 *         in: query
 *         description: Nome da cidade/endereço
 *         required: true
 *         type: string
 *         example: "Talatona"
 *     responses:
 *       200:
 *         description: Taxa de entrega retornada com sucesso
 *         schema:
 *           type: object
 *           properties:
 *             data:
 *               $ref: '#/definitions/DeliveryTax'
 *       401:
 *         $ref: '#/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/responses/NotFoundError'
 */

/**
 * @swagger
 * /api/adresses:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     tags: [Addresses]
 *     summary: Criar um novo endereço
 *     parameters:
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/CreateAddressInput'
 *     responses:
 *       201:
 *         description: Endereço criado com sucesso
 *         schema:
 *           $ref: '#/definitions/Address'
 *       400:
 *         $ref: '#/responses/ValidationError'
 *       401:
 *         $ref: '#/responses/UnauthorizedError'
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
 *         type: integer
 *         description: ID do endereço
 *     responses:
 *       200:
 *         description: Detalhes do endereço
 *         schema:
 *           $ref: '#/definitions/Address'
 *       401:
 *         $ref: '#/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/responses/NotFoundError'
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
 *         type: integer
 *         description: ID do endereço
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/UpdateAddressInput'
 *     responses:
 *       200:
 *         description: Endereço atualizado com sucesso
 *         schema:
 *           $ref: '#/definitions/Address'
 *       400:
 *         $ref: '#/responses/ValidationError'
 *       401:
 *         $ref: '#/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/responses/NotFoundError'
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
 *         type: integer
 *         description: ID do endereço
 *     responses:
 *       204:
 *         description: Endereço excluído com sucesso
 *       401:
 *         $ref: '#/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/responses/NotFoundError'
 */

/**
 * @swagger
 * definitions:
 *   Address:
 *     type: object
 *     properties:
 *       id:
 *         type: integer
 *         example: 1
 *       name:
 *         type: string
 *         example: "Endereço Principal"
 *       address_line1:
 *         type: string
 *         example: "Rua Exemplo, 123"
 *       address_line2:
 *         type: string
 *         example: "Apto 101"
 *       city:
 *         type: string
 *         example: "Talatona"
 *       state:
 *         type: string
 *         example: "SP"
 *       postal_code:
 *         type: string
 *         example: "01234-567"
 *       country:
 *         type: string
 *         example: "Brasil"
 *       is_primary:
 *         type: boolean
 *         example: true
 *       created_at:
 *         type: string
 *         format: date-time
 *       updated_at:
 *         type: string
 *         format: date-time
 *
 *   AddressTreeNode:
 *     type: object
 *     properties:
 *       id:
 *         type: integer
 *         example: 1
 *       name:
 *         type: string
 *         example: "Talatona"
 *       children:
 *         type: array
 *         items:
 *           $ref: '#/definitions/AddressTreeNode'
 *
 *   PaginationMeta:
 *     type: object
 *     properties:
 *       total:
 *         type: integer
 *         example: 100
 *       per_page:
 *         type: integer
 *         example: 10
 *       page:
 *         type: integer
 *         example: 1
 *       last_page:
 *         type: integer
 *         example: 10
 *
 *   DeliveryTax:
 *     type: object
 *     properties:
 *       id:
 *         type: integer
 *         example: 1
 *       city_name:
 *         type: string
 *         example: "Talatona"
 *       tax_amount:
 *         type: number
 *         format: float
 *         example: 15.50
 *       currency:
 *         type: string
 *         example: "USD"
 *       created_at:
 *         type: string
 *         format: date-time
 *       updated_at:
 *         type: string
 *         format: date-time
 *
 *   CreateAddressInput:
 *     type: object
 *     required:
 *       - name
 *       - address_line1
 *       - city
 *       - state
 *       - postal_code
 *       - country
 *     properties:
 *       name:
 *         type: string
 *         example: "Casa"
 *       address_line1:
 *         type: string
 *         example: "Rua Exemplo, 123"
 *       address_line2:
 *         type: string
 *         example: "Apto 101"
 *       city:
 *         type: string
 *         example: "Talatona"
 *       state:
 *         type: string
 *         example: "SP"
 *       postal_code:
 *         type: string
 *         example: "01234-567"
 *       country:
 *         type: string
 *         example: "Brasil"
 *       is_primary:
 *         type: boolean
 *         example: false
 *
 *   UpdateAddressInput:
 *     type: object
 *     properties:
 *       name:
 *         type: string
 *         example: "Trabalho"
 *       address_line1:
 *         type: string
 *         example: "Av. Paulista, 1000"
 *       address_line2:
 *         type: string
 *         example: "10º andar"
 *       city:
 *         type: string
 *         example: "Talatona"
 *       state:
 *         type: string
 *         example: "SP"
 *       postal_code:
 *         type: string
 *         example: "01310-100"
 *       country:
 *         type: string
 *         example: "Brasil"
 *       is_primary:
 *         type: boolean
 *         example: true
 */

/**
 * @swagger
 * responses:
 *   UnauthorizedError:
 *     description: Acesso não autorizado
 *     schema:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "E_UNAUTHORIZED_ACCESS: Unauthorized"
 *
 *   NotFoundError:
 *     description: Recurso não encontrado
 *     schema:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "E_ROW_NOT_FOUND: Cannot find database row for addresses"
 *
 *   ValidationError:
 *     description: Erro de validação
 *     schema:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "E_VALIDATION_FAILED: Validation failed"
 *         errors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *                 example: "name"
 *               message:
 *                 type: string
 *                 example: "O nome é obrigatório"
 */

/**
 * @swagger
 * securityDefinitions:
 *   bearerAuth:
 *     type: apiKey
 *     name: Authorization
 *     in: header
 */
