module.exports = (ApiRoute, Route) => 
  // Protected routes
  ApiRoute(() => {
    // Get all product photos
    Route.get("/", "ProductPhotosController.index");
    
    // Get product photos sizes
    Route.get("/sizes", "ProductPhotosController.getSizes");
    
    // Get specific product photo (with optional thumbnail query param)
    Route.get("/:productId/photos/:photoId", "ProductPhotosController.show");
    
    // Add photo to product
    Route.post("/:productId/photos", "ProductPhotosController.store");
    
    // Create original product photo
    Route.post("/:productId/photos/original", "ProductPhotosController.createOriginal");
    
    // Delete product photo
    Route.delete("/:productId/photos/:photoId", "ProductPhotosController.destroy");
  }, 'products').namespace("App/Modules/Catalog/Controllers").middleware(["auth"]);

