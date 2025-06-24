import { Router } from "express"
import { productController } from "../controllers/productController.js"

// --------------------------------------------------
// Router para /v1/products
// --------------------------------------------------
const productRoutes = Router()

productRoutes.get("/", productController.getAll)
productRoutes.get("/:id", productController.getById)
productRoutes.post("/", productController.create)
productRoutes.put("/:id", productController.update)
productRoutes.delete("/:id", productController.delete)

export default productRoutes
