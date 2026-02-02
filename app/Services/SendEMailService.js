"use strict";
const nodemailer = require("nodemailer");
const InternalServerException = use("App/Exceptions/InternalServerException");
const Env = use("Env");

class SendEMailService {
  constructor() {}

  /**
   * @deprecated ""
   * @author "Caniggia Moreira, caniggia.moreira@gmail.com"
   * @param {*} To
   * @param {*} Subject
   * @param {*} Text
   * @param {*} Options
   * @returns
   */
  async sendEMail(To, Subject, Text, Options = { cc: [], attachments: [] }) {
    const transporter = this.createTransport();
    return await this.verifyConnection(transporter, async function () {
      await transporter.sendMail({
          from: `ENCONTRAR`,
          to: To,
          subject: Subject,
          text: Text,
          ...Options,
        },(err) => {
          return err;
      });
    });
  }

  /**
   * @author "Caniggia Moreira, caniggia.moreira@gmail.com"
   * @returns
   */
  createTransport() {
    return nodemailer.createTransport({
      port: Env.get("SMTP_PORT"),
      host: Env.get("SMTP_HOST"),
      // secure: true,
      auth: {
        user: Env.get("EMAIL_FROM"),
        pass: Env.get("MAIL_PASSWORD"),
      },
    });
  }

  /**
   *
   * @param {*} transporter
   * @param {*} cb
   * @returns
   */
  async verifyConnection(transporter, cb) {
    const res = { statusCode: 200, message: "" };
    return await transporter.verify(function (error, success) {
      if (error) {
        res.statusCode = 502;
        res.message =
          "Erro de ligação. Sem comunicação com o servidor de email";
        return res;
      }
      cb();
      return res;
    });
  }
}
module.exports = SendEMailService;
