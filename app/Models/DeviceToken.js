'use strict'

const Model = use('Model')

class DeviceToken extends Model {
  static boot() {
    super.boot()
  }

  static get table() {
    return 'device_tokens'
  }

  // Relacionamentos
  user() {
    return this.belongsTo('App/Models/User')
  }

  static get fillable() {
    return ['user_id', 'token', 'device_name', 'device_type', 'is_active']
  }

  static get hidden() {
    return []
  }

  static get dates() {
    return ['created_at', 'updated_at']
  }

  /**
   * Registra ou atualiza um token de dispositivo
   * @param {Object|number} userIdOrPayload - user_id ou objeto com {user_id, token, device_name, device_type}
   * @param {string} token - token FCM (opcional se primeiro param é objeto)
   * @param {string} deviceName - nome do dispositivo (opcional)
   * @param {string} deviceType - tipo de dispositivo (padrão: mobile)
   */
  static async registerToken(userIdOrPayload, token, deviceName, deviceType = 'mobile') {
    try {
      let userId, fcmToken, devName, devType
      
      // Suporta dois formatos: registerToken(userId, token, name, type) ou registerToken({user_id, token, device_name, device_type})
      if (typeof userIdOrPayload === 'object') {
        userId = userIdOrPayload.user_id
        fcmToken = userIdOrPayload.token
        devName = userIdOrPayload.device_name || 'Mobile Device'
        devType = userIdOrPayload.device_type || 'mobile'
      } else {
        userId = userIdOrPayload
        fcmToken = token
        devName = deviceName || 'Mobile Device'
        devType = deviceType || 'mobile'
      }

      // Verifica se o token já existe para este usuário
      let deviceToken = await this.query()
        .where('user_id', userId)
        .where('token', fcmToken)
        .first()

      if (deviceToken) {
        // Atualiza o token existente
        deviceToken.device_name = devName
        deviceToken.device_type = devType
        deviceToken.is_active = true
        await deviceToken.save()
        return deviceToken
      }

      // Cria novo token
      deviceToken = await this.create({
        user_id: userId,
        token: fcmToken,
        device_name: devName,
        device_type: devType,
        is_active: true
      })

      return deviceToken
    } catch (error) {
      console.error('Error registering device token:', error.message)
      throw error
    }
  }

  /**
   * Desativa um token de dispositivo
   * @param {string} token - token FCM
   * @param {number} userId - user_id (opcional, para validar que o token pertence ao usuário)
   */
  static async deactivateToken(token, userId = null) {
    try {
      let query = this.query().where('token', token)
      
      if (userId) {
        query = query.where('user_id', userId)
      }
      
      const deviceToken = await query.first()
      if (deviceToken) {
        deviceToken.is_active = false
        await deviceToken.save()
      }
      return deviceToken
    } catch (error) {
      console.error('Error deactivating device token:', error.message)
      throw error
    }
  }

  /**
   * Remove um token de dispositivo
   */
  static async removeToken(token) {
    try {
      await this.query().where('token', token).delete()
    } catch (error) {
      console.error('Error removing device token:', error.message)
      throw error
    }
  }

  /**
   * Obtém todos os tokens ativos de um usuário
   */
  static async getActiveTokens(userId) {
    try {
      const tokens = await this.query()
        .where('user_id', userId)
        .where('is_active', true)
        .fetch()

      return tokens.toJSON().map(t => t.token)
    } catch (error) {
      console.error('Error getting active tokens:', error.message)
      throw error
    }
  }
}

module.exports = DeviceToken
