
    module.exports = (ApiRoute, Route) =>
    // Protected routes
    ApiRoute(() => {
      Route.get("/products/shop", "AdminController.getProductsByShop").middleware(['role:sales,admin']);
      Route.get("/shop/info", "AdminController.getShopInfo").middleware(['role:sales,admin']);
      Route.get("/shop/notifications", "AdminController.getNotificationsByShop").middleware(['role:sales']);
      Route.get("/shop/orders", "AdminController.getAllOrdersByShop").middleware(['role:sales,admin,manager']);
      Route.get("/shop/orders/:id", "AdminController.getOrderByShop").middleware(['role:sales,admin,manager']);
      Route.post("/order/:id/acceptOrderByShop", "AdminController.acceptOrderByShop").middleware(['role:sales,admin,manager']);
      Route.post("/order/:id/cancelOrderByShop", "AdminController.cancelOrderByShop").middleware(['role:sales,admin,manager']);
      
      Route.get("/client/orders", "AdminController.findAllOrderByClient").middleware(['role:customer'])
      Route.get("/client/info", "AdminController.getClientInfo").middleware(['role:customer']);

    }, 'admin').namespace("App/Modules/Admin/Controllers").middleware(["auth"]);
    