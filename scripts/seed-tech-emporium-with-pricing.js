import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL)

async function seedTechEmporiumWithPricing() {
  try {
    console.log("🚀 Starting Tech Emporium seeding with pricing system...")

    // Verificar conexión
    const connectionTest = await sql`SELECT NOW() as current_time`
    console.log("⏰ Database time:", connectionTest[0].current_time)

    console.log("🌱 Seeding database with sample data...")

    // 1. Insertar categorías
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

    // 2. Insertar productos con sistema de precios
    console.log("🛍️ Creating sample products with pricing...")

    const products = [
      {
        name: "Audífonos Inalámbricos con Cancelación de Ruido Premium",
        description:
          "Experiencia de sonido inmersiva con cancelación activa de ruido de última generación, batería de 30 horas, conectividad Bluetooth 5.3 y carga rápida.",
        regularPrice: 249.99,
        salePrice: 199.99,
        isOnSale: true,
        mercadoLibreUrl:
          "https://www.mercadolibre.com.co/audifonos-inalambricos-premium-cancelacion-ruido/p/MCO123456789",
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
        images: [
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
          "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300&h=300&fit=crop",
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
          "Potente laptop gaming diseñada para los jugadores más exigentes. Equipada con procesador Intel i7 de 12va generación, 16GB RAM DDR4, SSD NVMe de 512GB y tarjeta gráfica RTX 4060.",
        regularPrice: 1599.99,
        salePrice: 1299.99,
        isOnSale: true,
        mercadoLibreUrl: "https://www.mercadolibre.com.co/laptop-gaming-rtx-4060-intel-i7/p/MCO987654321",
        imageUrl: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&h=400&fit=crop",
        images: [
          "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&h=400&fit=crop",
          "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=350&fit=crop",
        ],
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
          'El smartphone más avanzado de la serie Pro con cámara triple de 108MP con IA, pantalla AMOLED de 6.7" con 120Hz, procesador octa-core de última generación.',
        regularPrice: 899.99,
        salePrice: null,
        isOnSale: false,
        mercadoLibreUrl: "https://www.mercadolibre.com.co/smartphone-pro-max-256gb-camara-108mp/p/MCO456789123",
        imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",
        images: [
          "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",
          "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&h=600&fit=crop",
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
          "Teclado mecánico premium para gaming con switches Cherry MX Red, iluminación RGB personalizable por tecla, teclas programables y construcción de aluminio aeroespacial.",
        regularPrice: 159.99,
        salePrice: 129.99,
        isOnSale: true,
        mercadoLibreUrl: "https://www.mercadolibre.com.co/teclado-mecanico-rgb-cherry-mx-gaming/p/MCO789123456",
        imageUrl: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&h=400&fit=crop",
        images: ["https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&h=400&fit=crop"],
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
          "Mouse gaming de alta precisión con sensor óptico profesional de 16000 DPI, 8 botones completamente programables, batería de 70 horas y peso ajustable.",
        regularPrice: 89.99,
        salePrice: 79.99,
        isOnSale: true,
        mercadoLibreUrl: "https://www.mercadolibre.com.co/mouse-gaming-inalambrico-16000-dpi/p/MCO321654987",
        imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop",
        images: ["https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop"],
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
          "Smartwatch avanzado con GPS integrado, monitor de frecuencia cardíaca 24/7, más de 100 modos deportivos, resistencia al agua 5ATM y pantalla AMOLED de 1.4 pulgadas.",
        regularPrice: 249.99,
        salePrice: null,
        isOnSale: false,
        mercadoLibreUrl: "https://www.mercadolibre.com.co/smartwatch-fitness-pro-gps-monitor-cardiaco/p/MCO654321789",
        imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
        images: [
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
          "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400&h=400&fit=crop",
        ],
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
          "Altavoz inteligente premium con asistente de voz integrado, sonido 360°, control de hogar inteligente y streaming de música en alta calidad.",
        regularPrice: 149.99,
        salePrice: null,
        isOnSale: false,
        mercadoLibreUrl: "https://www.mercadolibre.com.co/altavoz-inteligente-asistente-voz-360/p/MCO147258369",
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
        images: ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop"],
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

    // Insertar productos
    for (const product of products) {
      await sql`
        INSERT INTO products (
          name, description, regular_price, sale_price, is_on_sale, mercado_libre_url,
          image_url, images, alt_text, category_id, brand, sku, stock,
          is_featured, is_top_pick, specifications
        ) VALUES (
          ${product.name},
          ${product.description},
          ${product.regularPrice},
          ${product.salePrice},
          ${product.isOnSale},
          ${product.mercadoLibreUrl},
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

    // 3. Insertar usuarios
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

    // 4. Insertar reseñas
    console.log("⭐ Creating sample reviews...")
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
      ]

      for (const review of reviews) {
        await sql`
          INSERT INTO product_reviews (product_id, user_id, user_name, rating, comment, is_verified_purchase) 
          VALUES (${review.productId}, ${review.userId}, ${review.userName}, ${review.rating}, ${review.comment}, true)
        `
      }

      // Actualizar ratings de productos
      await sql`
        UPDATE products SET 
          rating = 4.5,
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

    // 5. Mostrar estadísticas finales
    const stats = await Promise.all([
      sql`SELECT COUNT(*) as count FROM product_categories`,
      sql`SELECT COUNT(*) as count FROM products`,
      sql`SELECT COUNT(*) as count FROM users`,
      sql`SELECT COUNT(*) as count FROM product_reviews`,
      sql`SELECT COUNT(*) as count FROM products WHERE is_on_sale = true`,
    ])

    console.log("\n🎉 Tech Emporium database seeded successfully!")
    console.log("📊 Database Statistics:")
    console.log(`   📂 Categories: ${stats[0][0].count}`)
    console.log(`   🛍️ Products: ${stats[1][0].count}`)
    console.log(`   👥 Users: ${stats[2][0].count}`)
    console.log(`   ⭐ Reviews: ${stats[3][0].count}`)
    console.log(`   🏷️ Products on sale: ${stats[4][0].count}`)

    // Mostrar productos en oferta
    const onSaleProducts = await sql`
      SELECT 
        name,
        regular_price,
        sale_price,
        ROUND(((regular_price - sale_price) / regular_price * 100)::numeric, 0) as discount_percentage
      FROM products 
      WHERE is_on_sale = true
    `

    console.log("\n🔥 Products on sale:")
    onSaleProducts.forEach((product) => {
      console.log(`   ${product.name}`)
      console.log(`   $${product.regular_price} → $${product.sale_price} (${product.discount_percentage}% OFF)`)
    })

    console.log("\n🚀 API Endpoints Ready:")
    console.log("   GET /v1/products - List all products")
    console.log("   GET /v1/products?isOnSale=true - Products on sale")
    console.log("   GET /v1/products?category=gaming - Filter by category")
    console.log("   GET /v1/products?minPrice=100&maxPrice=500 - Price range")
    console.log("   GET /v1/products/on-sale - Dedicated sale endpoint")

    console.log("\n✅ Your Tech Emporium API with pricing system is ready!")
  } catch (error) {
    console.error("❌ Error seeding database:", error)
    throw error
  }
}

// Ejecutar el script
seedTechEmporiumWithPricing()
