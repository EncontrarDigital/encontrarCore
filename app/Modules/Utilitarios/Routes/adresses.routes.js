
    module.exports = (ApiRoute, Route) => 
    // Protected routes
    ApiRoute(() => {
      Route.get("/", "AdressesController.index");
      Route.get("/buildAddressTree", "AdressesController.buildAddressTree");
      Route.post("/", "AdressesController.store");
      Route.get("/:id", "AdressesController.show");
      Route.put("/:id", "AdressesController.update");
      Route.delete("/:id", "AdressesController.destroy");
    }, 'adresses').namespace("App/Modules/Utilitarios/Controllers").middleware(["auth"]);
    