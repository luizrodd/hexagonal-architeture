import { Router } from 'express'
import { container } from 'tsyringe'
import { PatientController } from './PatientController'

/**
 * Rotas HTTP para o módulo Patient.
 *
 * Note que o controller é resolvido pelo container DI (tsyringe).
 * Isso significa que todas as dependências do controller
 * (use cases, repositórios) são injetadas automaticamente.
 */
export function createPatientRouter(): Router {
  const router = Router()

  // Resolve o controller do container de DI (lazy — após setupContainer)
  const controller = container.resolve(PatientController)

  router.post('/', (req, res) => controller.register(req, res))
  router.get('/', (req, res) => controller.listAll(req, res))
  router.get('/:id', (req, res) => controller.getById(req, res))
  router.put('/:id', (req, res) => controller.update(req, res))

  return router
}
