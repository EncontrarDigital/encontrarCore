
  const UserRepository = use('App/Modules/Security/Users/Repositories/UserRepository');
  const ResetPasswordRepository = use('App/Modules/Security/Auth/Repositories/ResetPasswordRepository');
  const NotFoundException = use("App/Exceptions/NotFoundException");
  const Database = use('Database');
  const emailService = use("App/Helpers/sendEmail");
  const resetPasswordTemplate = use("App/Templates/email/resetPasswordTemplate");

  class ResetPasswordService {
    #userRepo;
    #resetPasswordRepo;
    constructor() {
      this.#userRepo = new UserRepository();
      this.#resetPasswordRepo = new ResetPasswordRepository();
    }

    async findUserByEmail(email) {
      return await this.#userRepo.findAll().where('email', email).first();
    }


    async verificToken(token) {
        const valid_token = await this.#resetPasswordRepo.findAll().where('token', token).first();

        if(valid_token) return await this.findUserByEmail(valid_token.email);
        return {statusCode :404 }
    }

    async resetPassword(token,password) {
        const valid_token = (await this.#resetPasswordRepo.findAll().where('token', token).first()).toJSON();
        const user = await this.findUserByEmail(valid_token.email);

            if(valid_token){
              await this.#userRepo.update(user.id,{password: password},null,true,false);
              return await Database.raw(`DELETE FROM reset_passwords where id=${valid_token.id}`);
            }
            return {statusCode :404 }
    }

    async SendEmailRecoverPassword(email,link) {
    const user = await this.findUserByEmail(email);
    if (!user) throw new NotFoundException("Caro utilizador Lamentamos informar que  este email não foi encontrado, por favor contacte a equipa de suporte!");
     const valid_email = await this.#resetPasswordRepo.findAll().where('email', email).first();

    if(valid_email) await Database.raw(`DELETE FROM reset_passwords where id=${valid_email.id}`);

    // if (valid_email) throw new NotFoundException("Caro utilizador já foi enviado o link para redefinir a palavra-passe a este email!");

   const reset =  await this.#resetPasswordRepo.create({email:email,token:email},null,false);

    // Get user name - try different possible field names
    const userName = user.firstName || user.username || user.first_name || user.nome || 'Cliente';

    const emailConfig = {
      subject: `Redefinir senha do ENCONTRAR`,
      email: user.email,
      ccEmail: [],
      attachment: [],
      text:`Caro(a) ${userName} Para recuperar a sua password clique no link abaixo
       Nota: Este é um email automático enviado pelo sistema (ENCONTRAR). Por favor não responda a este email.`,
       html:  resetPasswordTemplate(userName,link,reset.token),
    }
    const EnvioEmail =  new emailService()
     const data = await EnvioEmail.emailService(emailConfig);
     delete user.password;delete user.username;
    return user;
    }

  }
  module.exports = ResetPasswordService;
