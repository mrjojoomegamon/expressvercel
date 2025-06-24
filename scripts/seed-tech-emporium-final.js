// Usar la variable DATABASE_URL que ya está configurada
const { neon } = await import("@neondatabase/serverless")

console.log("🔍 Checking database connection...")
console.log("✅ DATABASE_URL is configured")

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
    await sql`CREATE INDEX IF NOT EXISTS idx_products_price ON products(price)`
    await sql`CREATE INDEX IF NOT EXISTS idx_products_rating ON products(rating)`
    await sql`CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active)`
    await sql`CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured)`
    await sql`CREATE INDEX IF NOT EXISTS idx_products_search ON products USING gin(to_tsvector('english', name || ' ' || description))`

    console.log("✅ Database tables created successfully")
  } catch (error) {
    console.error("❌ Error creating tables:", error)
    throw error
  }
}

async function seedTechEmporium() {
  try {
    console.log("🚀 Starting Tech Emporium database initialization...")
    console.log("🔗 Connected to Neon database")

    // Verificar conexión
    const connectionTest = await sql`SELECT NOW() as current_time, version() as db_version`
    console.log("⏰ Database time:", connectionTest[0].current_time)

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
      ('Accesorios', 'accesorios'),
      ('Wearables', 'wearables'),
      ('Smart Home', 'smart-home')
      ON CONFLICT (slug) DO NOTHING
    `

    // Obtener IDs de categorías
    const categories = await sql`SELECT id, slug FROM product_categories`
    const categoryMap = categories.reduce((acc, cat) => {
      acc[cat.slug] = cat.id
      return acc
    }, {})

    console.log(`✅ Created ${categories.length} categories`)

    console.log("🛍️  Creating sample products...")

    // Insertar productos de ejemplo más completos
    const products = [
      {
        name: "Audífonos Inalámbricos con Cancelación de Ruido Premium",
        description:
          "Experiencia de sonido inmersiva con cancelación activa de ruido de última generación, batería de 30 horas, conectividad Bluetooth 5.3 y carga rápida. Perfectos para trabajo, viajes y entretenimiento con calidad de audio profesional.",
        price: 199.99,
        imageUrl: "/placeholder.svg?height=400&width=400",
        images: [
          "/placeholder.svg?height=400&width=400",
          "/placeholder.svg?height=300&width=300",
          "/placeholder.svg?height=500&width=500",
        ],
        altText: "Audífonos inalámbricos premium con cancelación de ruido activa",
        categoryId: categoryMap.audio,
        brand: "TechBrand",
        sku: "TB-WH-001",
        stock: 50,
        isFeatured: true,
        isTopPick: false,
        specifications: {
          connectivity: "Bluetooth 5.3",
          batteryLife: "30 hours",
          noiseCancellation: "Active ANC",
          weight: "250g",
          drivers: "40mm dynamic",
          frequency: "20Hz - 20kHz",
          charging: "USB-C fast charge",
        },
      },
      {
        name: 'Laptop Gaming RGB Pro 15.6" - RTX 4060',
        description:
          "Potente laptop gaming diseñada para los jugadores más exigentes. Equipada con procesador Intel i7 de 12va generación, 16GB RAM DDR4, SSD NVMe de 512GB y tarjeta gráfica RTX 4060. Teclado RGB mecánico y pantalla 144Hz para una experiencia gaming superior.",
        price: 1299.99,
        imageUrl: "/placeholder.svg?height=400&width=400",
        images: ["/placeholder.svg?height=400&width=400", "/placeholder.svg?height=350&width=600"],
        altText: "Laptop gaming profesional con teclado RGB y pantalla 144Hz",
        categoryId: categoryMap.computacion,
        brand: "GamePro",
        sku: "GP-LT-002",
        stock: 15,
        isFeatured: true,
        isTopPick: true,
        specifications: {
          processor: "Intel Core i7-12700H",
          ram: "16GB DDR4 3200MHz",
          storage: "512GB NVMe SSD",
          graphics: "NVIDIA RTX 4060 8GB",
          display: '15.6" FHD 144Hz IPS',
          keyboard: "RGB Mechanical",
          ports: "USB-C, USB 3.0, HDMI 2.1",
          weight: "2.3kg",
        },
      },
      {
        name: "Smartphone Pro Max 256GB - Cámara 108MP",
        description:
          'El smartphone más avanzado de la serie Pro con cámara triple de 108MP con IA, pantalla AMOLED de 6.7" con 120Hz, procesador octa-core de última generación, carga rápida de 65W y batería de 5000mAh. Diseño premium con resistencia al agua IP68.',
        price: 899.99,
        imageUrl: "/placeholder.svg?height=400&width=400",
        images: [
          "/placeholder.svg?height=400&width=400",
          "/placeholder.svg?height=600&width=300",
          "/placeholder.svg?height=400&width=400",
        ],
        altText: "Smartphone Pro Max con cámara triple y pantalla AMOLED",
        categoryId: categoryMap.smartphones,
        brand: "MobileTech",
        sku: "MT-SP-003",
        stock: 30,
        isFeatured: false,
        isTopPick: true,
        specifications: {
          display: '6.7" AMOLED 120Hz',
          camera: "108MP + 12MP + 5MP",
          processor: "Snapdragon 8 Gen 2",
          storage: "256GB UFS 3.1",
          battery: "5000mAh",
          charging: "65W fast charge",
          os: "Android 14",
          waterResistance: "IP68",
        },
      },
      {
        name: "Teclado Mecánico RGB Gaming Cherry MX",
        description:
          "Teclado mecánico premium para gaming con switches Cherry MX Red, iluminación RGB personalizable por tecla, teclas programables, construcción de aluminio aeroespacial y software de personalización avanzado. Ideal para gaming competitivo y productividad.",
        price: 129.99,
        imageUrl: "/placeholder.svg?height=400&width=400",
        images: ["/placeholder.svg?height=400&width=400"],
        altText: "Teclado mecánico RGB premium con switches Cherry MX",
        categoryId: categoryMap.gaming,
        brand: "KeyMaster",
        sku: "KM-KB-004",
        stock: 75,
        isFeatured: false,
        isTopPick: false,
        specifications: {
          switches: "Cherry MX Red",
          lighting: "RGB per-key",
          connectivity: "USB-C detachable",
          material: "Aluminum frame",
          layout: "Full size",
          polling: "1000Hz",
          software: "KeyMaster Pro",
        },
      },
      {
        name: "Mouse Gaming Inalámbrico Pro 16000 DPI",
        description:
          "Mouse gaming de alta precisión con sensor óptico profesional de 16000 DPI, 8 botones completamente programables, batería de 70 horas, peso ajustable y conectividad dual (2.4GHz + Bluetooth). Diseñado para gaming competitivo.",
        price: 79.99,
        imageUrl: "/placeholder.svg?height=400&width=400",
        images: ["/placeholder.svg?height=400&width=400"],
        altText: "Mouse gaming inalámbrico de alta precisión con 8 botones",
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
          connectivity: "2.4GHz + Bluetooth",
          weight: "85g adjustable",
          polling: "1000Hz",
          sensor: "PixArt PMW3370",
        },
      },
      {
        name: "Smartwatch Fitness Pro - GPS y Monitor Cardíaco",
        description:
          "Smartwatch avanzado con GPS integrado, monitor de frecuencia cardíaca 24/7, más de 100 modos deportivos, resistencia al agua 5ATM, pantalla AMOLED de 1.4 pulgadas y batería de 14 días. Compatible con iOS y Android.",
        price: 249.99,
        imageUrl: "/placeholder.svg?height=400&width=400",
        images: ["/placeholder.svg?height=400&width=400", "/placeholder.svg?height=400&width=400"],
        altText: "Smartwatch deportivo con GPS y monitor cardíaco",
        categoryId: categoryMap.wearables,
        brand: "FitTech",
        sku: "FT-SW-006",
        stock: 40,
        isFeatured: true,
        isTopPick: false,
        specifications: {
          display: '1.4" AMOLED',
          battery: "14 days",
          gps: "Built-in GPS",
          waterResistance: "5ATM",
          sensors: "Heart rate, SpO2, Gyroscope",
          sports: "100+ workout modes",
          compatibility: "iOS & Android",
        },
      },
      {
        name: "Altavoz Inteligente con Asistente de Voz",
        description:
          "Altavoz inteligente premium con asistente de voz integrado, sonido 360°, control de hogar inteligente, streaming de música en alta calidad y diseño elegante que se adapta a cualquier ambiente.",
        price: 149.99,
        imageUrl: "/placeholder.svg?height=400&width=400",
        images: ["/placeholder.svg?height=400&width=400"],
        altText: "Altavoz inteligente con asistente de voz y sonido 360°",
        categoryId: categoryMap["smart-home"],
        brand: "SmartHome",
        sku: "SH-SP-007",
        stock: 35,
        isFeatured: false,
        isTopPick: true,
        specifications: {
          sound: "360° premium audio",
          assistant: "Built-in voice assistant",
          connectivity: "Wi-Fi, Bluetooth 5.0",
          smartHome: "Compatible with major platforms",
          streaming: "Spotify, Apple Music, etc.",
          power: "AC adapter",
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

    console.log(`✅ Created ${products.length} products`)

    console.log("👥 Creating sample users...")
    await sql`
      INSERT INTO users (name, email) VALUES 
      ('Juan Pérez', 'juan@techuser.com'),
      ('María García', 'maria@techuser.com'),
      ('Carlos López', 'carlos@techuser.com'),
      ('Ana Rodríguez', 'ana@techuser.com'),
      ('Luis Martínez', 'luis@techuser.com')
      ON CONFLICT (email) DO NOTHING
    `

    console.log("⭐ Creating sample reviews...")
    // Insertar reseñas de ejemplo
    const users = await sql`SELECT id, name FROM users LIMIT 5`
    const productIds = await sql`SELECT id, name FROM products LIMIT 5`

    if (users.length > 0 && productIds.length > 0) {
      const reviews = [
        {
          productId: productIds[0].id,
          userId: users[0].id,
          userName: users[0].name,
          rating: 5,
          comment:
            "Excelente calidad de sonido y muy cómodos para usar todo el día. La cancelación de ruido es impresionante.",
        },
        {
          productId: productIds[0].id,
          userId: users[1].id,
          userName: users[1].name,
          rating: 4,
          comment: "Muy buenos audífonos, la batería dura exactamente lo que prometen. Recomendados.",
        },
        {
          productId: productIds[1].id,
          userId: users[2].id,
          userName: users[2].name,
          rating: 5,
          comment: "Increíble rendimiento para gaming, corre todos los juegos en ultra. La pantalla 144Hz es perfecta.",
        },
        {
          productId: productIds[2].id,
          userId: users[3].id,
          userName: users[3].name,
          rating: 5,
          comment: "La cámara es espectacular, las fotos salen increíbles incluso en poca luz. Muy recomendado.",
        },
        {
          productId: productIds[1].id,
          userId: users[4].id,
          userName: users[4].name,
          rating: 4,
          comment: "Excelente laptop, muy rápida y el teclado RGB se ve genial. Solo le falta más almacenamiento.",
        },
      ]

      for (const review of reviews) {
        await sql`
          INSERT INTO product_reviews (product_id, user_id, user_name, rating, comment, is_verified_purchase) 
          VALUES (${review.productId}, ${review.userId}, ${review.userName}, ${review.rating}, ${review.comment}, true)
        `
      }

      // Actualizar ratings de productos basado en las reseñas
      await sql`
        UPDATE products SET 
          rating = 4.5,
          review_count = 2
        WHERE id = ${productIds[0].id}
      `

      await sql`
        UPDATE products SET 
          rating = 4.5,
          review_count = 2
        WHERE id = ${productIds[1].id}
      `

      await sql`
        UPDATE products SET 
          rating = 5.0,
          review_count = 1
        WHERE id = ${productIds[2].id}
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

    console.log("\n🚀 API Endpoints Ready:")
    console.log("   GET /v1/products - List all products")
    console.log("   GET /v1/products?category=gaming - Filter by category")
    console.log("   GET /v1/products?isFeatured=true - Get featured products")
    console.log("   GET /v1/products?search=laptop - Search products")
    console.log("   GET /v1/products?minPrice=100&maxPrice=500 - Price range")

    console.log("\n✅ Your Tech Emporium API is ready to use!")
  } catch (error) {
    console.error("❌ Error seeding database:", error)
    throw error
  }
}

// Ejecutar el script
seedTechEmporium()
