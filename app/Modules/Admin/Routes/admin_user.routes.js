
    module.exports = (ApiRoute, Route) => 
    // Protected routes
    ApiRoute(() => {
      Route.post("/auth/login", "AdminController.authenticateAsPartner")//.validator("AuthenticateUser");
    }, 'shop').namespace("App/Modules/Admin/Controllers");
    