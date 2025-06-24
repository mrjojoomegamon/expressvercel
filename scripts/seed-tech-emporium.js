import { neon } from "@neondatabase/serverless"

// Configurar conexión a la base de datos
const sql = neon(process.env.DATABASE_URL)

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

    // Crear índices para mejorar el rendimiento
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
          "Experiencia de sonido inmersiva con cancelación activa de ruido, batería de 30 horas y conectividad Bluetooth 5.0. Perfectos para trabajo y entretenimiento.",
        price: 199.99,
        imageUrl: "/placeholder.svg?height=400&width=400",
        images: ["/placeholder.svg?height=400&width=400", "/placeholder.svg?height=400&width=400"],
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
        description:
          "Potente laptop gaming con procesador Intel i7, 16GB RAM, SSD 512GB y tarjeta gráfica RTX 4060. Teclado RGB y pantalla 144Hz.",
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
        description:
          'El smartphone más avanzado con cámara triple de 108MP, pantalla AMOLED de 6.7", procesador octa-core y carga rápida de 65W.',
        price: 899.99,
        imageUrl: "/placeholder.svg?height=400&width=400",
        images: ["/placeholder.svg?height=400&width=400", "/placeholder.svg?height=400&width=400"],
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
      {
        name: "Teclado Mecánico RGB Gaming",
        description:
          "Teclado mecánico con switches Cherry MX, iluminación RGB personalizable, teclas programables y construcción de aluminio.",
        price: 129.99,
        imageUrl: "/placeholder.svg?height=400&width=400",
        images: ["/placeholder.svg?height=400&width=400"],
        altText: "Teclado mecánico RGB para gaming",
        categoryId: categoryMap.gaming,
        brand: "KeyMaster",
        sku: "KM-KB-004",
        stock: 75,
        isFeatured: false,
        isTopPick: false,
        specifications: {
          switches: "Cherry MX Red",
          lighting: "RGB per-key",
          connectivity: "USB-C",
          material: "Aluminum frame",
        },
      },
      {
        name: "Mouse Gaming Inalámbrico 16000 DPI",
        description:
          "Mouse gaming de alta precisión con sensor óptico de 16000 DPI, 8 botones programables y batería de 70 horas.",
        price: 79.99,
        imageUrl: "/placeholder.svg?height=400&width=400",
        images: ["/placeholder.svg?height=400&width=400"],
        altText: "Mouse gaming inalámbrico de alta precisión",
        categoryId: categoryMap.gaming,
        brand: "GamePro",
        sku: "GP-MS-005",
        stock: 60,
        isFeatured: false,
        isTopPick: false,
        specifications: {
          dpi: "16000 DPI",
          buttons: "8 programmable",
          battery: "70 hours",
          connectivity: "2.4GHz wireless",
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
    // Insertar usuarios de ejemplo
    await sql`
      INSERT INTO users (name, email) VALUES 
      ('Juan Pérez', 'juan@techuser.com'),
      ('María García', 'maria@techuser.com'),
      ('Carlos López', 'carlos@techuser.com')
      ON CONFLICT (email) DO NOTHING
    `

    console.log("⭐ Creating sample reviews...")
    // Insertar reseñas de ejemplo
    const users = await sql`SELECT id FROM users LIMIT 3`
    const productIds = await sql`SELECT id FROM products LIMIT 3`

    if (users.length > 0 && productIds.length > 0) {
      await sql`
        INSERT INTO product_reviews (product_id, user_id, user_name, rating, comment, is_verified_purchase) VALUES 
        (${productIds[0].id}, ${users[0].id}, 'Juan Pérez', 5, 'Excelente calidad de sonido y muy cómodos', true),
        (${productIds[0].id}, ${users[1].id}, 'María García', 4, 'Muy buenos audífonos, la cancelación de ruido funciona perfecto', true),
        (${productIds[1].id}, ${users[2].id}, 'Carlos López', 5, 'Increíble rendimiento para gaming, muy recomendado', true)
      `

      // Actualizar rating y review count de productos
      await sql`
        UPDATE products SET 
          rating = 4.7,
          review_count = 2
        WHERE id = ${productIds[0].id}
      `

      await sql`
        UPDATE products SET 
          rating = 5.0,
          review_count = 1
        WHERE id = ${productIds[1].id}
      `
    }

    // Mostrar estadísticas finales
    const stats = await Promise.all([
      sql`SELECT COUNT(*) as count FROM product_categories`,
      sql`SELECT COUNT(*) as count FROM products`,
      sql`SELECT COUNT(*) as count FROM users`,
      sql`SELECT COUNT(*) as count FROM product_reviews`,
    ])

    console.log("\n🎉 Tech Emporium database seeded successfully!")
    console.log("📊 Database Statistics:")
    console.log(`   📂 Categories: ${stats[0][0].count}`)
    console.log(`   🛍️  Products: ${stats[1][0].count}`)
    console.log(`   👥 Users: ${stats[2][0].count}`)
    console.log(`   ⭐ Reviews: ${stats[3][0].count}`)
    console.log("\n✅ Your Tech Emporium API is ready to use!")
    console.log("🚀 You can now test the endpoints:")
    console.log("   GET /v1/products - List all products")
    console.log("   GET /v1/products?category=gaming - Filter by category")
    console.log("   GET /v1/products?isFeatured=true - Get featured products")
  } catch (error) {
    console.error("❌ Error seeding database:", error)
    throw error
  }
}

// Ejecutar el script
seedTechEmporium()
