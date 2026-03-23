import { container } from 'tsyringe'
import { TypeOrmAppointmentRepository } from '../adapters/out/persistence/TypeOrmAppointmentRepository'
import { ScheduleAppointmentUseCaseImpl } from '../../application/use-cases/ScheduleAppointmentUseCaseImpl'
import { CancelAppointmentUseCaseImpl } from '../../application/use-cases/CancelAppointmentUseCaseImpl'

export function registerAppointmentDependencies(): void {
  container.registerSingleton('AppointmentRepository', TypeOrmAppointmentRepository)
  container.registerSingleton('ScheduleAppointmentUseCase', ScheduleAppointmentUseCaseImpl)
  container.registerSingleton('CancelAppointmentUseCase', CancelAppointmentUseCaseImpl)
}
