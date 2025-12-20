
    module.exports = (ApiRoute, Route) => 
    // Protected routes
    ApiRoute(() => {
      Route.get("/", "UsersController.index").middleware(['role:admin']);
      Route.post("/", "UsersController.store").middleware(['role:admin']);
      Route.get("/:id", "UsersController.show").middleware(['role:admin']);
      Route.put("/:id", "UsersController.update").middleware(['role:admin']);
      Route.delete("/:id", "UsersController.destroy").middleware(['role:admin']);
    }, 'users').namespace("App/Modules/Authentication/Controllers").middleware(["auth"]);
    