import { Request, Response, NextFunction } from 'express'

/**
 * Middleware de log de requisições.
 * Registra método, URL, status e tempo de resposta.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now()

  res.on('finish', () => {
    const duration = Date.now() - start
    const log = `[HTTP] ${req.method} ${req.originalUrl} → ${res.statusCode} (${duration}ms)`
    console.log(log)
  })

  next()
}
