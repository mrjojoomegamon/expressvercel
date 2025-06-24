// Usar las variables de entorno existentes
const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL

console.log("🔍 Checking available database connections...")
console.log("DATABASE_URL:", !!process.env.DATABASE_URL)
console.log("POSTGRES_URL:", !!process.env.POSTGRES_URL)
console.log("POSTGRES_PRISMA_URL:", !!process.env.POSTGRES_PRISMA_URL)

if (!databaseUrl) {
  console.error("❌ No database URL found in environment variables")
  console.log("Available environment variables:")
  Object.keys(process.env)
    .filter((key) => key.includes("DATABASE") || key.includes("POSTGRES"))
    .forEach((key) => console.log(`   ${key}: ${process.env[key] ? "Set" : "Not set"}`))
  process.exit(1)
}

console.log("✅ Using database URL:", databaseUrl.substring(0, 20) + "...")

// Importar Neon y configurar
const { neon } = await import("@neondatabase/serverless")
const sql = neon(databaseUrl)

async function initializeDatabase() {
  try {
    console.log("🔄 Creating database tables...")

    // Crear tabla de categorías
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

    // Crear tabla de productos
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

    // Crear tabla de usuarios
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Crear tabla de reseñas
    await sql`
      CREATE TABLE IF NOT EXISTS product_reviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID REFERENCES products(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        user_name VARCHAR(255) NOT NULL,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        is_verified_purchase BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Crear índices
    await sql`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand)`
    await sql`CREATE INDEX IF NOT EXISTS idx_products_price ON products(price)`
    await sql`CREATE INDEX IF NOT EXISTS idx_products_rating ON products(rating)`
    await sql`CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active)`
    await sql`CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured)`

    console.log("✅ Database tables created successfully")
  } catch (error) {
    console.error("❌ Error creating tables:", error)
    throw error
  }
}

async function seedTechEmporium() {
  try {
    console.log("🚀 Starting Tech Emporium database initialization...")

    // Inicializar base de datos
    await initializeDatabase()

    console.log("🌱 Seeding database with sample data...")

    // Insertar categorías
    console.log("📂 Creating product categories...")
    await sql`
      INSERT INTO product_categories (name, slug) VALUES 
      ('Audio', 'audio'),
      ('Computación', 'computacion'),
      ('Smartphones', 'smartphones'),
      ('Gaming', 'gaming'),
      ('Accesorios', 'accesorios')
      ON CONFLICT (slug) DO NOTHING
    `

    // Obtener IDs de categorías
    const categories = await sql`SELECT id, slug FROM product_categories`
    const categoryMap = categories.reduce((acc, cat) => {
      acc[cat.slug] = cat.id
      return acc
    }, {})

    console.log("🛍️  Creating sample products...")

    // Insertar productos de ejemplo
    const products = [
      {
        name: "Audífonos Inalámbricos con Cancelación de Ruido",
        description:
          "Experiencia de sonido inmersiva con cancelación activa de ruido, batería de 30 horas y conectividad Bluetooth 5.0.",
        price: 199.99,
        imageUrl: "/placeholder.svg?height=400&width=400",
        images: ["/placeholder.svg?height=400&width=400"],
        altText: "Audífonos inalámbricos con cancelación de ruido",
        categoryId: categoryMap.audio,
        brand: "TechBrand",
        sku: "TB-WH-001",
        stock: 50,
        isFeatured: true,
        isTopPick: false,
        specifications: {
          connectivity: "Bluetooth 5.0",
          batteryLife: "30 hours",
          noiseCancellation: "Active",
          weight: "250g",
        },
      },
      {
        name: 'Laptop Gaming RGB 15.6"',
        description: "Potente laptop gaming con procesador Intel i7, 16GB RAM, SSD 512GB y tarjeta gráfica RTX 4060.",
        price: 1299.99,
        imageUrl: "/placeholder.svg?height=400&width=400",
        images: ["/placeholder.svg?height=400&width=400"],
        altText: "Laptop gaming con teclado RGB",
        categoryId: categoryMap.computacion,
        brand: "GamePro",
        sku: "GP-LT-002",
        stock: 15,
        isFeatured: true,
        isTopPick: true,
        specifications: {
          processor: "Intel Core i7-12700H",
          ram: "16GB DDR4",
          storage: "512GB SSD",
          graphics: "RTX 4060 8GB",
          display: '15.6" 144Hz',
        },
      },
      {
        name: "Smartphone Pro Max 256GB",
        description: 'El smartphone más avanzado con cámara triple de 108MP, pantalla AMOLED de 6.7".',
        price: 899.99,
        imageUrl: "/placeholder.svg?height=400&width=400",
        images: ["/placeholder.svg?height=400&width=400"],
        altText: "Smartphone Pro Max con cámara triple",
        categoryId: categoryMap.smartphones,
        brand: "MobileTech",
        sku: "MT-SP-003",
        stock: 30,
        isFeatured: false,
        isTopPick: true,
        specifications: {
          display: '6.7" AMOLED',
          camera: "108MP Triple",
          processor: "Snapdragon 8 Gen 2",
          storage: "256GB",
          battery: "5000mAh",
        },
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

    console.log("👥 Creating sample users...")
    await sql`
      INSERT INTO users (name, email) VALUES 
      ('Juan Pérez', 'juan@techuser.com'),
      ('María García', 'maria@techuser.com'),
      ('Carlos López', 'carlos@techuser.com')
      ON CONFLICT (email) DO NOTHING
    `

    // Mostrar estadísticas finales
    const stats = await Promise.all([
      sql`SELECT COUNT(*) as count FROM product_categories`,
      sql`SELECT COUNT(*) as count FROM products`,
      sql`SELECT COUNT(*) as count FROM users`,
    ])

    console.log("\n🎉 Tech Emporium database seeded successfully!")
    console.log("📊 Database Statistics:")
    console.log(`   📂 Categories: ${stats[0][0].count}`)
    console.log(`   🛍️  Products: ${stats[1][0].count}`)
    console.log(`   👥 Users: ${stats[2][0].count}`)
    console.log("\n✅ Your Tech Emporium API is ready to use!")
  } catch (error) {
    console.error("❌ Error seeding database:", error)
    throw error
  }
}

// Ejecutar el script
seedTechEmporium()
