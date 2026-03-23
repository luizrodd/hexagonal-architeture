import { injectable, inject } from 'tsyringe'
import { Either, left, right } from '@shared/application/Either'
import { DomainException } from '@modules/patient/domain/exceptions/DomainException'
import { AppointmentId } from '@modules/appointment/domain/AppointmentId'
import { AppointmentNotFoundException } from '@modules/appointment/domain/exceptions/AppointmentExceptions'
import { AppointmentRepository } from '../ports/out/AppointmentRepository'
import { AppointmentResponseDto } from '../dto/AppointmentResponseDto'
import { AppointmentMapper } from '../../infrastructure/adapters/out/persistence/AppointmentMapper'

@injectable()
export class CancelAppointmentUseCaseImpl {
  constructor(
    @inject('AppointmentRepository')
    private readonly appointmentRepository: AppointmentRepository,
  ) {}

  async execute(
    appointmentId: string,
    reason: string,
    cancelledBy: 'patient' | 'doctor' | 'system',
  ): Promise<Either<DomainException, AppointmentResponseDto>> {
    const id = new AppointmentId(appointmentId)
    const appointment = await this.appointmentRepository.findById(id)

    if (!appointment) {
      return left(new AppointmentNotFoundException(appointmentId))
    }

    // Delega a transição de estado ao Aggregate Root
    const cancelOrError = appointment.cancel(reason, cancelledBy)
    if (cancelOrError.isLeft()) return left(cancelOrError.value)

    await this.appointmentRepository.update(appointment)
    appointment.clearEvents()

    return right(AppointmentMapper.toResponseDto(appointment))
  }
}
