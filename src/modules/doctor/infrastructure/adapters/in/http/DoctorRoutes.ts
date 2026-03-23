import { Router } from 'express'
import { container } from 'tsyringe'
import { DoctorController } from './DoctorController'

export function createDoctorRouter(): Router {
  const router = Router()
  const controller = container.resolve(DoctorController)

  router.post('/', (req, res) => controller.register(req, res))

  return router
}
