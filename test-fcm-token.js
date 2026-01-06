// Script para testar FCM Token Registration no AdonisJS REPL
// Execute com: node repl.js e depois copie/cole isto

const DeviceToken = use('App/Models/DeviceToken');

// Teste 1: Registar novo token
async function testeSignup() {
  console.log('\n📱 TESTE 1: Registar novo token (Signup)...');
  
  const resultado = await DeviceToken.registerToken({
    user_id: 999, // Use um user_id existente
    token: 'fXcBcvGDRoqguKpT3H0x9x:APA91bGBQ58Azsg9XCxHqH25BZvjg6Y2a6auwh0XOCNCCT5KIl808TOTjemSoH30Ll6U3GY6avgC9-ma7JsM4blEo7hgnz8zycKCWPhvS-AGGTfHKFJGNFo',
    device_name: 'iPhone 14 Pro',
    device_type: 'mobile'
  });
  
  console.log('✅ Token registado:', resultado);
}

// Teste 2: Atualizar token existente
async function testeLogin() {
  console.log('\n🔄 TESTE 2: Login com mesmo token...');
  
  const resultado = await DeviceToken.registerToken({
    user_id: 999,
    token: 'fXcBcvGDRoqguKpT3H0x9x:APA91bGBQ58Azsg9XCxHqH25BZvjg6Y2a6auwh0XOCNCCT5KIl808TOTjemSoH30Ll6U3GY6avgC9-ma7JsM4blEo7hgnz8zycKCWPhvS-AGGTfHKFJGNFo',
    device_name: 'iPhone 14 Pro Updated',
    device_type: 'mobile'
  });
  
  console.log('✅ Token atualizado:', resultado);
}

// Teste 3: Desativar token
async function testeLogout() {
  console.log('\n🚫 TESTE 3: Logout (desativar token)...');
  
  const resultado = await DeviceToken.deactivateToken(
    'fXcBcvGDRoqguKpT3H0x9x:APA91bGBQ58Azsg9XCxHqH25BZvjg6Y2a6auwh0XOCNCCT5KIl808TOTjemSoH30Ll6U3GY6avgC9-ma7JsM4blEo7hgnz8zycKCWPhvS-AGGTfHKFJGNFo',
    999
  );
  
  console.log('✅ Token desativado:', resultado);
}

// Teste 4: Listar tokens do user
async function testeListTokens() {
  console.log('\n📋 TESTE 4: Listar tokens do user...');
  
  const tokens = await DeviceToken
    .where('user_id', 999)
    .where('is_active', true)
    .fetch();
  
  console.log('✅ Tokens ativos:', tokens.toJSON());
}

// Executa todos
async function runAllTests() {
  try {
    await testeSignup();
    await testeLogin();
    await testeLogout();
    await testeListTokens();
    console.log('\n✅ TODOS OS TESTES COMPLETOS!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

runAllTests();
