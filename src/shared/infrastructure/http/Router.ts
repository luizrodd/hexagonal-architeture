import { Router } from 'express'
import { patientRouter } from '@modules/patient/infrastructure/adapters/in/http/PatientRoutes'
import { doctorRouter } from '@modules/doctor/infrastructure/adapters/in/http/DoctorRoutes'
import { appointmentRouter } from '@modules/appointment/infrastructure/adapters/in/http/AppointmentRoutes'
import { medicalRecordRouter } from '@modules/medical-record/infrastructure/adapters/in/http/MedicalRecordRoutes'

/**
 * Router principal da aplicação.
 * Agrega as rotas de todos os módulos sob o prefixo /api.
 */
const apiRouter = Router()

apiRouter.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

apiRouter.use('/patients', patientRouter)
apiRouter.use('/doctors', doctorRouter)
apiRouter.use('/appointments', appointmentRouter)
apiRouter.use('/medical-records', medicalRecordRouter)

export { apiRouter }
