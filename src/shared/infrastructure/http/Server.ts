import 'reflect-metadata'
import 'express-async-errors'
import express, { Express } from 'express'
import { apiRouter } from './Router'
import { errorHandler } from './middlewares/errorHandler'
import { requestLogger } from './middlewares/requestLogger'

/**
 * Cria e configura a aplicação Express.
 *
 * Separar a criação do app do seu início (listen) é importante:
 * - Os testes de integração podem criar o app sem precisar de uma porta TCP
 * - O main.ts inicia o servidor com app.listen()
 */
export function createApp(): Express {
  const app = express()

  // ── Middlewares globais ───────────────────────────────────────────────────
  app.use(express.json())
  app.use(requestLogger)

  // ── Rotas ─────────────────────────────────────────────────────────────────
  app.use('/api', apiRouter)

  // ── Tratamento de erros (deve ser o ÚLTIMO middleware) ───────────────────
  app.use(errorHandler)

  return app
}
