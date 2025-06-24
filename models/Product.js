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

      if (minPrice !== undefined) {
        whereConditions.push(`p.price >= ${minPrice}`)
      }

      if (maxPrice !== undefined) {
        whereConditions.push(`p.price <= ${maxPrice}`)
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

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : ""
      const validSortFields = ["created_at", "updated_at", "name", "price", "rating", "review_count"]
      const actualSortBy = validSortFields.includes(sortBy) ? sortBy : "created_at"
      const actualSortOrder = sortOrder === "asc" ? "ASC" : "DESC"

      // Consulta principal usando template literals
      const products = await sql`
        SELECT 
          p.id,
          p.name,
          p.description,
          p.price,
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
          c.slug as "categorySlug"
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

      // Formatear productos
      const formattedProducts = products.map((row) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        price: Number.parseFloat(row.price),
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

      const priceRange = await sql`
        SELECT 
          MIN(price) as min,
          MAX(price) as max
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
          p.price,
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
          c.slug as "categorySlug"
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
        price: Number.parseFloat(row.price),
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
}
