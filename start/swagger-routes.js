'use strict'

/**
 * Registar rotas do Swagger
 */
module.exports = function(Route) {
  // Rota para a UI do Swagger
  Route.get('/api/docs', ({ response }) => {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>API Documentation - ENCONTRAR</title>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css">
  <style>
    html {
      box-sizing: border-box;
      overflow: -moz-scrollbars-vertical;
      overflow-y: scroll;
    }
    *, *:before, *:after {
      box-sizing: inherit;
    }
    body {
      margin: 0;
      padding: 0;
    }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js"></script>
  <script>
    window.onload = function() {
      SwaggerUIBundle({
        url: "/swagger.json",
        dom_id: '#swagger-ui',
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIBundle.SwaggerUIStandalonePreset
        ],
        layout: "BaseLayout"
      })
    }
  </script>
</body>
</html>
    `
    response.header('Content-Type', 'text/html')
    return html
  })

  // Rota para o JSON do Swagger (tratado pelo adonis-swagger)
  // Route.get('/swagger.json', 'SwaggerController.json')
}
