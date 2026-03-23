import { Router } from 'express'
import { container } from 'tsyringe'
import { AppointmentController } from './AppointmentController'

const appointmentRouter = Router()
const controller = container.resolve(AppointmentController)

appointmentRouter.post('/', (req, res) => controller.schedule(req, res))
appointmentRouter.patch('/:id/cancel', (req, res) => controller.cancel(req, res))

export { appointmentRouter }
