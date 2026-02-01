'use strict'

/** @type {import('@adonisjs/framework/src/Env')} */
const Env = use('Env')

/** @type {import('@adonisjs/ignitor/src/Helpers')} */
const Helpers = use('Helpers')

module.exports = {
  /*
  |--------------------------------------------------------------------------
  | Default Connection
  |--------------------------------------------------------------------------
  |
  | Connection defines the default connection settings to be used while
  | interacting with SQL databases.
  |
  */
  connection: Env.get('DB_CONNECTION', 'pg'),

  /*
  |--------------------------------------------------------------------------
  | Sqlite
  |--------------------------------------------------------------------------
  |
  | Sqlite is a flat file database and can be a good choice for a development
  | environment.
  |
  | npm i --save sqlite3
  |
  */
  sqlite: {
    client: 'sqlite3',
    connection: {
      filename: Helpers.databasePath(`${Env.get('DB_DATABASE', 'development')}.sqlite`)
    },
    useNullAsDefault: true,
    debug: Env.get('DB_DEBUG', false)
  },

  /*
  |--------------------------------------------------------------------------
  | MySQL
  |--------------------------------------------------------------------------
  |
  | Here we define connection settings for MySQL database.
  |
  | npm i --save mysql
  |
  */
  mysql: {
    client: Env.get('DB_CLIENT', 'mysql') ,
    connection: {
      host: Env.get('DB_HOST', 'localhost'),
      port: Env.get('DB_PORT', ''),
      user: Env.get('DB_USER', 'root'),
      password: Env.get('DB_PASSWORD', ''),
      database: Env.get('DB_DATABASE', 'adonis')
    },
    debug: Env.get('DB_DEBUG', false)
  },
  mysql_unig_selfcare: {
    client: 'mysql',
    connection: {
      host:  Env.get('DB_HOST_UNIG_SELFCARE', '155.89.140.19'),
      port: Env.get('DB_PORT_UNIG_SELFCARE', '3306'),
      user: Env.get('DB_USER_UNIG_SELFCARE', 'bduser'),
      password: Env.get('DB_PASSWORD_UNIG_SELFCARE', '1T3g357@1198'),
      database: Env.get('DB_DATABASE_UNIG_SELFCARE', 'adonis')
    },
    debug: Env.get('DB_DEBUG', false)
  },
  mysql_unig_mediation: {
    client: 'mysql',
    connection: {
      host: Env.get('DB_MEDIATION_OTHER_SERVER') == 'local' ? Env.get('DB_HOST', 'localhost') : Env.get('DB_HOST_UNIG_MEDIATION', 'localhost'),
      port: Env.get('DB_MEDIATION_OTHER_SERVER') == 'local' ? Env.get('DB_PORT', '') : Env.get('DB_PORT_UNIG_MEDIATION', ''),
      user: Env.get('DB_MEDIATION_OTHER_SERVER') == 'local' ? Env.get('DB_USER', 'root') : Env.get('DB_USER_UNIG_MEDIATION', 'root'),
      password: Env.get('DB_MEDIATION_OTHER_SERVER') == 'local' ? Env.get('DB_PASSWORD', '') : Env.get('DB_PASSWORD_UNIG_MEDIATION', ''),
      database: Env.get('DB_DATABASE_UNIG_MEDIATION', 'adonis')
    },
    debug: Env.get('DB_DEBUG', false)
  },

  mysql_unig_mediation_at: {
    client: 'mysql',
    connection: {
      host: Env.get('DB_MEDIATION_AT_OTHER_SERVER') == 'local' ? Env.get('DB_HOST', 'localhost') : Env.get('DB_HOST_AT_UNIG_MEDIATION', 'localhost'),
      port: Env.get('DB_MEDIATION_AT_OTHER_SERVER') == 'local' ? Env.get('DB_PORT', '') : Env.get('DB_PORT_AT_UNIG_MEDIATION', ''),
      user: Env.get('DB_MEDIATION_AT_OTHER_SERVER') == 'local' ? Env.get('DB_USER', 'root') : Env.get('DB_USER_AT_UNIG_MEDIATION', 'root'),
      password: Env.get('DB_MEDIATION_AT_OTHER_SERVER') == 'local' ? Env.get('DB_PASSWORD', '') : Env.get('DB_PASSWORD_AT_UNIG_MEDIATION', ''),
      database: Env.get('DB_DATABASE_AT_UNIG_MEDIATION', 'adonis')
    },
    debug: Env.get('DB_DEBUG', false)
  },

  mysql_unig_emis: {
    client: 'mysql',
    connection: {
      host: Env.get('DB_EMIS_OTHER_SERVER') == 'local' ? Env.get('DB_HOST', 'localhost') : Env.get('DB_HOST_UNIG_EMIS', 'localhost'),
      port: Env.get('DB_EMIS_OTHER_SERVER') == 'local' ? Env.get('DB_PORT', '') : Env.get('DB_PORT_UNIG_EMIS', ''),
      user: Env.get('DB_EMIS_OTHER_SERVER') == 'local' ? Env.get('DB_USER', 'root') : Env.get('DB_USER_UNIG_EMIS', 'root'),
      password: Env.get('DB_EMIS_OTHER_SERVER') == 'local' ? Env.get('DB_PASSWORD', '') : Env.get('DB_PASSWORD_UNIG_EMIS', ''),
      database: Env.get('DB_DATABASE_UNIG_EMIS', 'adonis')
    },
    debug: Env.get('DB_DEBUG', false)
  },
  /*
  |--------------------------------------------------------------------------
  | PostgreSQL
  |--------------------------------------------------------------------------
  |
  | Here we define connection settings for PostgreSQL database.
  |
  | npm i --save pg
  |
  */
  postgres: {
    client: 'pg',
    connection: {
      host: Env.get('DB_HOST', 'localhost'),
      port: Env.get('DB_PORT', 5432),
      user: Env.get('DB_USER', 'postgres'),
      password: Env.get('DB_PASSWORD', ''),
      database: Env.get('DB_DATABASE', 'adonis')
    },
    migrations: 'migrations',
    seeds: 'seeds',
    debug: Env.get('DB_DEBUG', false),
    pool: { 
      min: 2, 
      max: 20,  // Aumentado de 10 para 20
      acquireTimeoutMillis: 60000,  // 60 segundos para adquirir conexão
      idleTimeoutMillis: 30000,  // 30 segundos de idle antes de fechar
      createTimeoutMillis: 30000,  // 30 segundos para criar conexão
      reapIntervalMillis: 1000  // Verificar conexões idle a cada 1 segundo
    },
    ssl: true
  }
}
