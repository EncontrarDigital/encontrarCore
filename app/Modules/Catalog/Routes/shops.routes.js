
    module.exports = (ApiRoute, Route) => 
    // Protected routes
    ApiRoute(() => {
      Route.get("/", "ShopController.index").middleware(['role:admin, manager']);
      Route.post("/", "ShopController.store").middleware(['role:admin, manager']);
      Route.get("/:id", "ShopController.show").middleware(['role:admin, manager, sales']);
      Route.put("/:id", "ShopController.update").middleware(['role:admin, manager, sales']);
      Route.delete("/:id", "ShopController.destroy").middleware(['role:admin, manager, sales']);
    }, 'shops').namespace("App/Modules/Catalog/Controllers").middleware(["auth"]);
    