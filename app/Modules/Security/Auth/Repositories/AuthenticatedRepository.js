"use strict";
const UsersService = use('App/Modules/Authentication/Services/UsersService')
const NotFoundException = use("App/Exceptions/NotFoundException");
const DeviceToken = use('App/Models/DeviceToken');      
const DeviceTokenService = use('App/Modules/Authentication/Services/DeviceTokenService')
const Database = use("Database");

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
    const { email, password, fcm_token, device_name, device_type } = request.all();
    try{
      // Obter o user_id ANTES de fazer login
      const user = await new UsersService().findUsersByEmail(email);
      
      await this.authenticacao( {email, password, role: options.role}, auth, response );
      
      // Registar FCM token se foi fornecido
      await this.registerFcmToken(user, fcm_token, device_name, device_type);
    }catch(e){
      console.log(e)
    }
  }

    async signup(request, auth, response) {
    const requestPayload = request.all();
    const { fcm_token, device_name, device_type } = requestPayload;
    
    try {
      const existingUser = await new UsersService().findUsersByEmail(requestPayload.email);

      if (existingUser) {
        return response.unauthorized(null, {
          title: "Utilizador Existente",
          message:
            "O utilizador já possui uma conta activa" ,
        });
      }

      const newUser = await new UsersService().createUser({ 
        email:requestPayload.email,
        firstName:requestPayload.firstName,
        lastName:requestPayload.lastName,
        password:requestPayload.password,
      })

      await this.authenticacao({
        email:newUser.email,
        firstName:requestPayload.firstName,
        lastName:requestPayload.lastName,
        password:requestPayload.password,
        role: "customer"
      }, auth, response)
      
      // Registar FCM token se foi fornecido
      await this.registerFcmToken(newUser, fcm_token, device_name, device_type);
      
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
    return response,Adapter;
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
        const user = await auth.getUser();
        
        // Desativar TODOS os tokens FCM do user (logout de todos os dispositivos)
        if (user && user.id) {
          await this.deactivateAllFcmTokens(user.id);
        }
        
        await auth.logout();
        return true;
      }
    } catch (error) {
      return false;
    }
  }

  /**
   * Registar token FCM para um utilizador
   * @param {Object} user - Objeto utilizador com id
   * @param {string} fcmToken - Token FCM
   * @param {string} deviceName - Nome do dispositivo
   * @param {string} deviceType - Tipo de dispositivo
   */
  async registerFcmToken(user, fcmToken, deviceName, deviceType) {
    if (!fcmToken || !user || !user.id) {
      return;
    }

    try {
      await new DeviceTokenService().registerToken(
        user.id,
        fcmToken,
        `Device-${new Date().getTime()}` || 'Mobile Device',
        'mobile'
      );
    } catch (tokenError) {
      console.error('Erro ao registar FCM token:', tokenError.message);
      // Não bloqueia a autenticação se falhar o registro do token
    }
  }

  /**
   * Desativar TODOS os tokens FCM de um utilizador (logout de todos os dispositivos)
   * @param {number} userId - ID do utilizador
   */
  async deactivateAllFcmTokens(userId) {
    if (!userId) {
      return;
    }

    const activedTokens = await Database
      .from('device_tokens')
      .where('user_id', userId)
      .andWhere('is_active', true);

    try {
      activedTokens.forEach(async token => {
        await new DeviceTokenService().deactivateToken(token.token);
      });
    } catch (tokenError) {
      console.error('Erro ao desativar todos os tokens FCM:', tokenError.message);
      // Não bloqueia o logout se falhar
    }
  }

  /**
   * Desativar token FCM específico para um utilizador
   * @param {string} fcmToken - Token FCM
   * @param {number} userId - ID do utilizador
   */
  async deactivateFcmToken(fcmToken, userId) {
    if (!fcmToken || !userId) {
      return;
    }

    try {
      await DeviceToken.deactivateToken(fcmToken, userId);
    } catch (tokenError) {
      console.error('Erro ao desativar FCM token:', tokenError.message);
      // Não bloqueia o logout se falhar
    }
  }
}

module.exports = AuthenticatedRepository;
