import { sql } from "../lib/db.js"

export class ProductModel {
  static async findAll(filters = {}) {
    const {
      page = 1,
      limit = 12,
      category,
      brand,
      minPrice,
      maxPrice,
      search,
      sortBy = "created_at",
      sortOrder = "desc",
      isFeatured,
      isTopPick,
      isActive = true,
      isOnSale, // NUEVO: filtrar por productos en oferta
    } = filters

    const actualLimit = Math.min(limit, 50)
    const offset = (page - 1) * actualLimit

    try {
      // Construir la consulta base
      const whereConditions = []

      if (isActive !== undefined) {
        whereConditions.push(`p.is_active = ${isActive}`)
      }

      if (category) {
        whereConditions.push(`(c.slug = '${category}' OR c.id = '${category}')`)
      }

      if (brand) {
        whereConditions.push(`LOWER(p.brand) = LOWER('${brand}')`)
      }

      // ACTUALIZADO: Filtros de precio considerando ofertas
      if (minPrice !== undefined) {
        whereConditions.push(`(CASE WHEN p.is_on_sale THEN p.sale_price ELSE p.regular_price END) >= ${minPrice}`)
      }

      if (maxPrice !== undefined) {
        whereConditions.push(`(CASE WHEN p.is_on_sale THEN p.sale_price ELSE p.regular_price END) <= ${maxPrice}`)
      }

      if (search) {
        whereConditions.push(
          `(LOWER(p.name) LIKE LOWER('%${search}%') OR LOWER(p.description) LIKE LOWER('%${search}%'))`,
        )
      }

      if (isFeatured !== undefined) {
        whereConditions.push(`p.is_featured = ${isFeatured}`)
      }

      if (isTopPick !== undefined) {
        whereConditions.push(`p.is_top_pick = ${isTopPick}`)
      }

      // NUEVO: Filtro por productos en oferta
      if (isOnSale !== undefined) {
        whereConditions.push(`p.is_on_sale = ${isOnSale}`)
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : ""
      const validSortFields = [
        "created_at",
        "updated_at",
        "name",
        "regular_price",
        "sale_price",
        "rating",
        "review_count",
      ]
      const actualSortBy = validSortFields.includes(sortBy) ? sortBy : "created_at"
      const actualSortOrder = sortOrder === "asc" ? "ASC" : "DESC"

      // ACTUALIZADA: Consulta principal con nuevos campos de precio
      const products = await sql`
        SELECT 
          p.id,
          p.name,
          p.description,
          p.regular_price,
          p.sale_price,
          p.is_on_sale,
          p.mercado_libre_url,
          p.image_url as "imageUrl",
          p.images,
          p.rating,
          p.review_count as "reviewCount",
          p.alt_text as "altText",
          p.brand,
          p.sku,
          p.stock,
          p.is_active as "isActive",
          p.is_featured as "isFeatured",
          p.is_top_pick as "isTopPick",
          p.specifications,
          p.created_at as "createdAt",
          p.updated_at as "updatedAt",
          c.id as "categoryId",
          c.name as "categoryName",
          c.slug as "categorySlug",
          -- Campos calculados
          (CASE WHEN p.is_on_sale THEN p.sale_price ELSE p.regular_price END) as display_price,
          (CASE 
            WHEN p.is_on_sale AND p.sale_price IS NOT NULL 
            THEN ROUND(((p.regular_price - p.sale_price) / p.regular_price * 100)::numeric, 0)
            ELSE 0 
          END) as discount_percentage,
          (CASE 
            WHEN p.is_on_sale AND p.sale_price IS NOT NULL 
            THEN (p.regular_price - p.sale_price)
            ELSE 0 
          END) as savings_amount
        FROM products p
        LEFT JOIN product_categories c ON p.category_id = c.id
        ${whereConditions.length > 0 ? sql`WHERE ${sql.unsafe(whereConditions.join(" AND "))}` : sql``}
        ORDER BY ${sql.unsafe(`p.${actualSortBy} ${actualSortOrder}`)}
        LIMIT ${actualLimit} OFFSET ${offset}
      `

      // Contar total
      const countResult = await sql`
        SELECT COUNT(*) as total
        FROM products p
        LEFT JOIN product_categories c ON p.category_id = c.id
        ${whereConditions.length > 0 ? sql`WHERE ${sql.unsafe(whereConditions.join(" AND "))}` : sql``}
      `

      const totalItems = Number.parseInt(countResult[0].total)
      const totalPages = Math.ceil(totalItems / actualLimit)

      // ACTUALIZADO: Formatear productos con nuevos campos
      const formattedProducts = products.map((row) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        regular_price: Number.parseFloat(row.regular_price),
        sale_price: row.sale_price ? Number.parseFloat(row.sale_price) : null,
        is_on_sale: row.is_on_sale,
        mercado_libre_url: row.mercado_libre_url,
        display_price: Number.parseFloat(row.display_price), // Precio a mostrar
        discount_percentage: Number.parseInt(row.discount_percentage), // % descuento
        savings_amount: Number.parseFloat(row.savings_amount), // Ahorro en dinero
        imageUrl: row.imageUrl,
        images: row.images || [],
        rating: Number.parseFloat(row.rating || 0),
        reviewCount: row.reviewCount || 0,
        altText: row.altText,
        category: {
          id: row.categoryId,
          name: row.categoryName,
          slug: row.categorySlug,
        },
        brand: row.brand,
        sku: row.sku,
        stock: row.stock,
        isActive: row.isActive,
        isFeatured: row.isFeatured,
        isTopPick: row.isTopPick,
        specifications: row.specifications || {},
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      }))

      // Obtener información de filtros
      const categories = await sql`
        SELECT 
          c.id,
          c.name,
          COUNT(p.id) as count
        FROM product_categories c
        LEFT JOIN products p ON c.id = p.category_id AND p.is_active = true
        GROUP BY c.id, c.name
        HAVING COUNT(p.id) > 0
        ORDER BY c.name
      `

      const brands = await sql`
        SELECT 
          p.brand as name,
          COUNT(*) as count
        FROM products p
        WHERE p.is_active = true
        GROUP BY p.brand
        ORDER BY p.brand
      `

      // ACTUALIZADO: Rango de precios considerando ofertas
      const priceRange = await sql`
        SELECT 
          MIN(CASE WHEN is_on_sale THEN sale_price ELSE regular_price END) as min,
          MAX(CASE WHEN is_on_sale THEN sale_price ELSE regular_price END) as max
        FROM products
        WHERE is_active = true
      `

      return {
        products: formattedProducts,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: actualLimit,
          hasNext: page < totalPages,
          hasPrevious: page > 1,
        },
        filters: {
          appliedFilters: {
            ...(category && { category }),
            ...(brand && { brand }),
            ...(minPrice && { minPrice }),
            ...(maxPrice && { maxPrice }),
            ...(search && { search }),
            ...(isFeatured !== undefined && { isFeatured }),
            ...(isTopPick !== undefined && { isTopPick }),
            ...(isOnSale !== undefined && { isOnSale }), // NUEVO
          },
          availableCategories: categories.map((cat) => ({
            id: cat.id,
            name: cat.name,
            count: Number.parseInt(cat.count),
          })),
          availableBrands: brands.map((brand) => ({
            name: brand.name,
            count: Number.parseInt(brand.count),
          })),
          priceRange: {
            min: Number.parseFloat(priceRange[0]?.min || "0"),
            max: Number.parseFloat(priceRange[0]?.max || "0"),
          },
        },
      }
    } catch (error) {
      console.error("Error in ProductModel.findAll:", error)
      throw error
    }
  }

  static async findById(id) {
    try {
      const result = await sql`
        SELECT 
          p.id,
          p.name,
          p.description,
          p.regular_price,
          p.sale_price,
          p.is_on_sale,
          p.mercado_libre_url,
          p.image_url as "imageUrl",
          p.images,
          p.rating,
          p.review_count as "reviewCount",
          p.alt_text as "altText",
          p.brand,
          p.sku,
          p.stock,
          p.is_active as "isActive",
          p.is_featured as "isFeatured",
          p.is_top_pick as "isTopPick",
          p.specifications,
          p.created_at as "createdAt",
          p.updated_at as "updatedAt",
          c.id as "categoryId",
          c.name as "categoryName",
          c.slug as "categorySlug",
          -- Campos calculados
          (CASE WHEN p.is_on_sale THEN p.sale_price ELSE p.regular_price END) as display_price,
          (CASE 
            WHEN p.is_on_sale AND p.sale_price IS NOT NULL 
            THEN ROUND(((p.regular_price - p.sale_price) / p.regular_price * 100)::numeric, 0)
            ELSE 0 
          END) as discount_percentage,
          (CASE 
            WHEN p.is_on_sale AND p.sale_price IS NOT NULL 
            THEN (p.regular_price - p.sale_price)
            ELSE 0 
          END) as savings_amount
        FROM products p
        LEFT JOIN product_categories c ON p.category_id = c.id
        WHERE p.id = ${id}
      `

      if (result.length === 0) return null

      const row = result[0]
      return {
        id: row.id,
        name: row.name,
        description: row.description,
        regular_price: Number.parseFloat(row.regular_price),
        sale_price: row.sale_price ? Number.parseFloat(row.sale_price) : null,
        is_on_sale: row.is_on_sale,
        mercado_libre_url: row.mercado_libre_url,
        display_price: Number.parseFloat(row.display_price),
        discount_percentage: Number.parseInt(row.discount_percentage),
        savings_amount: Number.parseFloat(row.savings_amount),
        imageUrl: row.imageUrl,
        images: row.images || [],
        rating: Number.parseFloat(row.rating || 0),
        reviewCount: row.reviewCount || 0,
        altText: row.altText,
        category: {
          id: row.categoryId,
          name: row.categoryName,
          slug: row.categorySlug,
        },
        brand: row.brand,
        sku: row.sku,
        stock: row.stock,
        isActive: row.isActive,
        isFeatured: row.isFeatured,
        isTopPick: row.isTopPick,
        specifications: row.specifications || {},
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      }
    } catch (error) {
      console.error("Error in ProductModel.findById:", error)
      throw error
    }
  }

  // NUEVO: Método para crear producto con validaciones
  static async create(productData) {
    try {
      // Validar datos
      this.validateProductData(productData)

      const result = await sql`
        INSERT INTO products (
          name, description, regular_price, sale_price, is_on_sale, mercado_libre_url,
          image_url, images, alt_text, category_id, brand, sku, stock,
          is_active, is_featured, is_top_pick, specifications
        ) VALUES (
          ${productData.name},
          ${productData.description},
          ${productData.regular_price},
          ${productData.sale_price || null},
          ${productData.is_on_sale || false},
          ${productData.mercado_libre_url},
          ${productData.image_url},
          ${productData.images || []},
          ${productData.alt_text},
          ${productData.category_id},
          ${productData.brand},
          ${productData.sku},
          ${productData.stock || 0},
          ${productData.is_active !== undefined ? productData.is_active : true},
          ${productData.is_featured || false},
          ${productData.is_top_pick || false},
          ${JSON.stringify(productData.specifications || {})}
        )
        RETURNING *
      `

      return this.findById(result[0].id)
    } catch (error) {
      console.error("Error in ProductModel.create:", error)
      throw error
    }
  }

  // NUEVO: Método para actualizar producto
  static async update(id, productData) {
    try {
      // Validar datos si se proporcionan
      if (Object.keys(productData).length > 0) {
        this.validateProductData(productData, true) // true = partial update
      }

      const updateFields = []
      const values = []

      // Construir query dinámicamente
      Object.entries(productData).forEach(([key, value]) => {
        if (value !== undefined) {
          if (key === "specifications") {
            updateFields.push(`${key} = $${values.length + 1}`)
            values.push(JSON.stringify(value))
          } else {
            updateFields.push(`${key} = $${values.length + 1}`)
            values.push(value)
          }
        }
      })

      if (updateFields.length === 0) {
        throw new Error("No fields to update")
      }

      updateFields.push(`updated_at = CURRENT_TIMESTAMP`)

      await sql`
        UPDATE products 
        SET ${sql.unsafe(updateFields.join(", "))}
        WHERE id = ${id}
      `

      return this.findById(id)
    } catch (error) {
      console.error("Error in ProductModel.update:", error)
      throw error
    }
  }

  // NUEVO: Validaciones de datos de producto
  static validateProductData(data, isPartialUpdate = false) {
    const errors = []

    // Validar precio regular
    if (!isPartialUpdate || data.regular_price !== undefined) {
      if (!data.regular_price || data.regular_price <= 0) {
        errors.push("regular_price debe ser mayor a 0")
      }
    }

    // Validar precio de oferta
    if (data.sale_price !== undefined && data.sale_price !== null) {
      if (data.sale_price <= 0) {
        errors.push("sale_price debe ser mayor a 0")
      }
      if (data.regular_price && data.sale_price >= data.regular_price) {
        errors.push("sale_price debe ser menor que regular_price")
      }
    }

    // Validar lógica de oferta
    if (data.is_on_sale === true && !data.sale_price) {
      errors.push("sale_price es requerido cuando is_on_sale = true")
    }

    // Validar URL de MercadoLibre
    if (!isPartialUpdate || data.mercado_libre_url !== undefined) {
      const mlUrlPattern = /^https?:\/\/(www\.)?mercadolibre\.com\.(co|mx|ar|pe|cl|ec|bo|py|uy|ve)\/.+$/
      if (!data.mercado_libre_url || !mlUrlPattern.test(data.mercado_libre_url)) {
        errors.push("mercado_libre_url debe ser una URL válida de MercadoLibre")
      }
    }

    if (errors.length > 0) {
      throw new Error(`Errores de validación: ${errors.join(", ")}`)
    }
  }
}
