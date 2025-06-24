import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required")
}

export const sql = neon(process.env.DATABASE_URL)

export async function initializeDatabase() {
  try {
    // Verificar conexión
    await sql`SELECT 1`
    console.log("Database connection verified")
  } catch (error) {
    console.error("Database connection failed:", error)
    throw error
  }
}
