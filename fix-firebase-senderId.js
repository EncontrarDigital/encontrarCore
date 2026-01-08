/**
 * Script para corrigir problemas de SenderId mismatch no Firebase
 * 
 * Execute: node fix-firebase-senderId.js
 */

const Firebase = require('./config/firebase')

async function checkAndFixFirebaseConfig() {
  try {
    console.log('🔧 VERIFICANDO E CORRIGINDO CONFIGURAÇÃO FIREBASE...\n')
    
    // 1. Verificar variáveis de ambiente
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT
    const databaseUrl = process.env.FIREBASE_DATABASE_URL
    
    if (!serviceAccountJson) {
      console.error('❌ FIREBASE_SERVICE_ACCOUNT não está configurado no .env')
      console.log('\n📝 SOLUÇÃO:')
      console.log('1. Acesse Firebase Console > Project Settings > Service Accounts')
      console.log('2. Clique em "Generate new private key"')
      console.log('3. Baixe o arquivo JSON')
      console.log('4. Copie o conteúdo completo para FIREBASE_SERVICE_ACCOUNT no .env')
      return false
    }
    
    // 2. Validar JSON do service account
    let serviceAccount
    try {
      serviceAccount = JSON.parse(serviceAccountJson)
    } catch (error) {
      console.error('❌ FIREBASE_SERVICE_ACCOUNT contém JSON inválido')
      console.log('📝 Verifique se o JSON está bem formatado no .env')
      return false
    }
    
    // 3. Verificar campos obrigatórios
    const requiredFields = ['project_id', 'private_key', 'client_email', 'client_id']
    const missingFields = requiredFields.filter(field => !serviceAccount[field])
    
    if (missingFields.length > 0) {
      console.error(`❌ Campos obrigatórios ausentes: ${missingFields.join(', ')}`)
      return false
    }
    
    console.log('✅ Configuração Firebase válida:')
    console.log(`  - Project ID: ${serviceAccount.project_id}`)
    console.log(`  - Client Email: ${serviceAccount.client_email}`)
    console.log(`  - Client ID: ${serviceAccount.client_id}`)
    
    // 4. Tentar inicializar Firebase
    try {
      Firebase.initialize()
      console.log('✅ Firebase inicializado com sucesso')
    } catch (error) {
      console.error('❌ Erro ao inicializar Firebase:', error.message)
      return false
    }
    
    // 5. Informações importantes sobre SenderId
    console.log('\n📋 INFORMAÇÕES IMPORTANTES SOBRE SENDERID:')
    console.log(`  - Project ID: ${serviceAccount.project_id}`)
    console.log(`  - Client ID (pode ser o SenderId): ${serviceAccount.client_id}`)
    console.log('\n⚠️  VERIFICAÇÕES NECESSÁRIAS NO APP MOBILE:')
    console.log('1. Arquivo google-services.json deve ter o mesmo project_id')
    console.log('2. O SenderId no app deve corresponder ao project_number do Firebase')
    console.log('3. Acesse Firebase Console > Project Settings > General')
    console.log('4. Verifique se Project number = SenderId usado no app')
    
    // 6. Teste básico de envio
    console.log('\n🧪 Para testar um token específico, execute:')
    console.log('node debug-firebase-senderId.js test SEU_TOKEN_AQUI')
    
    return true
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message)
    return false
  }
}

async function showSenderIdSolution() {
  console.log('\n🔍 SOLUÇÕES PARA SENDERID MISMATCH:\n')
  
  console.log('1️⃣  VERIFICAR CONFIGURAÇÃO DO APP MOBILE:')
  console.log('   - Certifique-se que google-services.json está atualizado')
  console.log('   - Project ID deve ser: encontrarcore')
  console.log('   - SenderId deve corresponder ao project_number')
  
  console.log('\n2️⃣  VERIFICAR NO FIREBASE CONSOLE:')
  console.log('   - Acesse: https://console.firebase.google.com/project/encontrarcore')
  console.log('   - Vá em Project Settings > General')
  console.log('   - Anote o "Project number" (este é o SenderId correto)')
  
  console.log('\n3️⃣  ATUALIZAR APP MOBILE:')
  console.log('   - Baixe novo google-services.json do Firebase Console')
  console.log('   - Substitua o arquivo no projeto mobile')
  console.log('   - Recompile e reinstale o app')
  
  console.log('\n4️⃣  LIMPAR TOKENS ANTIGOS:')
  console.log('   - Execute: node debug-firebase-senderId.js clean')
  console.log('   - Isso remove tokens inválidos da base de dados')
  
  console.log('\n5️⃣  FORÇAR RENOVAÇÃO DE TOKENS:')
  console.log('   - Usuários devem fazer logout/login no app')
  console.log('   - Ou implementar renovação automática de tokens')
  
  console.log('\n6️⃣  VERIFICAR LOGS DETALHADOS:')
  console.log('   - Execute: node debug-firebase-senderId.js audit')
  console.log('   - Isso testa todos os tokens e mostra quais estão com problema')
}

// Executar
async function main() {
  console.log('🚀 FIREBASE SENDERID MISMATCH - DIAGNÓSTICO E CORREÇÃO\n')
  console.log('='.repeat(60))
  
  const configOk = await checkAndFixFirebaseConfig()
  
  if (configOk) {
    await showSenderIdSolution()
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('✅ VERIFICAÇÃO COMPLETA')
}

// Configurar ambiente e executar
require('dotenv').config()
main().catch(console.error)