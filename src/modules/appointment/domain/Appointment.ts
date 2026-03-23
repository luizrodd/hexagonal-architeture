import { AggregateRoot } from '@shared/domain/AggregateRoot'
import { UniqueEntityId } from '@shared/domain/UniqueEntityId'
import { Either, left, right } from '@shared/application/Either'
import { ValidationException } from '@modules/patient/domain/exceptions/DomainException'
import { AppointmentId } from './AppointmentId'
import { AppointmentStatus, AppointmentStatusType } from './AppointmentStatus'
import { TimeSlot } from './TimeSlot'
import {
  AppointmentScheduled,
  AppointmentConfirmed,
  AppointmentCancelled,
  AppointmentCompleted,
} from './events/AppointmentEvents'
import { InvalidStatusTransitionException } from './exceptions/AppointmentExceptions'

export class AppointmentCreationException extends ValidationException {
  constructor(message: string) { super(message) }
}

interface AppointmentProps {
  patientId: string
  doctorId: string
  timeSlot: TimeSlot
  status: AppointmentStatus
  reason: string           // motivo da consulta
  notes?: string           // notas da consulta (preenchidas pelo médico)
  cancelReason?: string
  createdAt: Date
  updatedAt: Date
}

/**
 * Aggregate Root: Appointment (Consulta Médica)
 *
 * O agregado mais complexo do sistema. Demonstra:
 * - Máquina de estados via AppointmentStatus (Value Object)
 * - Múltiplos Domain Events por ciclo de vida
 * - Regras de invariante no AR (ex: não pode alterar horário de consulta confirmada)
 * - Integração com Domain Service (AppointmentSchedulingService)
 *
 * === CICLO DE VIDA ===
 * SCHEDULED → CONFIRMED → COMPLETED
 *           ↘           ↘
 *            CANCELLED   NO_SHOW
 *
 * === NOTA SOBRE REFERÊNCIAS ===
 * O Appointment referencia patientId e doctorId como strings (não carrega
 * os agregados Patient e Doctor dentro dele). Isso é correto em DDD:
 * agregados se referenciam por ID, nunca por valor direto.
 * Isso evita carregamento em cascata e mantém fronteiras claras.
 */
export class Appointment extends AggregateRoot<AppointmentProps> {
  private constructor(props: AppointmentProps, id?: UniqueEntityId) {
    super(props, id)
  }

  // ── Getters ─────────────────────────────────────────────────────────────────

  get appointmentId(): AppointmentId {
    return new AppointmentId(this._id.toValue())
  }

  get patientId(): string { return this.props.patientId }
  get doctorId(): string { return this.props.doctorId }
  get timeSlot(): TimeSlot { return this.props.timeSlot }
  get status(): AppointmentStatus { return this.props.status }
  get reason(): string { return this.props.reason }
  get notes(): string | undefined { return this.props.notes }
  get cancelReason(): string | undefined { return this.props.cancelReason }
  get createdAt(): Date { return this.props.createdAt }
  get updatedAt(): Date { return this.props.updatedAt }

  // ── Factory: nova consulta ───────────────────────────────────────────────────

  /**
   * Agenda uma nova consulta.
   *
   * ATENÇÃO: Este método NÃO verifica disponibilidade do médico.
   * A verificação de disponibilidade é responsabilidade do
   * AppointmentSchedulingService (Domain Service) + Use Case.
   */
  static schedule(props: {
    patientId: string
    doctorId: string
    timeSlot: TimeSlot
    reason: string
  }): Either<AppointmentCreationException, Appointment> {
    if (!props.reason?.trim()) {
      return left(new AppointmentCreationException('O motivo da consulta é obrigatório.'))
    }

    const now = new Date()
    const appointment = new Appointment({
      patientId: props.patientId,
      doctorId: props.doctorId,
      timeSlot: props.timeSlot,
      status: AppointmentStatus.initial(),
      reason: props.reason.trim(),
      createdAt: now,
      updatedAt: now,
    })

    appointment.addDomainEvent(
      new AppointmentScheduled(
        appointment._id.toValue(),
        props.patientId,
        props.doctorId,
        { start: props.timeSlot.start, end: props.timeSlot.end },
      ),
    )

    return right(appointment)
  }

  static reconstitute(props: AppointmentProps, id: UniqueEntityId): Appointment {
    return new Appointment(props, id)
  }

  // ── Métodos de domínio (máquina de estados) ──────────────────────────────────

  /**
   * Confirma a consulta.
   * Transição: SCHEDULED → CONFIRMED
   */
  confirm(): Either<InvalidStatusTransitionException, void> {
    const newStatusOrError = this.props.status.transitionTo(AppointmentStatusType.CONFIRMED)
    if (newStatusOrError.isLeft()) return left(newStatusOrError.value)

    this.props.status = newStatusOrError.value
    this.props.updatedAt = new Date()

    this.addDomainEvent(
      new AppointmentConfirmed(
        this._id.toValue(),
        this.props.patientId,
        this.props.doctorId,
      ),
    )

    return right(undefined)
  }

  /**
   * Cancela a consulta.
   * Transição: SCHEDULED | CONFIRMED → CANCELLED
   */
  cancel(
    reason: string,
    cancelledBy: 'patient' | 'doctor' | 'system',
  ): Either<InvalidStatusTransitionException, void> {
    const newStatusOrError = this.props.status.transitionTo(AppointmentStatusType.CANCELLED)
    if (newStatusOrError.isLeft()) return left(newStatusOrError.value)

    this.props.status = newStatusOrError.value
    this.props.cancelReason = reason
    this.props.updatedAt = new Date()

    this.addDomainEvent(
      new AppointmentCancelled(this._id.toValue(), reason, cancelledBy),
    )

    return right(undefined)
  }

  /**
   * Marca a consulta como concluída.
   * Transição: CONFIRMED → COMPLETED
   */
  complete(notes?: string): Either<InvalidStatusTransitionException, void> {
    const newStatusOrError = this.props.status.transitionTo(AppointmentStatusType.COMPLETED)
    if (newStatusOrError.isLeft()) return left(newStatusOrError.value)

    this.props.status = newStatusOrError.value
    if (notes) this.props.notes = notes
    this.props.updatedAt = new Date()

    this.addDomainEvent(
      new AppointmentCompleted(
        this._id.toValue(),
        this.props.patientId,
        this.props.doctorId,
      ),
    )

    return right(undefined)
  }

  /**
   * Registra que o paciente não compareceu.
   * Transição: CONFIRMED → NO_SHOW
   */
  markNoShow(): Either<InvalidStatusTransitionException, void> {
    const newStatusOrError = this.props.status.transitionTo(AppointmentStatusType.NO_SHOW)
    if (newStatusOrError.isLeft()) return left(newStatusOrError.value)

    this.props.status = newStatusOrError.value
    this.props.updatedAt = new Date()

    return right(undefined)
  }
}
