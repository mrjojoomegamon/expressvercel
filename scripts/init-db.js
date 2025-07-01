import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL)

async function initializeDatabase() {
  try {
    console.log("🔄 Initializing database...")

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

    // Crear tabla de productos (con campos de precio actualizados)
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        regular_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        sale_price DECIMAL(10,2),
        is_on_sale BOOLEAN NOT NULL DEFAULT FALSE,
        mercado_libre_url VARCHAR(500) NOT NULL,
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

    // Crear tabla de carrito
    await sql`
      CREATE TABLE IF NOT EXISTS cart_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        product_id UUID REFERENCES products(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL CHECK (quantity > 0),
        price DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, product_id)
      )
    `

    // Crear tabla de lista de deseos
    await sql`
      CREATE TABLE IF NOT EXISTS wishlist_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        product_id UUID REFERENCES products(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, product_id)
      )
    `

    // Crear índices para mejorar el rendimiento
    await sql`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand)`
    await sql`CREATE INDEX IF NOT EXISTS idx_products_regular_price ON products(regular_price)`
    await sql`CREATE INDEX IF NOT EXISTS idx_products_sale_price ON products(sale_price)`
    await sql`CREATE INDEX IF NOT EXISTS idx_products_rating ON products(rating)`
    await sql`CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active)`
    await sql`CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured)`
    await sql`CREATE INDEX IF NOT EXISTS idx_products_on_sale ON products(is_on_sale)`
    await sql`CREATE INDEX IF NOT EXISTS idx_products_price_range ON products(regular_price, sale_price)`

    console.log("✅ Database tables created successfully")

    // Verificar que las tablas se crearon correctamente
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `

    console.log("📋 Created tables:")
    tables.forEach((table) => {
      console.log(`   ✓ ${table.table_name}`)
    })

    // Verificar estructura de la tabla products
    const productColumns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'products' 
      ORDER BY ordinal_position
    `

    console.log("\n📊 Products table structure:")
    productColumns.forEach((col) => {
      console.log(`   ${col.column_name}: ${col.data_type} ${col.is_nullable === "NO" ? "(NOT NULL)" : "(NULLABLE)"}`)
    })

    console.log("\n🎉 Database initialization completed successfully!")
  } catch (error) {
    console.error("❌ Error initializing database:", error)
    throw error
  }
}

// Función para verificar conexión
async function testConnection() {
  try {
    console.log("🔍 Testing database connection...")
    const result = await sql`SELECT NOW() as current_time, version() as db_version`
    console.log("✅ Database connection successful!")
    console.log(`⏰ Current time: ${result[0].current_time}`)
    console.log(`🗄️ Database version: ${result[0].db_version.split(" ")[0]}`)
    return true
  } catch (error) {
    console.error("❌ Database connection failed:", error)
    return false
  }
}

// Función principal
async function main() {
  try {
    console.log("🚀 Starting database initialization process...")

    // Verificar variables de entorno
    if (!process.env.DATABASE_URL) {
      console.error("❌ DATABASE_URL environment variable is required")
      process.exit(1)
    }

    console.log("✅ DATABASE_URL is configured")

    // Probar conexión
    const connectionOk = await testConnection()
    if (!connectionOk) {
      console.error("❌ Cannot proceed without database connection")
      process.exit(1)
    }

    // Inicializar base de datos
    await initializeDatabase()

    console.log("\n🎯 Next steps:")
    console.log("   1. Run: node scripts/seed-tech-emporium-with-pricing.js")
    console.log("   2. Test API endpoints")
    console.log("   3. Deploy to production")
  } catch (error) {
    console.error("❌ Initialization failed:", error)
    process.exit(1)
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { initializeDatabase, testConnection }
