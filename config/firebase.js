'use strict'

const Env = use('Env')
const admin = require('firebase-admin')

let firebaseApp = null

class FirebaseProvider {
  /**
   * Inicializa Firebase Admin SDK
   */
  static initialize() {
    if (firebaseApp) {
      return firebaseApp
    }

    try {
      // Obtém as credenciais do arquivo JSON ou das variáveis de ambiente
      const firebaseServiceAccountJson = Env.get('FIREBASE_SERVICE_ACCOUNT')
      
      if (!firebaseServiceAccountJson) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not set. Please add your Firebase service account JSON to .env file.')
      }

      const serviceAccount = typeof firebaseServiceAccountJson === 'string' 
        ? JSON.parse(firebaseServiceAccountJson)
        : firebaseServiceAccountJson

      if (!serviceAccount || typeof serviceAccount !== 'object') {
        throw new Error('FIREBASE_SERVICE_ACCOUNT must be a valid JSON object or JSON string')
      }

      // Validar campos obrigatórios da service account
      if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT JSON is missing required fields: project_id, private_key, or client_email')
      }

      console.log(`✓ Initializing Firebase for project: ${serviceAccount.project_id}`)

      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id
      })

      // Verificar que o messaging service está disponível
      const messaging = admin.messaging()
      if (!messaging) {
        throw new Error('Firebase Messaging service failed to initialize')
      }

      console.log(`✓ Firebase initialized successfully for project: ${serviceAccount.project_id}`)
      return firebaseApp
    } catch (error) {
      console.error('✗ Error initializing Firebase:', error.message)
      throw error
    }
  }

  /**
   * Envia uma notificação push para um dispositivo específico
   * @param {string} token - Token FCM do dispositivo
   * @param {object} notification - Objeto com title e body
   * @param {object} data - Dados adicionais a enviar
   */
  static async sendNotification(token, notification, data = {}) {
    try {
      if (!firebaseApp) {
        this.initialize()
      }

      if (!token) {
        throw new Error('Token is required to send notification')
      }

    const message = {
      notification: {
        title: notification.title,
        body: notification.body
      },
      data: {
        ...data,
        timestamp: new Date().toISOString()
      },
      token: token,
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          clickAction: 'FLUTTER_NOTIFICATION_CLICK'
        }
      },
      apns: {
        headers: {
          'apns-priority': '10'
        },
        payload: {
          aps: {
            sound: 'default',
            badge: 1
          }
        }
      }
    }

      const response = await admin.messaging().send(message)
      console.log('✓ Notification sent successfully:', response)
      return response
    } catch (error) {
      console.error('✗ Error sending notification:', error.message)
      
      // Diagnóstico específico para SenderId mismatch
      if (error.message && error.message.includes('SenderId mismatch')) {
        console.error('🔍 DIAGNÓSTICO - SenderId Mismatch:')
        console.error('  1. Token foi gerado com SenderId diferente do projeto atual')
        console.error('  2. Verifique se app mobile usa google-services.json correto')
        console.error('  3. SenderId deve corresponder ao project_number do Firebase')
        console.error('  4. Execute: node fix-firebase-senderId.js para mais detalhes')
        console.error(`  5. Token problemático: ${token.substring(0, 20)}...`)
      } else if (error.message && error.message.includes('registration-token-not-registered')) {
        console.error('🔍 Token expirado ou app desinstalado')
        console.error(`  Token: ${token.substring(0, 20)}...`)
      }
      
      throw error
    }
  }

  /**
   * Envia notificação para múltiplos dispositivos
   * @param {array} tokens - Array de tokens FCM
   * @param {object} notification - Objeto com title e body
   * @param {object} data - Dados adicionais
   */
  static async sendMulticast(tokens, notification, data = {}) {
    try {
      if (!firebaseApp) {
        this.initialize()
      }

      if (!tokens || tokens.length === 0) {
        console.log('No tokens provided for multicast')
        return { successCount: 0, failureCount: 0 }
      }

    const message = {
      notification: {
        title: notification.title,
        body: notification.body
      },
      data: {
        ...data,
        timestamp: new Date().toISOString()
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          clickAction: 'FLUTTER_NOTIFICATION_CLICK'
        }
      },
      apns: {
        headers: {
          'apns-priority': '10'
        }
        }
      }

      // Usar sendEachForMulticast - API correta para múltiplos dispositivos
      const response = await admin.messaging().sendEachForMulticast({
        ...message,
        tokens: tokens
      })

      console.log(`✓ Multicast sent. Success: ${response.successCount}, Failed: ${response.failureCount}`)
      
      // Limpar tokens que falharam
      if (response.failureCount > 0) {
        const failedTokens = []
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(tokens[idx])
          }
        })
      }

      // Retorna informações da resposta
      return {
        successCount: response.successCount,
        failureCount: response.failureCount,
        responses: response.responses
      }
    } catch (error) {
      console.error('✗ Error sending multicast:', error.message)
      throw error
    }
  }

  /**
   * Envia notificação para um tópico
   * @param {string} topic - Nome do tópico
   * @param {object} notification - Objeto com title e body
   * @param {object} data - Dados adicionais
   */
  static async sendToTopic(topic, notification, data = {}) {
    if (!firebaseApp) {
      this.initialize()
    }

    const message = {
      notification: {
        title: notification.title,
        body: notification.body
      },
      data: {
        ...data,
        timestamp: new Date().toISOString()
      },
      topic: topic,
      android: {
        priority: 'high'
      }
    }

    try {
      const response = await admin.messaging().send(message)
      console.log('Topic notification sent:', response)
      return response
    } catch (error) {
      console.error('Error sending topic notification:', error.message)
      throw error
    }
  }

  /**
   * Inscreve um token em um tópico
   */
  static async subscribeToTopic(tokens, topic) {
    if (!firebaseApp) {
      this.initialize()
    }

    try {
      const response = await admin.messaging().subscribeToTopic(tokens, topic)
      console.log(`Subscribed to topic ${topic}:`, response)
      return response
    } catch (error) {
      console.error('Error subscribing to topic:', error.message)
      throw error
    }
  }

  /**
   * Remove inscrição de um tópico
   */
  static async unsubscribeFromTopic(tokens, topic) {
    if (!firebaseApp) {
      this.initialize()
    }

    try {
      const response = await admin.messaging().unsubscribeFromTopic(tokens, topic)
      console.log(`Unsubscribed from topic ${topic}:`, response)
      return response
    } catch (error) {
      console.error('Error unsubscribing from topic:', error.message)
      throw error
    }
  }
}

module.exports = FirebaseProvider
