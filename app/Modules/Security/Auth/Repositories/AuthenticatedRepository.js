"use strict";
const UsersService = use('App/Modules/Authentication/Services/UsersService')
const NotFoundException = use("App/Exceptions/NotFoundException");      
class AuthenticatedRepository {
  constructor() { }
  /**
   * Authenticate user with email and password
   * @param {Object} request - request object
   * @param {Object} auth - auth object
   * @param {Object} response - response object
   */
    async authenticate(options, auth, response) {
      const request = options.request;
      const { email, password } = request.all();
      try{
      await this.authenticacao( {email, password, role: options.role}, auth, response );
      }catch(e){
        console.log(e)
      }
  }

    async signup(request, auth, response) {
    const requestPayload = request.all();
    
    try {
      const existingUser = await new UsersService().findUsersByEmail(requestPayload.email);

      if (existingUser) {
        return response.unauthorized(null, {
          title: "Utilizador Existente",
          message:
            "O utilizador já possui uma conta activa" ,
        });
      }

      const newUser = await new UsersService().createUser({ ...requestPayload})

      await this.authenticacao({
        email:newUser.email,
        firstName:requestPayload.firstName,
        lastName:requestPayload.lastName,
        password:requestPayload.password,
        role: "customer"
      }, auth, response)
      
    } catch (e) {
      console.log(e)
      return response.unauthorized(null, {
        title: "Falha na Autenticação",
        message:
          "Consulta o administrador para resolver o problema",
      });
    }
  }

  async authenticacao(userpayload, auth, response) {
    const { email, password, role } = userpayload
    try {
      const responseAdapter = await this.findByUserAuth(email, role);
  
      const token = await auth
        .withRefreshToken()
        .attempt(email, password);

      const dadosUtilizadorLogado = { ...responseAdapter, token: token };


      return response.ok(
        dadosUtilizadorLogado,
        {
          message: `Seja Bem-vindo Sr(a)`,
        }
      );
    } catch (e) {
      console.log(e)
      //await User.query().where('id', this.currentUser?.id).update({ is_logged: 0 })
      return response.unauthorized(null, {
        title: "Falha na Autenticação",
        message:
          "Nome de utilizador ou Password Inválido, ou consulta o administrador para verificar se a sua conta está activa",
      });
    }
  }

  async findByUserAuth(email, role) {
    let existingUser = await new UsersService().findUsersByEmail(email, role);
  
     if (!existingUser) {
      throw new NotFoundException("Usuário não encontrado");
    }

    const responseAdapter = Object.assign(
      {},
      { user: { ...existingUser.toJSON()} },
    );

    delete responseAdapter.user.password;
    delete responseAdapter.user.is_deleted;
    delete responseAdapter.user.created_at;
    delete responseAdapter.user.role;
    delete responseAdapter.user.updated_at;
    return responseAdapter;
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
