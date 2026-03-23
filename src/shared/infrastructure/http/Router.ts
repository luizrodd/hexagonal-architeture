import { Router } from 'express'
import { createPatientRouter } from '@modules/patient/infrastructure/adapters/in/http/PatientRoutes'
import { createDoctorRouter } from '@modules/doctor/infrastructure/adapters/in/http/DoctorRoutes'
import { createAppointmentRouter } from '@modules/appointment/infrastructure/adapters/in/http/AppointmentRoutes'
import { createMedicalRecordRouter } from '@modules/medical-record/infrastructure/adapters/in/http/MedicalRecordRoutes'

/**
 * Router principal da aplicação.
 * Agrega as rotas de todos os módulos sob o prefixo /api.
 */
export function createApiRouter(): Router {
  const apiRouter = Router()

  apiRouter.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  apiRouter.use('/patients', createPatientRouter())
  apiRouter.use('/doctors', createDoctorRouter())
  apiRouter.use('/appointments', createAppointmentRouter())
  apiRouter.use('/medical-records', createMedicalRecordRouter())

  return apiRouter
}
