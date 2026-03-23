import { Router } from 'express'
import { container } from 'tsyringe'
import { AppointmentController } from './AppointmentController'

export function createAppointmentRouter(): Router {
  const router = Router()
  const controller = container.resolve(AppointmentController)

  router.post('/', (req, res) => controller.schedule(req, res))
  router.patch('/:id/cancel', (req, res) => controller.cancel(req, res))

  return router
}
