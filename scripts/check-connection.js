// Verificar si tenemos la variable de entorno
console.log("🔍 Checking environment variables...")
console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL)

if (process.env.DATABASE_URL) {
  console.log("✅ DATABASE_URL is configured")
  console.log("🔗 Connection string preview:", process.env.DATABASE_URL.substring(0, 20) + "...")

  // Intentar importar Neon
  try {
    const { neon } = await import("@neondatabase/serverless")
    const sql = neon(process.env.DATABASE_URL)

    console.log("🚀 Testing database connection...")
    const result = await sql`SELECT NOW() as current_time, version() as db_version`
    console.log("✅ Database connection successful!")
    console.log("⏰ Current time:", result[0].current_time)
    console.log("🗄️  Database version:", result[0].db_version.split(" ")[0])
  } catch (error) {
    console.error("❌ Database connection failed:", error.message)
  }
} else {
  console.log("❌ DATABASE_URL not found")
  console.log("📝 Available environment variables:")
  Object.keys(process.env)
    .filter((key) => key.includes("DATABASE") || key.includes("POSTGRES") || key.includes("NEON"))
    .forEach((key) => {
      console.log(`   ${key}: ${process.env[key] ? "✅ Set" : "❌ Not set"}`)
    })
}
