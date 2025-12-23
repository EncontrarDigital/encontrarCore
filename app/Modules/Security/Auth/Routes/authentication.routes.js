module.exports = (ApiRoute, Route) =>
  // Authentication Group Route
ApiRoute(() => {
    Route.put("/password/updatePassword", "ResetPasswordController.updatePassword").middleware(["auth"]);

    Route.get("/me", "AuthenticatedController.show").middleware(["auth"]);
    Route.get("/recover-password-sending-email", "AuthenticatedController.recoverPasswordSendingEmail")
    Route.post("/login", "AuthenticatedController.authenticate").middleware(['role:customer,admin,manager']);//.validator("AuthenticateUser");

    Route.post("/logout", "AuthenticatedController.logout").middleware(["auth"]);
    Route.post("/changeIsLoggedUser", "AuthenticatedController.changeIsLoggedUser");
    Route.post("/refresh", "AuthenticatedController.refreshTokenContinue")
    Route.post("/refresh-token", "AuthenticatedController.refreshTokenContinue");

    //Route.post("/password/reset","ResetPasswordController.sendResetLinkEmail").validator("ForgotPassword");

    Route.post("/password/resetByUserAuth","ResetPasswordController.resetPassword").validator("App/Modules/Security/Auth/Validators/ResetPassword").middleware(["auth"]);

}, "auth").namespace('App/Modules/Security/Auth/Controllers')
