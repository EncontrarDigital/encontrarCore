
    module.exports = (ApiRoute, Route) => 
    // Protected routes
    ApiRoute(() => {
      Route.get("/", "ProductsController.index");
      Route.post("/", "ProductsController.store");
      Route.get("/:id", "ProductsController.show");
      Route.get("/by/shop", "ProductsController.getProductsByShop");
      Route.put("/:id", "ProductsController.update");
      Route.delete("/:id", "ProductsController.destroy");
    }, 'products').namespace("App/Modules/Catalog/Controllers").middleware(["auth"]);
    