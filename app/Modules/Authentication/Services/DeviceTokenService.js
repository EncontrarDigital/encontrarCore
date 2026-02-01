
    'use strict'
    const DeviceTokenRepository = use("App/Modules/Authentication/Repositories/DeviceTokenRepository");
    const NotFoundException = use("App/Exceptions/NotFoundException");

    class DeviceTokenService{
        
    constructor(){}

    async getActiveTokens(UserId) {
      let query = new DeviceTokenRepository()
        .findAll()
        .where('is_active', true)
        .where('user_id', UserId)
      return query.first()
    }
    /**
     *
     * @param {*} Payload
     * @returns
     */

    async updatedDeviceToken(Id, ModelPayload) {
      return await new DeviceTokenRepository().update(Id, ModelPayload);
    } 

    async registerToken(userId, token, deviceName, deviceType = 'mobile') {
      console.log('🔧 DeviceTokenService.registerToken chamado:', {
        userId,
        tokenPreview: token ? token.substring(0, 20) + '...' : 'null',
        deviceName,
        deviceType
      });

      let deviceToken = await this.findDeviceTokenByName(token)
      
      if(deviceToken){
        console.log('♻️  Token já existe, atualizando:', deviceToken.id);
        console.log('📝 User ID anterior:', deviceToken.user_id, '→ Novo user ID:', userId);
        
        // IMPORTANTE: Atualizar também o user_id quando o token já existe
        return await this.updatedDeviceToken(deviceToken.id, {
          user_id: userId,  // ✅ Adicionar esta linha
          device_name: deviceName,
          device_type: deviceType,
          is_active: true,
        })
      }
      
      console.log('➕ Criando novo token no banco de dados...');
      const result = await new DeviceTokenRepository().create({
        token: token,
        device_name: deviceName,
        device_type: deviceType,
        is_active: true,
        user_id: userId,
      });
      
      console.log('✅ Token criado com sucesso:', result.id);
      return result;
    }
     
    async findDeviceTokenById(id) {
      return await new DeviceTokenRepository().findAll()
      .where('id', id).first();
    }
    async findDeviceTokenByName(token) {
      return await new DeviceTokenRepository().findAll()
      .where('token', token).first();
    }
    async findDeviceTokenUserIdAndActived(UserId, IsActived) {
      return await new DeviceTokenRepository().findAll()
      .where('user_id', UserId)
      .where('is_active', IsActived).fetch();
    }

    /**
     *
     * @param {*} Payload
     * @param {*} Id
     * @returns
     */
    async deactivateToken(token) {
      let deviceToken = await this.findDeviceTokenByName(token)
      return await new DeviceTokenRepository().update(deviceToken.id, {is_active: false});
    } 

    /**
     * @author "caniggiamoreira@gmail.com"
     * @deprecated "Elimina os dados de definitivamente."
     * @param {*} Id 
     * @returns 
    */
    async removeToken(token) {
      let deviceToken = await this.findDeviceTokenByName(token)
      return await new DeviceTokenRepository().deleteDefinitive(deviceToken.id); 
    }

    }
    module.exports = DeviceTokenService
    