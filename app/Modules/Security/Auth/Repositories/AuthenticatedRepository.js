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
    
    console.log('🔐 Iniciando autenticação:', {
      email,
      hasFcmToken: !!fcm_token,
      deviceName: device_name,
      deviceType: device_type
    });
    
    try{
      // Obter o user_id ANTES de fazer login
      const user = await new UsersService().findUsersByEmail(email);
      
      console.log('👤 Usuário encontrado:', {
        userId: user?.id,
        email: user?.email
      });
      
      await this.authenticacao( {email, password, role: options.role}, auth, response );
      
      // Registar FCM token se foi fornecido
      console.log('📱 Tentando registrar FCM token...');
      await this.registerFcmToken(user, fcm_token, device_name, device_type);
    }catch(e){
      console.error('❌ Erro na autenticação:', e.message);
      console.error('Stack:', e.stack);
    }
  }

    async signup(request, auth, response) {
    const requestPayload = request.all();
    const { fcm_token, device_name, device_type } = requestPayload;
    
    console.log('📝 Iniciando signup:', {
      email: requestPayload.email,
      hasFcmToken: !!fcm_token,
      deviceName: device_name,
      deviceType: device_type
    });
    
    try {
      const existingUser = await new UsersService().findUsersByEmail(requestPayload.email);

      if (existingUser) {
        // Se a conta foi deletada, reativar
        if (existingUser.is_deleted) {
          console.log('♻️  Reativando conta deletada:', {
            userId: existingUser.id,
            email: existingUser.email
          });
          
          const Hash = use('Hash');
          const hashedPassword = await Hash.make(requestPayload.password);
          
          // Reativar conta e atualizar dados
          await Database
            .table('users')
            .where('id', existingUser.id)
            .update({
              is_deleted: false,
              firstName: requestPayload.firstName,
              lastName: requestPayload.lastName,
              password: hashedPassword,
              updated_at: new Date()
            });
          
          // Buscar usuário atualizado
          const reactivatedUser = await new UsersService().findUsersByEmail(requestPayload.email);
          
          console.log('✅ Conta reativada com sucesso:', {
            userId: reactivatedUser.id,
            email: reactivatedUser.email
          });
          
          // Autenticar com a conta reativada
          await this.authenticacao({
            email: reactivatedUser.email,
            firstName: requestPayload.firstName,
            lastName: requestPayload.lastName,
            password: requestPayload.password,
            role: "customer"
          }, auth, response);
          
          // Registar FCM token
          console.log('📱 Tentando registrar FCM token na reativação...');
          await this.registerFcmToken(reactivatedUser, fcm_token, device_name, device_type);
          
          return;
        }
        
        // Conta ativa - não pode criar duplicada
        return response.unauthorized(null, {
          title: "Utilizador Existente",
          message: "O utilizador já possui uma conta activa",
        });
      }

      // Criar novo usuário
      const newUser = await new UsersService().createUser({ 
        email: requestPayload.email,
        firstName: requestPayload.firstName,
        lastName: requestPayload.lastName,
        password: requestPayload.password,
      });
      
      console.log('✅ Novo usuário criado:', {
        userId: newUser.id,
        email: newUser.email
      });

      await this.authenticacao({
        email: newUser.email,
        firstName: requestPayload.firstName,
        lastName: requestPayload.lastName,
        password: requestPayload.password,
        role: "customer"
      }, auth, response);
      
      // Registar FCM token se foi fornecido
      console.log('📱 Tentando registrar FCM token no signup...');
      await this.registerFcmToken(newUser, fcm_token, device_name, device_type);
      
    } catch (e) {
      console.error('❌ Erro no signup:', e.message);
      console.error('Stack:', e.stack);
      return response.unauthorized(null, {
        title: "Falha na Autenticação",
        message: "Consulta o administrador para resolver o problema",
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

    // Verificar se a conta foi deletada
    if (existingUser.is_deleted) {
      throw new NotFoundException("Esta conta foi removida");
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
      console.log('⚠️  FCM Token não registrado - dados insuficientes:', {
        hasFcmToken: !!fcmToken,
        hasUser: !!user,
        hasUserId: !!(user && user.id)
      });
      return;
    }

    try {
      console.log('📱 Registrando FCM token:', {
        userId: user.id,
        deviceName: deviceName || 'Mobile Device',
        deviceType: deviceType || 'mobile',
        tokenPreview: fcmToken.substring(0, 20) + '...'
      });
      
      await new DeviceTokenService().registerToken(
        user.id,
        fcmToken,
        deviceName || 'Mobile Device',
        deviceType || 'mobile'
      );
      
      console.log('✅ FCM token registrado com sucesso para user:', user.id);
    } catch (tokenError) {
      console.error('❌ Erro ao registar FCM token:', tokenError.message);
      console.error('Stack:', tokenError.stack);
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
