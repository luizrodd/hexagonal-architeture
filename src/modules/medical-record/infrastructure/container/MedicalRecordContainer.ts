import { container } from 'tsyringe'
import { TypeOrmMedicalRecordRepository } from '../adapters/out/persistence/TypeOrmMedicalRecordRepository'
import { CreateMedicalRecordUseCaseImpl } from '../../application/use-cases/CreateMedicalRecordUseCaseImpl'

export function registerMedicalRecordDependencies(): void {
  container.registerSingleton('MedicalRecordRepository', TypeOrmMedicalRecordRepository)
  container.registerSingleton('CreateMedicalRecordUseCase', CreateMedicalRecordUseCaseImpl)
}
