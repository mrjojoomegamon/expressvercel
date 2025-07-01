import { ProductModel } from "../models/Product.js"
import { sql } from "sql-template-tag" // Declare the sql variable

/**
 * Convierte valores de querystring en números si corresponde
 */
function toNumber(value) {
  const n = Number(value)
  return Number.isNaN(n) ? undefined : n
}

/**
 * Convierte string a boolean
 */
function toBoolean(value) {
  if (value === undefined || value === null) return undefined
  return value === "true" || value === "1"
}

export const productController = {
  /**
   * GET /v1/products
   * Lista paginada con filtros (ACTUALIZADO con filtro isOnSale)
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
        isFeatured: toBoolean(req.query.isFeatured),
        isTopPick: toBoolean(req.query.isTopPick),
        isActive: req.query.isActive !== undefined ? toBoolean(req.query.isActive) : true,
        isOnSale: toBoolean(req.query.isOnSale), // NUEVO filtro
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
   * ACTUALIZADO: Crear producto con nuevos campos de precio
   */
  async create(req, res) {
    try {
      const productData = {
        name: req.body.name,
        description: req.body.description,
        regular_price: req.body.regular_price,
        sale_price: req.body.sale_price,
        is_on_sale: req.body.is_on_sale,
        mercado_libre_url: req.body.mercado_libre_url,
        image_url: req.body.image_url || req.body.imageUrl,
        images: req.body.images,
        alt_text: req.body.alt_text || req.body.altText,
        category_id: req.body.category?.id || req.body.category_id,
        brand: req.body.brand,
        sku: req.body.sku,
        stock: req.body.stock,
        is_active: req.body.is_active,
        is_featured: req.body.is_featured,
        is_top_pick: req.body.is_top_pick,
        specifications: req.body.specifications,
      }

      const product = await ProductModel.create(productData)

      res.status(201).json({
        success: true,
        data: product,
        message: "Product created successfully",
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error("[create] error:", error)
      res.status(400).json({
        success: false,
        message: "Error creating product",
        error: error.message,
        timestamp: new Date().toISOString(),
      })
    }
  },

  /**
   * PUT /v1/products/:id
   * ACTUALIZADO: Actualizar producto con nuevos campos
   */
  async update(req, res) {
    try {
      const { id } = req.params
      const updateData = {}

      // Solo incluir campos que se proporcionaron
      const allowedFields = [
        "name",
        "description",
        "regular_price",
        "sale_price",
        "is_on_sale",
        "mercado_libre_url",
        "image_url",
        "images",
        "alt_text",
        "category_id",
        "brand",
        "sku",
        "stock",
        "is_active",
        "is_featured",
        "is_top_pick",
        "specifications",
      ]

      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field]
        }
      })

      // Manejar campos con nombres alternativos
      if (req.body.imageUrl !== undefined) updateData.image_url = req.body.imageUrl
      if (req.body.altText !== undefined) updateData.alt_text = req.body.altText
      if (req.body.category?.id !== undefined) updateData.category_id = req.body.category.id

      const product = await ProductModel.update(id, updateData)

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
        message: "Product updated successfully",
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error("[update] error:", error)
      res.status(400).json({
        success: false,
        message: "Error updating product",
        error: error.message,
        timestamp: new Date().toISOString(),
      })
    }
  },

  /**
   * DELETE /v1/products/:id
   */
  async delete(req, res) {
    try {
      const { id } = req.params

      const result = await sql`
        DELETE FROM products 
        WHERE id = ${id}
      `

      if (result.count === 0) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
          timestamp: new Date().toISOString(),
        })
      }

      res.json({
        success: true,
        message: "Product deleted successfully",
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error("[delete] error:", error)
      res.status(500).json({
        success: false,
        message: "Error deleting product",
        error: error.message,
        timestamp: new Date().toISOString(),
      })
    }
  },

  /**
   * NUEVO: GET /v1/products/on-sale
   * Endpoint específico para productos en oferta
   */
  async getOnSale(req, res) {
    try {
      const filters = {
        ...req.query,
        isOnSale: true,
        isActive: true,
      }

      const data = await ProductModel.findAll(filters)

      res.json({
        success: true,
        data,
        message: "Products on sale retrieved successfully",
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error("[getOnSale] error:", error)
      res.status(500).json({
        success: false,
        message: "Error retrieving products on sale",
        error: error.message,
        timestamp: new Date().toISOString(),
      })
    }
  },
}
