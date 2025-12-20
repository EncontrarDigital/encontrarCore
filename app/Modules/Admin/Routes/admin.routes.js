
    module.exports = (ApiRoute, Route) => 
    // Protected routes
    ApiRoute(() => {
      Route.get("/products/shop", "AdminController.getProductsByShop");
      Route.get("/shop/info", "AdminController.getShopInfo");
      Route.get("/shop/orders", "AdminController.getAllOrdersByShop");
      Route.post("/order/:id/acceptOrderByShop", "AdminController.acceptOrderByShop");
      Route.post("/order/:id/cancelOrderByShop", "AdminController.cancelOrderByShop");
    }, 'admin').namespace("App/Modules/Admin/Controllers").middleware(["auth"]);
    