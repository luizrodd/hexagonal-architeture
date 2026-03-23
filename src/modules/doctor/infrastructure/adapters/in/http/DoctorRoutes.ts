import { Router } from 'express'
import { container } from 'tsyringe'
import { DoctorController } from './DoctorController'

const doctorRouter = Router()
const controller = container.resolve(DoctorController)

doctorRouter.post('/', (req, res) => controller.register(req, res))

export { doctorRouter }
