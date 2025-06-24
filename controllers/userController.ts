import type { Request, Response } from "express"
import { UserModel } from "../models/User"

export const userController = {
  // Obtener todos los usuarios
  async getAll(req: Request, res: Response) {
    try {
      const users = await UserModel.findAll()
      res.json({
        success: true,
        data: users,
        message: "Users retrieved successfully",
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error retrieving users",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }
  },

  // Obtener usuario por ID
  async getById(req: Request, res: Response) {
    try {
      const id = Number.parseInt(req.params.id)
      const user = await UserModel.findById(id)

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        })
      }

      res.json({
        success: true,
        data: user,
        message: "User retrieved successfully",
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error retrieving user",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }
  },

  // Crear nuevo usuario
  async create(req: Request, res: Response) {
    try {
      const { name, email } = req.body

      if (!name || !email) {
        return res.status(400).json({
          success: false,
          message: "Name and email are required",
        })
      }

      // Verificar si el email ya existe
      const existingUser = await UserModel.findByEmail(email)
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Email already exists",
        })
      }

      const user = await UserModel.create({ name, email })
      res.status(201).json({
        success: true,
        data: user,
        message: "User created successfully",
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error creating user",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }
  },

  // Actualizar usuario
  async update(req: Request, res: Response) {
    try {
      const id = Number.parseInt(req.params.id)
      const { name, email } = req.body

      const user = await UserModel.update(id, { name, email })

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        })
      }

      res.json({
        success: true,
        data: user,
        message: "User updated successfully",
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error updating user",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }
  },

  // Eliminar usuario
  async delete(req: Request, res: Response) {
    try {
      const id = Number.parseInt(req.params.id)
      const deleted = await UserModel.delete(id)

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        })
      }

      res.json({
        success: true,
        message: "User deleted successfully",
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error deleting user",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }
  },
}
