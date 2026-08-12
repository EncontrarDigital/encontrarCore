'use strict'

module.exports = {
  /*
  |--------------------------------------------------------------------------
  | Origin
  |--------------------------------------------------------------------------
  |
  | Set a list of origins to be allowed. The value can be one of the following
  |
  | Boolean: true - Allow current request origin
  | Boolean: false - Disallow all
  | String - Comma separated list of allowed origins
  | Array - An array of allowed origins
  | String: * - A wildcard to allow current request origin
  | Function - Receives the current origin and should return one of the above values.
  |
  */
 origin: function (currentOrigin) {
  
  // For development, allow all origins
  if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
    console.log('✅ [CORS] Development mode - allowing all origins');
    return true;
  }

  // Allow localhost for development
  if (currentOrigin && (
    currentOrigin.includes('localhost') || 
    currentOrigin.includes('127.0.0.1') ||
    currentOrigin.includes('192.168.')
  )) {
    console.log('✅ [CORS] Localhost origin - allowing');
    return true;
  }

  // For production, only allow specific origins
  const allowedOrigins = [
    'https://admin.encontrarshopping.com',
    'https://encontrarshopping.com',
    'https://www.encontrarshopping.com',
    'https://www.admin.encontrarshopping.com'
  ];
  
  const isAllowed = allowedOrigins.includes(currentOrigin);
  console.log(`${isAllowed ? '✅' : '❌'} [CORS] Origin ${currentOrigin} ${isAllowed ? 'allowed' : 'denied'}`);
  
  return isAllowed ? currentOrigin : false;
},

  /*
  |--------------------------------------------------------------------------
  | Methods
  |--------------------------------------------------------------------------
  |
  | HTTP methods to be allowed. The value can be one of the following
  |
  | String - Comma separated list of allowed methods
  | Array - An array of allowed methods
  |
  */
  methods: ['GET', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],

  /*
  |--------------------------------------------------------------------------
  | Headers
  |--------------------------------------------------------------------------
  |
  | List of headers to be allowed via Access-Control-Request-Headers header.
  | The value can be one of the following.
  |
  | Boolean: true - Allow current request headers
  | Boolean: false - Disallow all
  | String - Comma separated list of allowed headers
  | Array - An array of allowed headers
  | String: * - A wildcard to allow current request headers
  | Function - Receives the current header and should return one of the above values.
  |
  */
  headers: true,

  /*
  |--------------------------------------------------------------------------
  | Expose Headers
  |--------------------------------------------------------------------------
  |
  | A list of headers to be exposed via `Access-Control-Expose-Headers`
  | header. The value can be one of the following.
  |
  | Boolean: false - Disallow all
  | String: Comma separated list of allowed headers
  | Array - An array of allowed headers
  |
  */
  exposeHeaders: [
    'cache-control',
    'content-language',
    'content-type',
    'expires',
    'last-modified',
    'authorization',
    'x-requested-with',
  ],

  /*
  |--------------------------------------------------------------------------
  | Credentials
  |--------------------------------------------------------------------------
  |
  | Define Access-Control-Allow-Credentials header. It should always be a
  | boolean.
  |
  */
  credentials: true,

  /*
  |--------------------------------------------------------------------------
  | MaxAge
  |--------------------------------------------------------------------------
  |
  | Define Access-Control-Allow-Max-Age
  |
  */
  maxAge: 90
}
