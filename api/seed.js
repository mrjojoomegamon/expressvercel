import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL)

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  try {
    console.log("🚀 Starting database seeding...")

    // Crear tablas
    await sql`
      CREATE TABLE IF NOT EXISTS product_categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        parent_id UUID REFERENCES product_categories(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        image_url TEXT NOT NULL,
        images TEXT[],
        rating DECIMAL(2,1) DEFAULT 0.0,
        review_count INTEGER DEFAULT 0,
        alt_text VARCHAR(255) NOT NULL,
        category_id UUID REFERENCES product_categories(id),
        brand VARCHAR(255) NOT NULL,
        sku VARCHAR(100) UNIQUE NOT NULL,
        stock INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        is_featured BOOLEAN DEFAULT false,
        is_top_pick BOOLEAN DEFAULT false,
        specifications JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Insertar categorías
    await sql`
      INSERT INTO product_categories (name, slug) VALUES 
      ('Audio', 'audio'),
      ('Computación', 'computacion'),
      ('Smartphones', 'smartphones'),
      ('Gaming', 'gaming'),
      ('Accesorios', 'accesorios'),
      ('Wearables', 'wearables'),
      ('Smart Home', 'smart-home')
      ON CONFLICT (slug) DO NOTHING
    `

    // Obtener categorías
    const categories = await sql`SELECT id, slug FROM product_categories`
    const categoryMap = categories.reduce((acc, cat) => {
      acc[cat.slug] = cat.id
      return acc
    }, {})

    // Insertar productos
    const products = [
      {
        name: "Audífonos Inalámbricos Premium",
        description: "Audífonos con cancelación de ruido activa y 30 horas de batería",
        price: 199.99,
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
        images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"],
        altText: "Audífonos inalámbricos premium",
        categoryId: categoryMap.audio,
        brand: "TechBrand",
        sku: "TB-WH-001",
        stock: 50,
        isFeatured: true,
        isTopPick: false,
        specifications: { connectivity: "Bluetooth 5.3", batteryLife: "30 hours" },
      },
      {
        name: "Laptop Gaming RTX 4060",
        description: "Laptop gaming con RTX 4060 y pantalla 144Hz",
        price: 1299.99,
        imageUrl: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400",
        images: ["https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400"],
        altText: "Laptop gaming RTX 4060",
        categoryId: categoryMap.computacion,
        brand: "GamePro",
        sku: "GP-LT-002",
        stock: 15,
        isFeatured: true,
        isTopPick: true,
        specifications: { processor: "Intel i7", graphics: "RTX 4060" },
      },
      {
        name: "Smartphone Pro Max 256GB",
        description: "Smartphone con cámara 108MP y pantalla AMOLED",
        price: 899.99,
        imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400",
        images: ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400"],
        altText: "Smartphone Pro Max",
        categoryId: categoryMap.smartphones,
        brand: "MobileTech",
        sku: "MT-SP-003",
        stock: 30,
        isFeatured: false,
        isTopPick: true,
        specifications: { camera: "108MP", storage: "256GB" },
      },
    ]

    for (const product of products) {
      await sql`
        INSERT INTO products (
          name, description, price, image_url, images, alt_text,
          category_id, brand, sku, stock, is_featured, is_top_pick,
          specifications
        ) VALUES (
          ${product.name},
          ${product.description},
          ${product.price},
          ${product.imageUrl},
          ${product.images},
          ${product.altText},
          ${product.categoryId},
          ${product.brand},
          ${product.sku},
          ${product.stock},
          ${product.isFeatured},
          ${product.isTopPick},
          ${JSON.stringify(product.specifications)}
        )
        ON CONFLICT (sku) DO NOTHING
      `
    }

    const stats = await Promise.all([
      sql`SELECT COUNT(*) as count FROM product_categories`,
      sql`SELECT COUNT(*) as count FROM products`,
    ])

    res.json({
      success: true,
      message: "Database seeded successfully",
      stats: {
        categories: stats[0][0].count,
        products: stats[1][0].count,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Seeding error:", error)
    res.status(500).json({
      success: false,
      message: "Error seeding database",
      error: error.message,
      timestamp: new Date().toISOString(),
    })
  }
}
