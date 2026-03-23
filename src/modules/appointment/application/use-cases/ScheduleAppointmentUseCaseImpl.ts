import { injectable, inject } from 'tsyringe'
import { Either, left, right } from '@shared/application/Either'
import { DomainException } from '@modules/patient/domain/exceptions/DomainException'
import { PatientId } from '@modules/patient/domain/PatientId'
import { PatientRepository } from '@modules/patient/application/ports/out/PatientRepository'
import { PatientNotFoundException } from '@modules/patient/domain/exceptions/PatientNotFoundException'
import { DoctorId } from '@modules/doctor/domain/DoctorId'
import { DoctorRepository } from '@modules/doctor/application/ports/out/DoctorRepository'
import { DoctorNotFoundException } from '@modules/doctor/domain/exceptions/DoctorExceptions'
import { TimeSlot } from '@modules/appointment/domain/TimeSlot'
import { Appointment } from '@modules/appointment/domain/Appointment'
import { AppointmentSchedulingService } from '@modules/appointment/domain/services/AppointmentSchedulingService'
import { TimeSlotUnavailableException } from '@modules/appointment/domain/exceptions/AppointmentExceptions'
import { AppointmentRepository } from '../ports/out/AppointmentRepository'
import { ScheduleAppointmentDto } from '../dto/ScheduleAppointmentDto'
import { AppointmentResponseDto } from '../dto/AppointmentResponseDto'
import { AppointmentMapper } from '../../infrastructure/adapters/out/persistence/AppointmentMapper'

/**
 * Use Case: Agendar Consulta
 *
 * Este é o use case mais didático para orquestração:
 *
 * 1. Valida que paciente existe
 * 2. Valida que médico existe e está ativo
 * 3. Cria o TimeSlot (VO com validação)
 * 4. Carrega consultas existentes do médico no período
 * 5. Usa o Domain Service para verificar disponibilidade
 * 6. Cria o Aggregate Appointment
 * 7. Persiste
 * 8. Publica eventos
 *
 * Note como o use case ORQUESTRA os objetos de domínio,
 * mas não tem lógica de negócio própria.
 * A lógica está nos Value Objects, Aggregates e Domain Services.
 */
@injectable()
export class ScheduleAppointmentUseCaseImpl {
  private readonly schedulingService = new AppointmentSchedulingService()

  constructor(
    @inject('PatientRepository')
    private readonly patientRepository: PatientRepository,

    @inject('DoctorRepository')
    private readonly doctorRepository: DoctorRepository,

    @inject('AppointmentRepository')
    private readonly appointmentRepository: AppointmentRepository,
  ) {}

  async execute(dto: ScheduleAppointmentDto): Promise<Either<DomainException, AppointmentResponseDto>> {
    // ── Validar paciente ───────────────────────────────────────────────────
    const patientId = new PatientId(dto.patientId)
    const patient = await this.patientRepository.findById(patientId)
    if (!patient) return left(new PatientNotFoundException(dto.patientId))
    if (!patient.isActive) return left(new PatientNotFoundException('Paciente inativo'))

    // ── Validar médico ─────────────────────────────────────────────────────
    const doctorId = new DoctorId(dto.doctorId)
    const doctor = await this.doctorRepository.findById(doctorId)
    if (!doctor) return left(new DoctorNotFoundException(dto.doctorId))
    if (!doctor.isActive) return left(new DoctorNotFoundException('Médico inativo'))

    // ── Criar TimeSlot ─────────────────────────────────────────────────────
    const slotOrError = TimeSlot.create(
      new Date(dto.startTime),
      new Date(dto.endTime),
    )
    if (slotOrError.isLeft()) return left(slotOrError.value)
    const timeSlot = slotOrError.value

    // ── Verificar disponibilidade via Domain Service ───────────────────────
    // O use case carrega os dados, o Domain Service decide
    const existingAppointments = await this.appointmentRepository.findByDoctorAndPeriod(
      dto.doctorId,
      timeSlot.start,
      timeSlot.end,
    )

    const isAvailable = this.schedulingService.isSlotAvailable(
      doctorId,
      timeSlot,
      existingAppointments,
    )

    if (!isAvailable) {
      return left(new TimeSlotUnavailableException(dto.doctorId, timeSlot.start))
    }

    // ── Criar o Aggregate ─────────────────────────────────────────────────
    const appointmentOrError = Appointment.schedule({
      patientId: dto.patientId,
      doctorId: dto.doctorId,
      timeSlot,
      reason: dto.reason,
    })
    if (appointmentOrError.isLeft()) return left(appointmentOrError.value)
    const appointment = appointmentOrError.value

    // ── Persistir e publicar eventos ──────────────────────────────────────
    await this.appointmentRepository.save(appointment)
    appointment.clearEvents()

    return right(AppointmentMapper.toResponseDto(appointment))
  }
}
