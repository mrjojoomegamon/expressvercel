import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL)

async function migratePricingSystem() {
  try {
    console.log("🚀 Starting pricing system migration...")

    // 1. Agregar nuevos campos a la tabla products
    console.log("📝 Adding new pricing columns...")

    await sql`
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS regular_price DECIMAL(10,2),
      ADD COLUMN IF NOT EXISTS sale_price DECIMAL(10,2),
      ADD COLUMN IF NOT EXISTS is_on_sale BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS mercado_libre_url VARCHAR(500)
    `

    // 2. Migrar datos existentes del campo price a regular_price
    console.log("🔄 Migrating existing price data...")

    await sql`
      UPDATE products 
      SET regular_price = price 
      WHERE regular_price IS NULL AND price IS NOT NULL
    `

    // 3. Establecer valores por defecto para campos requeridos
    console.log("⚙️ Setting default values...")

    await sql`
      UPDATE products 
      SET 
        regular_price = COALESCE(regular_price, 0.00),
        is_on_sale = COALESCE(is_on_sale, FALSE),
        mercado_libre_url = COALESCE(mercado_libre_url, 'https://www.mercadolibre.com.co/producto-pendiente')
      WHERE regular_price IS NULL OR mercado_libre_url IS NULL
    `

    // 4. Hacer campos NOT NULL después de establecer valores
    console.log("🔒 Setting NOT NULL constraints...")

    await sql`
      ALTER TABLE products 
      ALTER COLUMN regular_price SET NOT NULL,
      ALTER COLUMN is_on_sale SET NOT NULL,
      ALTER COLUMN mercado_libre_url SET NOT NULL
    `

    // 5. Crear índices para optimización
    console.log("📊 Creating performance indexes...")

    await sql`
      CREATE INDEX IF NOT EXISTS idx_products_on_sale ON products(is_on_sale)
    `

    await sql`
      CREATE INDEX IF NOT EXISTS idx_products_price_range ON products(regular_price, sale_price)
    `

    // 6. Actualizar algunos productos con ofertas de ejemplo
    console.log("🏷️ Adding sample sale prices...")

    const productsToUpdate = await sql`
      SELECT id, regular_price FROM products 
      WHERE is_featured = true OR is_top_pick = true
      LIMIT 3
    `

    for (const product of productsToUpdate) {
      const salePrice = (product.regular_price * 0.8).toFixed(2) // 20% descuento
      const mlUrl = `https://www.mercadolibre.com.co/producto-${product.id.slice(0, 8)}/p/MCO${Math.floor(Math.random() * 1000000000)}`

      await sql`
        UPDATE products 
        SET 
          sale_price = ${salePrice},
          is_on_sale = true,
          mercado_libre_url = ${mlUrl}
        WHERE id = ${product.id}
      `
    }

    // 7. Actualizar URLs de MercadoLibre para productos restantes
    console.log("🔗 Updating MercadoLibre URLs...")

    const remainingProducts = await sql`
      SELECT id FROM products 
      WHERE mercado_libre_url = 'https://www.mercadolibre.com.co/producto-pendiente'
    `

    for (const product of remainingProducts) {
      const mlUrl = `https://www.mercadolibre.com.co/producto-${product.id.slice(0, 8)}/p/MCO${Math.floor(Math.random() * 1000000000)}`

      await sql`
        UPDATE products 
        SET mercado_libre_url = ${mlUrl}
        WHERE id = ${product.id}
      `
    }

    // 8. Verificar migración
    console.log("✅ Verifying migration...")

    const stats = await sql`
      SELECT 
        COUNT(*) as total_products,
        COUNT(CASE WHEN is_on_sale = true THEN 1 END) as products_on_sale,
        COUNT(CASE WHEN sale_price IS NOT NULL THEN 1 END) as products_with_sale_price,
        AVG(regular_price) as avg_regular_price,
        AVG(sale_price) as avg_sale_price
      FROM products
    `

    const sampleProducts = await sql`
      SELECT 
        name,
        regular_price,
        sale_price,
        is_on_sale,
        mercado_libre_url
      FROM products 
      LIMIT 3
    `

    console.log("\n🎉 Migration completed successfully!")
    console.log("📊 Migration Statistics:")
    console.log(`   📦 Total products: ${stats[0].total_products}`)
    console.log(`   🏷️ Products on sale: ${stats[0].products_on_sale}`)
    console.log(`   💰 Products with sale price: ${stats[0].products_with_sale_price}`)
    console.log(`   💵 Average regular price: $${Number(stats[0].avg_regular_price || 0).toFixed(2)}`)
    console.log(`   🔥 Average sale price: $${Number(stats[0].avg_sale_price || 0).toFixed(2)}`)

    console.log("\n📋 Sample migrated products:")
    sampleProducts.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name}`)
      console.log(`      Regular: $${product.regular_price}`)
      console.log(`      Sale: ${product.sale_price ? `$${product.sale_price}` : "N/A"}`)
      console.log(`      On Sale: ${product.is_on_sale ? "✅" : "❌"}`)
      console.log(`      ML URL: ${product.mercado_libre_url.substring(0, 50)}...`)
      console.log("")
    })

    console.log("✅ Pricing system migration completed!")
  } catch (error) {
    console.error("❌ Migration failed:", error)
    throw error
  }
}

// Ejecutar migración
migratePricingSystem()
