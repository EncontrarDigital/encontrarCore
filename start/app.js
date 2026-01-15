"use strict";
const path = require("path");
/*
|--------------------------------------------------------------------------
| Providers
|--------------------------------------------------------------------------
|
| Providers are building blocks for your Adonis app. Anytime you install
| a new Adonis specific package, chances are you will register the
| provider here.
|
*/
const providers = [
  "@adonisjs/framework/providers/AppProvider",
  "@adonisjs/auth/providers/AuthProvider",
  "@adonisjs/bodyparser/providers/BodyParserProvider",
  "@adonisjs/cors/providers/CorsProvider",
  "@adonisjs/lucid/providers/LucidProvider",
  "@adonisjs/validator/providers/ValidatorProvider",
  "adonis-acl/providers/AclProvider",
  "@adonisjs/persona/providers/PersonaProvider",
  "adonis-scheduler/providers/SchedulerProvider",
  'adonis-lucid-polymorphic/providers/PolymorphicProvider',
  'adonis4-lucid-polymorphic/providers/PolymorphicProvider',
  'adonis-swagger/providers/SwaggerProvider',
  '@adonisjs/drive/providers/DriveProvider',
  path.resolve(__dirname, "..", "providers/AuditProvider"),
  '@adonisjs/mail/providers/MailProvider',
  '@adonisjs/websocket/providers/WsProvider',
  '@rocketseat/adonis-bull/providers/Bull',

];

/*
|--------------------------------------------------------------------------
| Ace Providers
|--------------------------------------------------------------------------
|
| Ace providers are required only when running ace commands. For example
| Providers for migrations, tests etc.
|
*/
const aceProviders = [
  "@adonisjs/lucid/providers/MigrationsProvider",
  "adonis-acl/providers/CommandsProvider",
  "adonis-scheduler/providers/CommandsProvider",
  '@rocketseat/adonis-bull/providers/Command'
];

/*
|--------------------------------------------------------------------------
| Aliases
|--------------------------------------------------------------------------
|
| Aliases are short unique names for IoC container bindings. You are free
| to create your own aliases.
|
| For example:
|   { Route: 'Adonis/Src/Route' }
|
*/
const aliases = {
  Role: "Adonis/Acl/Role",
  Permission: "Adonis/Acl/Permission",
  Scheduler: "Adonis/Addons/Scheduler",
};

/*
|--------------------------------------------------------------------------
| Commands
|--------------------------------------------------------------------------
|
| Here you store ace commands for your package
|
*/
const commands = ["App/Commands/Repository", "App/Commands/Route", "App/Commands/Service", "App/Commands/Controller", "App/Commands/MigrationCategoryIcons"]

module.exports = { providers, aceProviders, aliases, commands };
