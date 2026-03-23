import { AggregateRoot } from '@shared/domain/AggregateRoot'
import { UniqueEntityId } from '@shared/domain/UniqueEntityId'
import { Either, left, right } from '@shared/application/Either'
import { ValidationException } from '@modules/patient/domain/exceptions/DomainException'
import { DoctorId } from './DoctorId'
import { CRM } from './CRM'
import { Specialty } from './Specialty'
import { WorkSchedule } from './WorkSchedule'
import { Email } from '@modules/patient/domain/Email'
import { Phone } from '@modules/patient/domain/Phone'
import { DoctorRegistered } from './events/DoctorRegistered'

export class DoctorCreationException extends ValidationException {
  constructor(message: string) { super(message) }
}

export enum DoctorStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

interface DoctorProps {
  name: string
  crm: CRM
  specialty: Specialty
  email: Email
  phone: Phone
  workSchedule: WorkSchedule
  status: DoctorStatus
  createdAt: Date
  updatedAt: Date
}

/**
 * Aggregate Root: Doctor
 *
 * Mais simples que Patient (sem entidades filhas),
 * mas demonstra o mesmo padrão de factory + eventos.
 *
 * Note o reuso dos VOs Email e Phone do módulo patient.
 * Em projetos maiores, estes VOs ficariam em @shared/domain.
 */
export class Doctor extends AggregateRoot<DoctorProps> {
  private constructor(props: DoctorProps, id?: UniqueEntityId) {
    super(props, id)
  }

  get doctorId(): DoctorId {
    return new DoctorId(this._id.toValue())
  }

  get name(): string { return this.props.name }
  get crm(): CRM { return this.props.crm }
  get specialty(): Specialty { return this.props.specialty }
  get email(): Email { return this.props.email }
  get phone(): Phone { return this.props.phone }
  get workSchedule(): WorkSchedule { return this.props.workSchedule }
  get status(): DoctorStatus { return this.props.status }
  get createdAt(): Date { return this.props.createdAt }
  get updatedAt(): Date { return this.props.updatedAt }

  get isActive(): boolean {
    return this.props.status === DoctorStatus.ACTIVE
  }

  static create(props: {
    name: string
    crm: CRM
    specialty: Specialty
    email: Email
    phone: Phone
    workSchedule: WorkSchedule
  }): Either<DoctorCreationException, Doctor> {
    if (!props.name?.trim()) {
      return left(new DoctorCreationException('Nome do médico é obrigatório.'))
    }

    const now = new Date()
    const doctor = new Doctor({
      name: props.name.trim(),
      crm: props.crm,
      specialty: props.specialty,
      email: props.email,
      phone: props.phone,
      workSchedule: props.workSchedule,
      status: DoctorStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
    })

    doctor.addDomainEvent(
      new DoctorRegistered(
        doctor._id.toValue(),
        doctor.name,
        doctor.crm.formatted,
        doctor.specialty.type,
      ),
    )

    return right(doctor)
  }

  static reconstitute(props: DoctorProps, id: UniqueEntityId): Doctor {
    return new Doctor(props, id)
  }

  updateWorkSchedule(schedule: WorkSchedule): void {
    this.props.workSchedule = schedule
    this.props.updatedAt = new Date()
  }

  deactivate(): void {
    this.props.status = DoctorStatus.INACTIVE
    this.props.updatedAt = new Date()
  }
}
