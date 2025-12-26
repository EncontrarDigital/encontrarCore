
    module.exports = (ApiRoute, Route) => {
      // Rotas públicas
      ApiRoute(() => {
        // Permite que qualquer um (autenticado ou não) crie um pedido
        Route.post("/", "OrderController.store");
        // Permite que qualquer um consulte um pedido pelo ID
        Route.get("/:id", "OrderController.show");
      }, 'orders').namespace("App/Modules/Sales/Controllers");
      
      // Rotas protegidas que requerem autenticação
      ApiRoute(() => {
        // Apenas admin/manager podem listar todos os pedidos
        Route.get("/", "OrderController.index").middleware(['auth','role:admin,manager']);
        // Apenas admin/manager podem atualizar pedidos
        Route.put("/:id", "OrderController.update").middleware(['auth','role:admin,manager']);
        // Apenas admin/manager podem excluir pedidos
        Route.delete("/:id", "OrderController.destroy").middleware(['auth','role:admin,manager']);
      }, 'orders').namespace("App/Modules/Sales/Controllers")
    };
    