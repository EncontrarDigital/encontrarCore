
    module.exports = (ApiRoute, Route) => 
    // Protected routes
    ApiRoute(() => {
      Route.get("/", "AdressesController.index");
      Route.get("/buildAddressTree", "AdressesController.buildAddressTree");
      Route.get("/getDeliveryTaxByCityName", "AdressesController.getDeliveryTaxByCityName");
      Route.post("/", "AdressesController.store").middleware(["auth"]);
      Route.get("/:id", "AdressesController.show");
      Route.put("/:id", "AdressesController.update").middleware(["auth"]);
      Route.delete("/:id", "AdressesController.destroy").middleware(["auth"]);
    }, 'adresses').namespace("App/Modules/Utilitarios/Controllers")
    