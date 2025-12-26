
    module.exports = (ApiRoute, Route) =>
    // Protected routes
    ApiRoute(() => {
      Route.get("/", "NotificationController.index");
      Route.post("/", "NotificationController.store");
      Route.get("/:id", "NotificationController.show");
      Route.put("/:id", "NotificationController.update");
      Route.delete("/:id", "NotificationController.destroy");
    }, 'notifications').namespace("App/Modules/Notification/Controllers").middleware(["auth"]);
