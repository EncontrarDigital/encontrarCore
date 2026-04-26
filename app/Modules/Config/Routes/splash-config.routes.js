'use strict';

/**
 * Rotas de configuração do splash screen
 */
module.exports = function (ApiRoute, Route) {
  // Obter configuração da animação de splash
  Route.get('/api/config/splash-animation', 'SplashConfigController.getSplashAnimation')
    .namespace('App/Modules/Config/Controllers')
  
  // Upload de nova animação (futuro - dashboard)
  Route.post('/api/config/splash-animation/upload', 'SplashConfigController.uploadAnimation')
    .middleware(['auth'])
    .namespace('App/Modules/Config/Controllers')

  // Rota para servir arquivos de animação
  Route.get('/static/animations/:filename', 'SplashConfigController.serveAnimation')
    .namespace('App/Modules/Config/Controllers')
};
