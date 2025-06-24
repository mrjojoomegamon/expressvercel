// middleware/errorHandler.js
// --------------------------------------------------
// Manejo centralizado de rutas no encontradas y errores
// --------------------------------------------------

/**
 * Middleware para rutas inexistentes (404)
 * @param {import('express').Request} _req
 * @param {import('express').Response} res
 */
export function notFound(_req, res) {
  res.status(404).json({
    success: false,
    message: "Route not found",
    timestamp: new Date().toISOString(),
  })
}

/**
 * Middleware para errores de aplicación (500)
 * @param {Error} err
 * @param {import('express').Request} _req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} _next
 */
export function errorHandler(err, _req, res, _next) {
  console.error("Unhandled error:", err)

  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
    timestamp: new Date().toISOString(),
  })
}
