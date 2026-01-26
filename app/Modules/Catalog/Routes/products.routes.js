
    module.exports = (ApiRoute, Route) => {
    // Protected routes
    ApiRoute(() => {
      Route.get("/", "ProductsController.index");
      Route.get("/category/:id", "ProductsController.getProductsByCategory");
      Route.get("/category-slug/:slug", "ProductsController.getProductsByCategorySlug");
      Route.get("/:id", "ProductsController.show");
    }, 'products').namespace("App/Modules/Catalog/Controllers");
  
  
  ApiRoute(() => {
      Route.post("/", "ProductsController.store").middleware(['role:sales']);
      Route.get("/:id/shops", "ProductsController.getProductsByShop").middleware(["auth"]);
      Route.put("/:id", "ProductsController.update").middleware(["auth"]);
      Route.delete("/:id", "ProductsController.destroy").middleware(["auth"]);
    }, 'products').namespace("App/Modules/Catalog/Controllers").middleware(["auth"]);
  }