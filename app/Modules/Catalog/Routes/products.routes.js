
    module.exports = (ApiRoute, Route) => 
    // Protected routes
    ApiRoute(() => {
      Route.get("/", "ProductsController.index");
      Route.post("/", "ProductsController.store").middleware(['role:sales']);
      Route.get("/category/:id", "ProductsController.getProductsByCategory");
      Route.get("/:id", "ProductsController.show");
      Route.get("/:id/shops", "ProductsController.getProductsByShop").middleware(["auth"]);;
      Route.put("/:id", "ProductsController.update").middleware(["auth"]);
      Route.delete("/:id", "ProductsController.destroy").middleware(["auth"]);;
    }, 'products').namespace("App/Modules/Catalog/Controllers")
    