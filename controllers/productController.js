// controllers/productController.js
// --------------------------------------------------
// Controlador de productos: implementa las operaciones CRUD
// --------------------------------------------------

import { ProductModel } from "../models/Product.js"

/**
 * Convierte valores de querystring en números si corresponde
 */
function toNumber(value) {
  const n = Number(value)
  return Number.isNaN(n) ? undefined : n
}

export const productController = {
  /**
   * GET /v1/products
   * Lista paginada con filtros
   */
  async getAll(req, res) {
    try {
      const filters = {
        page: toNumber(req.query.page) || 1,
        limit: toNumber(req.query.limit) || 12,
        category: req.query.category,
        brand: req.query.brand,
        minPrice: toNumber(req.query.minPrice),
        maxPrice: toNumber(req.query.maxPrice),
        search: req.query.search,
        sortBy: req.query.sortBy || "created_at",
        sortOrder: req.query.sortOrder === "asc" ? "asc" : "desc",
        isFeatured: req.query.isFeatured ? req.query.isFeatured === "true" : undefined,
        isTopPick: req.query.isTopPick ? req.query.isTopPick === "true" : undefined,
        isActive: req.query.isActive !== undefined ? req.query.isActive === "true" : true,
      }

      const data = await ProductModel.findAll(filters)

      res.json({
        success: true,
        data,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error("[getAll] error:", error)
      res.status(500).json({
        success: false,
        message: "Error retrieving products",
        error: error.message,
        timestamp: new Date().toISOString(),
      })
    }
  },

  /**
   * GET /v1/products/:id
   */
  async getById(req, res) {
    try {
      const { id } = req.params
      const product = await ProductModel.findById(id)

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
          timestamp: new Date().toISOString(),
        })
      }

      res.json({
        success: true,
        data: product,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error("[getById] error:", error)
      res.status(500).json({
        success: false,
        message: "Error retrieving product",
        error: error.message,
        timestamp: new Date().toISOString(),
      })
    }
  },

  /**
   * POST /v1/products
   * (implementación mínima: aún no disponible)
   */
  async create(_req, res) {
    res.status(501).json({ success: false, message: "Not implemented", timestamp: new Date().toISOString() })
  },

  /**
   * PUT /v1/products/:id
   */
  async update(_req, res) {
    res.status(501).json({ success: false, message: "Not implemented", timestamp: new Date().toISOString() })
  },

  /**
   * DELETE /v1/products/:id
   */
  async delete(_req, res) {
    res.status(501).json({ success: false, message: "Not implemented", timestamp: new Date().toISOString() })
  },
}
