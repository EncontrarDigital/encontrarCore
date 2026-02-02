module.exports = (nameUser, month, year) => {
  return `
  <body style="margin: 0; padding: 0; -webkit-text-size-adjust: 100%; background-color: #f4f4f4; color: #333; font-family: 'Arial', sans-serif;">

    <table style="border-collapse: collapse; table-layout: fixed; border-spacing: 0; mso-table-lspace: 0pt; mso-table-rspace: 0pt; vertical-align: top; min-width: 320px; margin: 0 auto; background-color: #f4f4f4; width: 100%;" cellpadding="0" cellspacing="0">
      <tbody>
        <tr style="vertical-align: top;">
          <td style="word-break: break-word; border-collapse: collapse !important; vertical-align: top;">

            <!-- Header -->
            <div style="padding: 15px; background-color: #ffffff; border-top: 1px solid #f4f4f4;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                <tbody>
                  <tr>
                    <td align="center">
                      <img src="http://www.angolatelecom.ao/assets/img/telecom/logo.jpg" alt="Logo" style="display: block; margin: auto; max-width: 100%;">
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Content -->
            <div style="padding: 40px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
              <p style="font-size: 18px; color: #333; margin-bottom: 20px;">Prezado(a) ${nameUser},</p>
              <p style="font-size: 18px; color: #333; margin-bottom: 20px;">Serve o presente e-mail para informar que se encontra(m) em anexo a(s) factura(a) relativa(s) aos serviços prestados pela Angola Telecom. Solicitamos a V. Exa. a regularização do pagamento dentro prazo indicado na factura.</p>

              <p style="font-size: 18px; color: #333; margin-bottom: 20px;">Agradecemos a confiança depositada nos nossos serviços. Para qualquer esclarecimento adicional ou necessidade de assistência, não hesite em contactar a nossa equipa.</p>

              <!-- Social Media Links -->
              <div align="center" style="margin-top: 30px;">
                <a href="https://www.facebook.com/AngolaTelecomEP" style="margin-right: 10px;">
                  <img src="https://img.icons8.com/?size=48&id=118497&format=png" alt="Facebook" width="30" height="30">
                </a>
                <a href="https://www.instagram.com/angolatelecomEP/" style="margin-right: 10px;">
                  <img src="https://img.icons8.com/?size=48&id=32323&format=png" alt="Instagram" width="30" height="30">
                </a>
                <a href="https://twitter.com/AngolaTelecomEP" style="margin-right: 10px;">
                  <img src="https://img.icons8.com/?size=48&id=13963&format=png" alt="Twitter" width="30" height="30">
                </a>
                <a href="https://www.youtube.com/channel/UCOFW0DiyoxlIwvWMaH0xdng">
                  <img src="https://img.icons8.com/?size=48&id=19318&format=png" alt="YouTube" width="30" height="30">
                </a>
              </div>
            </div>

            <!-- Footer -->
            <div style="padding: 10px; background-color: #f4f4f4; text-align: center;">
              <p style="font-size: 14px; line-height: 140%; color: #888888;">&copy; 2023 ENCONTRAR. Todos os direitos reservados.</p>
              <p style="font-size: 14px; line-height: 140%; color: #888888;"><strong>Nota:</strong> Este é um email automático enviado pelo sistema (ENCONTRAR). Por favor, não responda a este email.</p>
            </div>

          </td>
        </tr>
      </tbody>
    </table>

  </body>
  `;
};
