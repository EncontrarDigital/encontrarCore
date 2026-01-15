
    module.exports = (ApiRoute, Route) =>
    // Protected routes
    ApiRoute(() => {
      Route.get("/", "CategoriesController.index");
      Route.get("/buildCategoriesTree", "CategoriesController.buildCategoriesTree");
      Route.post("/", "CategoriesController.store").middleware(["auth"]);
      Route.get("/:id", "CategoriesController.show");
      Route.put("/:id", "CategoriesController.update").middleware(["auth"]);
      Route.delete("/:id", "CategoriesController.destroy").middleware(["auth"]);
      Route.post("/:id/icon", "CategoriesController.uploadIcon").middleware(["auth"]);
      Route.delete("/:id/icon", "CategoriesController.deleteIcon").middleware(["auth"]);
    }, 'categories').namespace("App/Modules/Catalog/Controllers")
