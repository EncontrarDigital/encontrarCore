
    module.exports = (ApiRoute, Route) => 
    // Protected routes
    ApiRoute(() => {
      Route.get("/", "OrderController.index").middleware(['role:admin, manager']);
      Route.post("/", "OrderController.store");
      Route.get("/:id", "OrderController.show").middleware(['role:admin, manager']);
      Route.put("/:id", "OrderController.update").middleware(['role:admin, manager']);
      Route.delete("/:id", "OrderController.destroy").middleware(['role:admin, manager']);
    }, 'orders').namespace("App/Modules/Sales/Controllers").middleware(["auth"]);
    