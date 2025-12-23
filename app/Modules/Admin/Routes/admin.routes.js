
    module.exports = (ApiRoute, Route) => 
    // Protected routes
    ApiRoute(() => {
      Route.get("/products/shop", "AdminController.getProductsByShop").middleware(['role:sales,admin']);
      Route.get("/shop/info", "AdminController.getShopInfo").middleware(['role:sales,admin']);
      Route.get("/shop/orders", "AdminController.getAllOrdersByShop").middleware(['role:sales,admin']);
      Route.post("/order/:id/acceptOrderByShop", "AdminController.acceptOrderByShop").middleware(['role:sales,admin']);
      Route.post("/order/:id/cancelOrderByShop", "AdminController.cancelOrderByShop").middleware(['role:sales,admin']);
      
      Route.get("/client/orders", "AdminController.findAllOrderByClient").middleware(['role:customer'])
      Route.post("/auth/login", "AuthenticatedController.authenticateAsPartner").middleware(['role:sales'])//.validator("AuthenticateUser");

    }, 'admin').namespace("App/Modules/Admin/Controllers").middleware(["auth"]);
    