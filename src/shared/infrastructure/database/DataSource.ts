import { DataSource } from 'typeorm'
import { PatientOrmEntity } from '@modules/patient/infrastructure/adapters/out/persistence/entities/PatientOrmEntity'
import { MedicalHistoryOrmEntity } from '@modules/patient/infrastructure/adapters/out/persistence/entities/MedicalHistoryOrmEntity'
import { DoctorOrmEntity } from '@modules/doctor/infrastructure/adapters/out/persistence/entities/DoctorOrmEntity'
import { AppointmentOrmEntity } from '@modules/appointment/infrastructure/adapters/out/persistence/entities/AppointmentOrmEntity'
import { MedicalRecordOrmEntity } from '@modules/medical-record/infrastructure/adapters/out/persistence/entities/MedicalRecordOrmEntity'
import { PrescriptionOrmEntity } from '@modules/medical-record/infrastructure/adapters/out/persistence/entities/PrescriptionOrmEntity'

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER ?? 'clinic_user',
  password: process.env.DB_PASS ?? 'clinic_pass',
  database: process.env.DB_NAME ?? 'medical_clinic',
  synchronize: process.env.NODE_ENV !== 'production', // nunca em produção!
  logging: process.env.NODE_ENV === 'development',
  entities: [
    PatientOrmEntity,
    MedicalHistoryOrmEntity,
    DoctorOrmEntity,
    AppointmentOrmEntity,
    MedicalRecordOrmEntity,
    PrescriptionOrmEntity,
  ],
})
