
    module.exports = (ApiRoute, Route) => 
    // Protected routes
    ApiRoute(() => {
      Route.get("/products/shop", "AdminController.getProductsByShop").middleware(['role:sales,admin']);
      Route.get("/shop/info", "AdminController.getShopInfo").middleware(['role:sales,admin']);
      Route.get("/shop/orders", "AdminController.getAllOrdersByShop").middleware(['role:sales,admin']);
      Route.post("/order/:id/acceptOrderByShop", "AdminController.acceptOrderByShop").middleware(['role:sales,admin']);
      Route.post("/order/:id/cancelOrderByShop", "AdminController.cancelOrderByShop").middleware(['role:sales,admin']);
    }, 'admin').namespace("App/Modules/Admin/Controllers").middleware(["auth"]);
    