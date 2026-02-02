
    module.exports = (ApiRoute, Route) =>
    // Protected routes
    ApiRoute(() => {
      Route.get("/", "ResetPasswordController.index");
      Route.post("/", "ResetPasswordController.store");
      Route.get("/recover-password-sending-email", "ResetPasswordController.recoverPasswordSendingEmail");
      Route.get("/verificToken", "ResetPasswordController.verificToken");
      Route.get("/reset-password-page", "ResetPasswordController.resetPasswordPage");
      Route.put("resetPassword/:token", "ResetPasswordController.resetPassword");
      Route.put("/:id", "ResetPasswordController.update");
      Route.delete("/:id", "ResetPasswordController.destroy");
    }, 'resetpassword').namespace('App/Modules/Security/Auth/Controllers')
    