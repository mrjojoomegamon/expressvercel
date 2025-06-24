import { sql } from "../lib/db"

export interface User {
  id?: number
  name: string
  email: string
  created_at?: Date
  updated_at?: Date
}

export class UserModel {
  static async findAll(): Promise<User[]> {
    const result = await sql`SELECT * FROM users ORDER BY created_at DESC`
    return result as User[]
  }

  static async findById(id: number): Promise<User | null> {
    const result = await sql`SELECT * FROM users WHERE id = ${id}`
    return (result[0] as User) || null
  }

  static async findByEmail(email: string): Promise<User | null> {
    const result = await sql`SELECT * FROM users WHERE email = ${email}`
    return (result[0] as User) || null
  }

  static async create(userData: Omit<User, "id" | "created_at" | "updated_at">): Promise<User> {
    const result = await sql`
      INSERT INTO users (name, email)
      VALUES (${userData.name}, ${userData.email})
      RETURNING *
    `
    return result[0] as User
  }

  static async update(
    id: number,
    userData: Partial<Omit<User, "id" | "created_at" | "updated_at">>,
  ): Promise<User | null> {
    const result = await sql`
      UPDATE users 
      SET name = COALESCE(${userData.name}, name),
          email = COALESCE(${userData.email}, email),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `
    return (result[0] as User) || null
  }

  static async delete(id: number): Promise<boolean> {
    const result = await sql`DELETE FROM users WHERE id = ${id}`
    return result.count > 0
  }
}
