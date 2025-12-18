'use strict'

const { Command } = require('@adonisjs/ace')
const Helpers = use("Helpers");
const path2 = require('path');
class Route extends Command {

  static get signature () {
    return `make:route
        { name: Name of the user to route}
        { --m=@value : Define a custom module to be used  }
      `}

  static get description () {
    return 'create  start${barra_so}routes${barra_so}v1';
  }
  async handle (args, flags) {
    const barra_so = path2.sep;
    const route = args.name; 
    const module = flags.m || "";
    const path = `app${barra_so}Modules${barra_so}${module||''}${barra_so}routes${barra_so}${route.toLowerCase()}.routes.js`;
    const exists = await this.pathExists(path);
    if (exists) {
      this.error(`${Helpers.appRoot()}${barra_so}${path} already exists`);
    }else{
      this.generateFile(path,this.content(route, module));
      this.success(`${this.iconsMain.success} create ${path}`)
    }
    
  }

  content(route, module) {
    return`
    module.exports = (ApiRoute, Route) => 
    // Protected routes
    ApiRoute(() => {
      const pathValidator = "App/Modules/OrdemTrabalho/Validators";
      Route.get("/", "${route}Controller.index");
      Route.post("/", "${route}Controller.store").validator("pathValidator");
      Route.get("/:id", "${route}Controller.show");
      Route.put("/:id", "${route}Controller.update");
      Route.delete("/:id", "${route}Controller.destroy");
    }, '${route}').namespace("App/Modules/${module}/Controllers")//.middleware(["auth"]);
    `
  }
}

module.exports = Route
