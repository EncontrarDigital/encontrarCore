
module.exports = (ApiRoute, Route) => {
  // Protected routes
  ApiRoute(() => {
    Route.get("/", "NotificationController.index");
    Route.post("/", "NotificationController.store");
    Route.get("/:id", "NotificationController.show");
    Route.put("/:id", "NotificationController.readNotification");
    Route.put("/read/all-notifications", "NotificationController.readAllNotifications");
    Route.put("/:id", "NotificationController.update");
    Route.delete("/:id", "NotificationController.destroy");
    // Firebase Push Notifications Routes
    Route.post("/device-token/register", "DeviceTokenController.register");
    Route.post("/device-token/unregister", "DeviceTokenController.unregister");
    Route.get("/device-token/list", "DeviceTokenController.list");
    Route.get("/device-token/:id", "DeviceTokenController.show");
    Route.delete("/device-token/delete-all", "DeviceTokenController.deleteAll");
  }, 'notifications').namespace("App/Modules/Notification/Controllers").middleware(["auth"]);

  // Test routes (no auth required for testing)
  ApiRoute(() => {
    Route.post("/send", "NotificationTestController.sendTestNotification");
    Route.get("/tokens/:userId", "NotificationTestController.getUserTokens");
    Route.post("/register-test-token", "NotificationTestController.registerTestToken");
    Route.get("/firebase-status", "NotificationTestController.getFirebaseStatus");
  }, 'notifications/test').namespace("App/Modules/Notification/Controllers/Http");
}
