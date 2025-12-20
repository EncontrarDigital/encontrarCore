
    module.exports = (ApiRoute, Route) => 
    // Protected routes
    ApiRoute(() => {
      Route.get("/", "OrderController.index").middleware(['role:admin']);
      Route.post("/", "OrderController.store").middleware(['role:admin']);
      Route.get("/:id", "OrderController.show").middleware(['role:admin']);
      Route.put("/:id", "OrderController.update").middleware(['role:admin']);
      Route.delete("/:id", "OrderController.destroy").middleware(['role:admin']);
    }, 'orders').namespace("App/Modules/Sales/Controllers").middleware(["auth"]);
    