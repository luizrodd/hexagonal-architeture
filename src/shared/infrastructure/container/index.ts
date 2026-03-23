import 'reflect-metadata'
import { container } from 'tsyringe'
import { DataSource } from 'typeorm'
import { AppDataSource } from '../database/DataSource'
import { registerPatientDependencies } from '@modules/patient/infrastructure/container/PatientContainer'
import { registerDoctorDependencies } from '@modules/doctor/infrastructure/container/DoctorContainer'
import { registerAppointmentDependencies } from '@modules/appointment/infrastructure/container/AppointmentContainer'
import { registerMedicalRecordDependencies } from '@modules/medical-record/infrastructure/container/MedicalRecordContainer'

/**
 * Container de DI Global
 *
 * Este é o ponto central de toda a fiação da aplicação.
 * Tudo que precisa ser injetado passa por aqui.
 *
 * === ORDEM DE REGISTRO ===
 * 1. Infraestrutura compartilhada (DataSource)
 * 2. Módulos (cada um registra seus próprios adapters + use cases)
 *
 * === SUBSTITUIÇÃO PARA TESTES ===
 * Em testes de integração ou unitários, você pode sobrescrever registros:
 * container.register('PatientRepository', { useClass: InMemoryPatientRepository })
 */
export function setupContainer(dataSource: DataSource = AppDataSource): void {
  // ── Infraestrutura compartilhada ──────────────────────────────────────────
  container.registerInstance<DataSource>('DataSource', dataSource)

  // ── Módulos ───────────────────────────────────────────────────────────────
  registerPatientDependencies()
  registerDoctorDependencies()
  registerAppointmentDependencies()
  registerMedicalRecordDependencies()
}

export { container }
