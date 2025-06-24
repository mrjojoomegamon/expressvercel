import express from "express"
import cors from "cors"
import { initializeDatabase, sql } from "../lib/db.js"
import { errorHandler, notFound } from "../middleware/errorHandler.js"
import productRoutes from "../routes/products.js"

const app = express()

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
)
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Inicializar base de datos solo en el primer request
let dbInitialized = false
app.use(async (req, res, next) => {
  if (!dbInitialized) {
    try {
      await initializeDatabase()
      dbInitialized = true
      console.log("Database initialized successfully")
    } catch (error) {
      console.error("Database initialization failed:", error)
    }
  }
  next()
})

// Ruta principal
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Tech Emporium API v1.0.0",
    version: "1.0.0",
    baseUrl: "https://v0-express-api-for-proyecto.vercel.app",
    endpoints: {
      products: "/v1/products",
      health: "/health",
    },
    timestamp: new Date().toISOString(),
  })
})

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
  })
})

// Rutas de la API v1
app.use("/v1/products", productRoutes)

// Endpoint para poblar la base de datos
app.post("/api/seed", async (req, res) => {
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
      {
        name: "Teclado Mecánico RGB Gaming",
        description: "Teclado mecánico premium con switches Cherry MX",
        price: 129.99,
        imageUrl: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400",
        images: ["https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400"],
        altText: "Teclado mecánico RGB",
        categoryId: categoryMap.gaming,
        brand: "KeyMaster",
        sku: "KM-KB-004",
        stock: 75,
        isFeatured: false,
        isTopPick: false,
        specifications: { switches: "Cherry MX Red", lighting: "RGB per-key" },
      },
      {
        name: "Mouse Gaming Pro 16000 DPI",
        description: "Mouse gaming de alta precisión con 8 botones programables",
        price: 79.99,
        imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400",
        images: ["https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400"],
        altText: "Mouse gaming de alta precisión",
        categoryId: categoryMap.gaming,
        brand: "GamePro",
        sku: "GP-MS-005",
        stock: 60,
        isFeatured: false,
        isTopPick: false,
        specifications: { dpi: "16000 DPI", buttons: "8 programmable" },
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
        categories: Number(stats[0][0].count),
        products: Number(stats[1][0].count),
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
})

// También agregar un endpoint GET para verificar datos
app.get("/api/seed", (req, res) => {
  res.json({
    success: true,
    message: "Use POST method to seed the database",
    instructions: "Send a POST request to this endpoint to populate the database with sample data",
    timestamp: new Date().toISOString(),
  })
})

// Middleware de manejo de errores
app.use(notFound)
app.use(errorHandler)

// Exportar para Vercel
export default app
