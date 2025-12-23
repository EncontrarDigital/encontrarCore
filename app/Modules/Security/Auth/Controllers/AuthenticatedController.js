'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const AuthenticatedRepository = use('App/Modules/Security/Auth/Repositories/AuthenticatedRepository')
/**
 * Resourceful controller for interacting with authenticateds
 */
class AuthenticatedController {

  #authRepo;
  constructor() {
    this.#authRepo = new AuthenticatedRepository();
  }

  /**
   * Authenticate a user using your email and password
   * POST /auth/login
   *
   * @param {Object} ctx - context
   * @param {Request} ctx.request - request
   * @param {Response} ctx.response - response
   * @param {Auth} ctx.auth - auth
   * @auth Caniggia Moreira <caniggia.moreira.dias@ideiasdinamicas.com>
   */
  async authenticate({ request, response, auth }) {
    const data = this.#authRepo.authenticate(request, auth, response);
    return data;
  }

  async authenticateAsPartner({ request, response, auth }) {
    const requestAndRole = {
      ...request,
      role: 'sales'
    }
    const data = this.#authRepo.authenticate(requestAndRole, auth, response);
    return data;
  }

  /**
   * refreshToken
   * POST /auth/refreshToken
   *
   * @param {Object} ctx - context
   * @param {Request} ctx.request - request
   * @param {Response} ctx.response - response
   * @param {Auth} ctx.auth - auth
   * @auth Caniggia Moreira <caniggia.moreira.dias@ideiasdinamicas.com>
   */
  async refreshTokenContinue({ request, response, auth }) {
    const data = this.#authRepo.refreshTokenContinue(request, response, auth);
    return data;
  }

  async logout({ request, response, auth }) {
    const data = this.#authRepo.logout( auth, request);
    return data;
  }

  async changeIsLoggedUser({ request, response, auth }) {
    const data = this.#authRepo.changeIsLoggedUser( auth, request);
    return data;
  }

  

}

module.exports = AuthenticatedController
