'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const AuthenticatedRepository = use('App/Modules/Security/Auth/Repositories/AuthenticatedRepository')
const User = use('App/Modules/Security/Users/Models/User')

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
    const { email } = request.all();
    const requestAndRole = {
      request
    }

    // Garantir que o utilizador existe
    const user = await User.findBy('email', email);
    if (!user) {
      return response.unauthorized({
        message: 'Credenciais inválidas',
      });
    }

    // Verificar se o utilizador tem a role "sales"
    const role = await user.role;
    if ( role == 'sales') {
      return response.forbidden('Credenciais inválidas');
    }

    // Se passou na validação de role, segue o fluxo normal de autenticação
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
