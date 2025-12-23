"use strict";
const User = use("App/Modules/Security/Users/Models/User");
const Hash = use('Hash');
const NotFoundException = use("App/Exceptions/NotFoundException");      
class AuthenticatedRepository {
  constructor() { }
  /**
   * Authenticate user with email and password
   * @param {Object} request - request object
   * @param {Object} auth - auth object
   * @param {Object} response - response object
   */
  async authenticate(request, auth, response) {
    const { email, password, role } = request.all();
    try {
      // Verificar se utilizador existe)
      const existingUser = await User.findBy("email", email)
      .where(function () {
          if( role === 'sales') {
            this.where('role', 'sales');
          } 
        })   
   
      if (!existingUser) {
        throw new NotFoundException("Usuário não encontrado");
      }
      
      const token = await auth
        .withRefreshToken()
        .attempt(email, password);

      const userData = existingUser.toJSON();
      
      delete userData.password;
      delete userData.created_at;
      delete userData.updated_at;

      const dadosUtilizadorLogado = { user: userData, token: token };

      return response.ok(
        dadosUtilizadorLogado,
        {
          message: `Seja Bem-vindo Sr(a) ${userData.name}`,
        }
      );
    } catch (e) {
      console.log('Auth error:', e.message);
      return response.unauthorized(null, {
        title: "Falha na Autenticação",
        message:
          "Email ou Password Inválido, ou consulta o administrador para verificar se a sua conta está activa",
      });
    }
  }


  /**
   * Logout user
   * @param {Object} auth - auth object
   * @param {Object} request - request object
   */
  async logout(auth, request) {
    try {
      const check = await auth.check();
      if (check) {
        await auth.logout();
        return true;
      }
    } catch (error) {
      return false;
    }
  }
}

module.exports = AuthenticatedRepository;
