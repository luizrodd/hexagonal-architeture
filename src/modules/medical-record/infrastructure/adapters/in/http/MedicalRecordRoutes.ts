import { Router } from 'express'
import { container } from 'tsyringe'
import { MedicalRecordController } from './MedicalRecordController'

const medicalRecordRouter = Router()
const controller = container.resolve(MedicalRecordController)

medicalRecordRouter.post('/', (req, res) => controller.create(req, res))

export { medicalRecordRouter }
