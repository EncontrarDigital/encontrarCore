'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */
const NotUpdateException = use("App/Exceptions/NotUpdateException");
const ResetPasswordService = use('App/Modules/Security/Auth/Services/ResetPasswordService');
/**
 * Resourceful controller for interacting with resetpasswords
 */
class ResetPasswordController { 
  #ResetPasswordService;
  constructor() {
    this.#ResetPasswordService = new ResetPasswordService();
  }
  /**
   * Create/save a new resetpassword.
   * POST resetpasswords
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
   async resetPassword({ request, response, auth }) {
    const Persona = use("Persona");    
    const payload = request.only(["old_password","password","password_confirmation"]);
    //try {
      const user = auth.user;
      await Persona.updatePassword(user, payload); 
      return response.created(null, {message:'Senha alterada com sucesso.'});
    /*} catch (e) {
      throw new NotUpdateException('Falha na Aleração da Senha, Verifica as senhas digitadas se correspondem');  
    }*/
  } 

  async recoverPasswordSendingEmail({ request, response, auth }) {
    const email = request.input('email');
    const link = request.input('link');
    const data = await this.#ResetPasswordService.SendEmailRecoverPassword(email,link);
    return response.created(data, { message: 'Será enviado Um link para redefinir a palavra-passe a este email : '+data.email});
  } 

  async resetPassword({ request, response, auth,params }) {
    const password = request.input('password');
    const token = params.token;
    const data = await this.#ResetPasswordService.resetPassword(token,password);
    return response.created(data, { message: 'Palavra-passe Alterada com sucesso!'});
  } 

  async updatePassword ({ request, auth, response }) {
    const Persona = use("Persona");   
      const payload = request.only(['old_password', 'password', 'password_confirmation'])
      const user = auth.user
      const result = await Persona.updatePassword(user, payload)
      return response.ok(result, {message:'Senha alterada com sucesso.'});

  }

  
  async verificToken({ request, response, auth }) {
    const token = request.input('token');
    const data =  await this.#ResetPasswordService.verificToken(token);
    return data;
  }

  async resetPasswordPage({ request, response }) {
    const token = request.input('token');
    
    // Return a simple HTML page for password reset
    const html = `
<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Redefinir Senha - Encontrar</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #DC9E00;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            padding: 40px;
            max-width: 450px;
            width: 100%;
        }
        .logo {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo img {
            max-width: 200px;
            height: auto;
        }
        h2 {
            color: #333;
            text-align: center;
            margin-bottom: 10px;
            font-size: 24px;
        }
        .subtitle {
            color: #666;
            text-align: center;
            margin-bottom: 30px;
            font-size: 14px;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            color: #333;
            font-weight: 600;
            margin-bottom: 8px;
            font-size: 14px;
        }
        input {
            width: 100%;
            padding: 12px 15px;
            border: 2px solid #e0e0e0;
            border-radius: 10px;
            font-size: 16px;
            transition: all 0.3s;
        }
        input:focus {
            outline: none;
            border-color: #DC9E00;
            box-shadow: 0 0 0 3px rgba(220, 158, 0, 0.1);
        }
        .btn {
            width: 100%;
            padding: 14px;
            background-color: #DC9E00;
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
            margin-top: 10px;
        }
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(220, 158, 0, 0.3);
        }
        .btn:active {
            transform: translateY(0);
        }
        .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }
        .message {
            padding: 12px;
            border-radius: 10px;
            margin-bottom: 20px;
            display: none;
            font-size: 14px;
        }
        .message.error {
            background: #fee;
            color: #c33;
            border: 1px solid #fcc;
        }
        .message.success {
            background: #efe;
            color: #3c3;
            border: 1px solid #cfc;
        }
        .message.show {
            display: block;
        }
        .loading {
            display: none;
            text-align: center;
            margin-top: 10px;
        }
        .loading.show {
            display: block;
        }
        .spinner {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #DC9E00;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            animation: spin 1s linear infinite;
            margin: 0 auto;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .password-requirements {
            font-size: 12px;
            color: #666;
            margin-top: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <img src="https://encontrarshopping.com/logo-encontrar.png" alt="Encontrar" onerror="this.style.display='none'; document.querySelector('.logo-text').style.display='block';">
            <h1 class="logo-text" style="display:none; color: #DC9E00; font-size: 32px; font-weight: bold;">ENCONTRAR</h1>
        </div>
        <h2>Redefinir Senha</h2>
        <p class="subtitle">Digite sua nova senha abaixo</p>
        
        <div id="message" class="message"></div>
        
        <form id="resetForm">
            <div class="form-group">
                <label for="password">Nova Senha</label>
                <input type="password" id="password" name="password" required minlength="6" placeholder="Mínimo 6 caracteres">
                <div class="password-requirements">Mínimo de 6 caracteres</div>
            </div>
            
            <div class="form-group">
                <label for="confirmPassword">Confirmar Senha</label>
                <input type="password" id="confirmPassword" name="confirmPassword" required minlength="6" placeholder="Digite a senha novamente">
            </div>
            
            <button type="submit" class="btn" id="submitBtn">Redefinir Senha</button>
        </form>
        
        <div class="loading" id="loading">
            <div class="spinner"></div>
            <p style="margin-top: 10px; color: #666;">Processando...</p>
        </div>
    </div>

    <script>
        const token = '${token}';
        const form = document.getElementById('resetForm');
        const submitBtn = document.getElementById('submitBtn');
        const loading = document.getElementById('loading');
        const messageDiv = document.getElementById('message');

        // Verify token on page load
        async function verifyToken() {
            try {
                const response = await fetch(\`https://portal-api.encontrarshopping.com/api/resetpassword/verificToken?token=\${token}\`);
                const data = await response.json();
                
                if (data.statusCode === 404) {
                    showMessage('Token inválido ou expirado. Por favor, solicite um novo link de recuperação.', 'error');
                    submitBtn.disabled = true;
                }
            } catch (error) {
                console.error('Error verifying token:', error);
                showMessage('Erro ao verificar token. Tente novamente.', 'error');
            }
        }

        function showMessage(text, type) {
            messageDiv.textContent = text;
            messageDiv.className = 'message ' + type + ' show';
        }

        function hideMessage() {
            messageDiv.className = 'message';
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideMessage();
            
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            // Validate passwords match
            if (password !== confirmPassword) {
                showMessage('As senhas não coincidem. Por favor, tente novamente.', 'error');
                return;
            }
            
            // Validate password length
            if (password.length < 6) {
                showMessage('A senha deve ter no mínimo 6 caracteres.', 'error');
                return;
            }
            
            // Show loading
            submitBtn.disabled = true;
            loading.classList.add('show');
            
            try {
                const response = await fetch(\`https://portal-api.encontrarshopping.com/api/resetpassword/resetPassword/\${token}\`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ password })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    showMessage('✅ Senha alterada com sucesso! Redirecionando...', 'success');
                    setTimeout(() => {
                        window.location.href = 'https://encontrarshopping.com/auth';
                    }, 2000);
                } else {
                    showMessage(data.message || 'Erro ao alterar senha. Tente novamente.', 'error');
                    submitBtn.disabled = false;
                }
            } catch (error) {
                console.error('Error resetting password:', error);
                showMessage('Erro ao conectar com o servidor. Verifique sua conexão e tente novamente.', 'error');
                submitBtn.disabled = false;
            } finally {
                loading.classList.remove('show');
            }
        });

        // Verify token when page loads
        verifyToken();
    </script>
</body>
</html>
    `;
    
    return response.header('Content-Type', 'text/html').send(html);
  }
  
}

module.exports = ResetPasswordController
