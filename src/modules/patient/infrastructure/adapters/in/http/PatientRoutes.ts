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
const patientRouter = Router()

// Resolve o controller do container de DI
const controller = container.resolve(PatientController)

patientRouter.post('/', (req, res) => controller.register(req, res))
patientRouter.get('/', (req, res) => controller.listAll(req, res))
patientRouter.get('/:id', (req, res) => controller.getById(req, res))
patientRouter.put('/:id', (req, res) => controller.update(req, res))

export { patientRouter }
