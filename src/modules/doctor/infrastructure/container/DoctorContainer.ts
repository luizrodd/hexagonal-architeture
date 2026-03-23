import { container } from 'tsyringe'
import { TypeOrmDoctorRepository } from '../adapters/out/persistence/TypeOrmDoctorRepository'
import { RegisterDoctorUseCaseImpl } from '../../application/use-cases/RegisterDoctorUseCaseImpl'

export function registerDoctorDependencies(): void {
  container.registerSingleton('DoctorRepository', TypeOrmDoctorRepository)
  container.registerSingleton('RegisterDoctorUseCase', RegisterDoctorUseCaseImpl)
}
