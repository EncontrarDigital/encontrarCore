
    module.exports = (ApiRoute, Route) => 
    // Protected routes
    ApiRoute(() => {
      Route.get("/", "OrderController.index");
      Route.post("/", "OrderController.store");
      Route.get("/:id", "OrderController.show");
      Route.put("/:id", "OrderController.update");
      Route.delete("/:id", "OrderController.destroy");
    }, 'orders').namespace("App/Modules/Sales/Controllers")//.middleware(["auth"]);
    