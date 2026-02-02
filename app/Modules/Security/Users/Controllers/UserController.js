'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const UserRepository = use('App/Modules/Security/Users/Repositories/UserRepository')
const EmpresaConfigRepository = use('App/Modules/Utilitarios/Repositories/EmpresaConfigRepository')


const User = use("App/Modules/Security/Users/Models/User");
const Event = use('Event')

const Database = use('Database')
/**
 * @author caniggiamoreira@gmail.com
 * @linkedin https://www.linkedin.com/in/caniggia-moreira-8a945999/
 * Resourceful controller for interacting with Users
 */
class UserController {

 #UserRepo;

  constructor() {
      this.#UserRepo = new UserRepository()
  }

  /**
   * Show a list of all Users.
   * GET Users
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index ({ request, response, view }) {
    const search = request.input("search");
    const lojaId = request.input("lojaId");
    const roleId = request.input("roleId");
      const options = {
        page: request.input("page") || 1,
        perPage: request.input("perPage") || 5,
        orderBy: request.input("orderBy") || "id",
        typeOrderBy: request.input("typeOrderBy") || "DESC",
        searchBy: ["id","name","email","telefone", "username"],
        isPaginate: true,
        typeFilter:true,
      };
      let  query = this.#UserRepo.findAll(search, options)
      .where(
        function(){
          if(lojaId){
            this.where('loja_id', lojaId)
          }
          if(roleId){this.whereIn('id', Database.from('role_user').distinct().select('user_id').where('role_id', roleId));
          }
        }
      )
      .with('perfil').with('loja').with("direccao")
      const data =  await (options.isPaginate ? query.paginate(options.page, (options.perPage || 10)) : query.fetch());
      
     return response.ok(data);
  }

  /**
   * Create/save a new User.
   * POST Users
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response }) {
    const createdPayload = request.except(['password_confirmation','role_id'])
    const role_id = request.input('role_id')
    const empresa = await new EmpresaConfigRepository().findAll().first();

    const data = await this.#UserRepo.create({...createdPayload, empresa_config_id: empresa.id});
    const user = await User.find(data.id)
    await user.roles().attach([role_id])
    return response.created(user, {message:'Dados inseridos com sucesso'});
  }

  /**
   * Display a single User.
   * GET Users/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params, response }) {
    const data = await this.#UserRepo.findById(params.id);
    return response.ok(data);
  }

  /**
   * Update User details.
   * PUT or PATCH Users/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params, request, response }) {
      const id = params.id;
      const updatedPayload = request.except(['password_confirmation','role_id'])
      const role_id = request.input('role_id')

      const user =  await this.#UserRepo.findById(id).first();
      var roles = await user.roles().select('id').fetch();
      roles = roles.toJSON().map(role=>role.id)
      await user.roles().detach(roles);
      await user.roles().attach([role_id]);

      const data = await this.#UserRepo.update(id, updatedPayload);
    return response.ok(data, {message:'Operação feita com successo', data: data});
  }

  /**
   * Delete a User with id.
   * DELETE Users/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params, response }) {
    const data = await this.#UserRepo.delete(params.id);
    return response.ok(data);
  }

  /**
   * Update User details.
   * PUT or PATCH Users/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
   async updateStatus ({ params, request, response }) {
      const actived = request.only(['is_actived'])
      const id = params.id;
      const data = await this.#UserRepo.update(id, {is_actived: actived});
    return response.ok(data, {message:'successfully updated object', data: data});
  }

 /**
   * Display a single roleuser.
   * POST changePassword/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async changePassword({ params, request, response }) {
    // add this to the top of the file
    const password = request.input(["password"]);
    const user = await this.#UserRepo.findById(params.id).first();
    // update with new data entered
    const data = await this.#UserRepo.update(params.id, {password: password});

    const emailConfig = {
      subject: `Alteração da Password ENCONTRAR`,
      email: user.email,
      ccEmail: [],
      attachment: [],
      text:`Caro(a) ${user.name} Foi Alterada a sua Password para ${password} 
       Nota: Este é um email automático enviado pelo sistema (ENCONTRAR). Por favor não responda a este email.`,
    }

    Event.fire('new::sendEmail', emailConfig);
   
    response.ok(data,{ message: "Senha redefinida com sucesso"});
  }

}

module.exports = UserController
