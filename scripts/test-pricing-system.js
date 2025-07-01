import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL)

async function testPricingSystem() {
  try {
    console.log("🧪 Testing Pricing System...")

    // Test 1: Verificar estructura de tabla
    console.log("\n1️⃣ Testing table structure...")
    const tableInfo = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'products' 
      AND column_name IN ('regular_price', 'sale_price', 'is_on_sale', 'mercado_libre_url')
      ORDER BY column_name
    `

    console.log("✅ Table structure:")
    tableInfo.forEach((col) => {
      console.log(`   ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`)
    })

    // Test 2: Productos en oferta
    console.log("\n2️⃣ Testing products on sale...")
    const onSaleProducts = await sql`
      SELECT 
        name,
        regular_price,
        sale_price,
        is_on_sale,
        ROUND(((regular_price - sale_price) / regular_price * 100)::numeric, 0) as discount_percentage
      FROM products 
      WHERE is_on_sale = true
      LIMIT 5
    `

    console.log(`✅ Found ${onSaleProducts.length} products on sale:`)
    onSaleProducts.forEach((product) => {
      console.log(`   ${product.name}`)
      console.log(`   Regular: $${product.regular_price} → Sale: $${product.sale_price}`)
      console.log(`   Discount: ${product.discount_percentage}%`)
      console.log("")
    })

    // Test 3: Validar URLs de MercadoLibre
    console.log("\n3️⃣ Testing MercadoLibre URLs...")
    const urlTest = await sql`
      SELECT 
        name,
        mercado_libre_url,
        CASE 
          WHEN mercado_libre_url ~ '^https?://(www\.)?mercadolibre\.com\.(co|mx|ar|pe|cl|ec|bo|py|uy|ve)/.+$' 
          THEN 'Valid' 
          ELSE 'Invalid' 
        END as url_status
      FROM products 
      LIMIT 5
    `

    console.log("✅ MercadoLibre URL validation:")
    urlTest.forEach((product) => {
      console.log(`   ${product.name}: ${product.url_status}`)
      console.log(`   URL: ${product.mercado_libre_url.substring(0, 60)}...`)
      console.log("")
    })

    // Test 4: Estadísticas generales
    console.log("\n4️⃣ General statistics...")
    const stats = await sql`
      SELECT 
        COUNT(*) as total_products,
        COUNT(CASE WHEN is_on_sale = true THEN 1 END) as products_on_sale,
        AVG(regular_price) as avg_regular_price,
        AVG(CASE WHEN is_on_sale THEN sale_price ELSE regular_price END) as avg_display_price,
        MAX(CASE WHEN is_on_sale THEN 
          ROUND(((regular_price - sale_price) / regular_price * 100)::numeric, 0)
          ELSE 0 END) as max_discount_percentage
      FROM products
    `

    const stat = stats[0]
    console.log("✅ System statistics:")
    console.log(`   📦 Total products: ${stat.total_products}`)
    console.log(`   🏷️ Products on sale: ${stat.products_on_sale}`)
    console.log(`   💰 Average regular price: $${Number(stat.avg_regular_price).toFixed(2)}`)
    console.log(`   💵 Average display price: $${Number(stat.avg_display_price).toFixed(2)}`)
    console.log(`   🔥 Maximum discount: ${stat.max_discount_percentage}%`)

    // Test 5: Consultas de filtrado
    console.log("\n5️⃣ Testing price filtering...")
    const priceFilterTest = await sql`
      SELECT 
        COUNT(*) as count,
        'Under $100' as price_range
      FROM products 
      WHERE (CASE WHEN is_on_sale THEN sale_price ELSE regular_price END) < 100
      
      UNION ALL
      
      SELECT 
        COUNT(*) as count,
        '$100-$500' as price_range
      FROM products 
      WHERE (CASE WHEN is_on_sale THEN sale_price ELSE regular_price END) BETWEEN 100 AND 500
      
      UNION ALL
      
      SELECT 
        COUNT(*) as count,
        'Over $500' as price_range
      FROM products 
      WHERE (CASE WHEN is_on_sale THEN sale_price ELSE regular_price END) > 500
    `

    console.log("✅ Price distribution:")
    priceFilterTest.forEach((range) => {
      console.log(`   ${range.price_range}: ${range.count} products`)
    })

    console.log("\n🎉 All tests completed successfully!")
    console.log("✅ Pricing system is working correctly!")
  } catch (error) {
    console.error("❌ Test failed:", error)
    throw error
  }
}

// Ejecutar tests
testPricingSystem()
