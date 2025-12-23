
    module.exports = (ApiRoute, Route) =>
    // Protected routes
    ApiRoute(() => {
      Route.get("/", "CategoriesController.index");
      Route.get("/buildCategoriesTree", "CategoriesController.buildCategoriesTree");
      Route.post("/", "CategoriesController.store");
      Route.get("/:id", "CategoriesController.show");
      Route.put("/:id", "CategoriesController.update");
      Route.delete("/:id", "CategoriesController.destroy");
    }, 'categories').namespace("App/Modules/Catalog/Controllers").middleware(["auth"]);
