
    module.exports = (ApiRoute, Route) => 
    // Protected routes
    ApiRoute(() => {
      Route.get("/", "OrderController.index").middleware(['auth','role:admin,manager']);
      Route.post("/", "OrderController.store");
      Route.get("/:id", "OrderController.show").middleware(['auth','role:admin,customer,manager']);
      Route.put("/:id", "OrderController.update").middleware(['auth','role:admin,manager']);
      Route.delete("/:id", "OrderController.destroy").middleware(['auth','role:admin,manager']);
    }, 'orders').namespace("App/Modules/Sales/Controllers")
    