'use strict'
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

class Role {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
   async handle ({ auth, response }, next, allowedRoles) {
    // Garantir que está autenticado
    if (!auth.user) {
      return response.unauthorized()
    }

    // allowedRoles vem como array de strings
    // ex: ['Admin', 'Shopkeeper']
    if (!allowedRoles.includes(auth.user.role)) {
      return response.forbidden('Sem permissão para acessar este recurso')
    }

    await next()
  }
}

module.exports = Role
