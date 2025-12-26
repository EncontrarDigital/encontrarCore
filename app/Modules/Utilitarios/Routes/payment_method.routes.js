
    module.exports = (ApiRoute, Route) => 
    // Protected routes
    ApiRoute(() => {
      Route.get("/", "PaymentMethodController.index");
      Route.post("/", "PaymentMethodController.store");
      Route.get("/:id", "PaymentMethodController.show");
      Route.put("/:id", "PaymentMethodController.update");
      Route.delete("/:id", "PaymentMethodController.destroy");
    }, 'payment_methods').namespace("App/Modules/Utilitarios/Controllers").middleware(["auth"]);
    