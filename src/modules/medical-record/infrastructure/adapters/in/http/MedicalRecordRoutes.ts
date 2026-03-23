import { Router } from 'express'
import { container } from 'tsyringe'
import { MedicalRecordController } from './MedicalRecordController'

export function createMedicalRecordRouter(): Router {
  const router = Router()
  const controller = container.resolve(MedicalRecordController)

  router.post('/', (req, res) => controller.create(req, res))

  return router
}
