import { initializeDatabase, sql } from "../lib/db"

async function seedDatabase() {
  try {
    console.log("Initializing database...")
    await initializeDatabase()

    console.log("Seeding database with sample data...")

    // Insertar usuarios de ejemplo
    await sql`
      INSERT INTO users (name, email) VALUES 
      ('Juan Pérez', 'juan@example.com'),
      ('María García', 'maria@example.com'),
      ('Carlos López', 'carlos@example.com')
      ON CONFLICT (email) DO NOTHING
    `

    // Insertar productos de ejemplo
    await sql`
      INSERT INTO products (name, description, price, stock) VALUES 
      ('Laptop HP', 'Laptop HP Pavilion 15 pulgadas', 899.99, 10),
      ('Mouse Logitech', 'Mouse inalámbrico Logitech MX Master', 79.99, 25),
      ('Teclado Mecánico', 'Teclado mecánico RGB para gaming', 129.99, 15)
    `

    console.log("Database seeded successfully!")
  } catch (error) {
    console.error("Error seeding database:", error)
  }
}

seedDatabase()
