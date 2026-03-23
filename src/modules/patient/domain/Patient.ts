import { AggregateRoot } from '@shared/domain/AggregateRoot'
import { UniqueEntityId } from '@shared/domain/UniqueEntityId'
import { Either, left, right } from '@shared/application/Either'
import { ValidationException } from './exceptions/DomainException'
import { PatientId } from './PatientId'
import { CPF } from './CPF'
import { Email } from './Email'
import { Phone } from './Phone'
import { Address } from './Address'
import { MedicalHistory } from './MedicalHistory'
import { PatientRegistered } from './events/PatientRegistered'
import { PatientUpdated } from './events/PatientUpdated'

export class PatientCreationException extends ValidationException {
  constructor(message: string) {
    super(message)
  }
}

/** Status do paciente */
export enum PatientStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

interface PatientProps {
  name: string
  cpf: CPF
  email: Email
  phone: Phone
  birthDate: Date
  address: Address
  status: PatientStatus
  medicalHistory: MedicalHistory[]
  createdAt: Date
  updatedAt: Date
}

/**
 * Aggregate Root: Patient
 *
 * === REGRAS DO AGREGADO ===
 * 1. Todo acesso e mutação do paciente passa por este AR
 * 2. Repositório só opera em Patient (nunca em MedicalHistory diretamente)
 * 3. Invariantes são garantidos pelos métodos do AR
 *
 * === FACTORY METHODS ===
 * - Patient.create()        → novo paciente (valida + emite PatientRegistered)
 * - Patient.reconstitute()  → recarga do banco (sem eventos, dados já validados)
 *
 * Por que dois factories?
 * - create() é para o caso de uso de cadastro: dispara eventos de domínio
 * - reconstitute() é para o repositório: os dados já passaram pela validação
 *   anteriormente, não precisamos emitir eventos novamente
 */
export class Patient extends AggregateRoot<PatientProps> {
  private constructor(props: PatientProps, id?: UniqueEntityId) {
    super(props, id)
  }

  // ── Getters ─────────────────────────────────────────────────────────────────

  get patientId(): PatientId {
    return new PatientId(this._id.toValue())
  }

  get name(): string { return this.props.name }
  get cpf(): CPF { return this.props.cpf }
  get email(): Email { return this.props.email }
  get phone(): Phone { return this.props.phone }
  get birthDate(): Date { return this.props.birthDate }
  get address(): Address { return this.props.address }
  get status(): PatientStatus { return this.props.status }
  get medicalHistory(): MedicalHistory[] { return [...this.props.medicalHistory] }
  get createdAt(): Date { return this.props.createdAt }
  get updatedAt(): Date { return this.props.updatedAt }

  get isActive(): boolean {
    return this.props.status === PatientStatus.ACTIVE
  }

  // ── Factory: novo paciente ───────────────────────────────────────────────────

  /**
   * Cria um novo paciente.
   *
   * Responsabilidades:
   * 1. Valida as regras de negócio de criação
   * 2. Emite o Domain Event PatientRegistered
   * 3. Retorna Either para que o chamador trate erros sem try/catch
   */
  static create(props: {
    name: string
    cpf: CPF
    email: Email
    phone: Phone
    birthDate: Date
    address: Address
  }): Either<PatientCreationException, Patient> {
    if (!props.name?.trim()) {
      return left(new PatientCreationException('Nome do paciente é obrigatório.'))
    }

    if (props.name.trim().length < 2) {
      return left(new PatientCreationException('Nome deve ter pelo menos 2 caracteres.'))
    }

    if (Patient.isUnderage(props.birthDate)) {
      return left(new PatientCreationException('Paciente deve ter pelo menos 0 anos (data futura não permitida).'))
    }

    const now = new Date()
    const patient = new Patient(
      {
        name: props.name.trim(),
        cpf: props.cpf,
        email: props.email,
        phone: props.phone,
        birthDate: props.birthDate,
        address: props.address,
        status: PatientStatus.ACTIVE,
        medicalHistory: [],
        createdAt: now,
        updatedAt: now,
      },
    )

    // Emite o domain event — será coletado e publicado pela camada de aplicação
    patient.addDomainEvent(
      new PatientRegistered(
        patient._id.toValue(),
        patient.name,
        patient.email.value,
        patient.cpf.value,
      ),
    )

    return right(patient)
  }

  // ── Factory: rehidratação do banco ───────────────────────────────────────────

  /**
   * Reconstitui um Patient a partir dos dados de persistência.
   * NÃO emite eventos (o paciente já existia antes).
   */
  static reconstitute(
    props: PatientProps,
    id: UniqueEntityId,
  ): Patient {
    return new Patient(props, id)
  }

  // ── Métodos de domínio ───────────────────────────────────────────────────────

  /**
   * Atualiza dados de contato do paciente.
   * Emite PatientUpdated apenas com os campos que mudaram.
   */
  updateContactInfo(updates: {
    email?: Email
    phone?: Phone
    address?: Address
  }): void {
    const changedFields: string[] = []

    if (updates.email && !updates.email.equals(this.props.email)) {
      this.props.email = updates.email
      changedFields.push('email')
    }

    if (updates.phone && !updates.phone.equals(this.props.phone)) {
      this.props.phone = updates.phone
      changedFields.push('phone')
    }

    if (updates.address && !updates.address.equals(this.props.address)) {
      this.props.address = updates.address
      changedFields.push('address')
    }

    if (changedFields.length > 0) {
      this.props.updatedAt = new Date()
      this.addDomainEvent(
        new PatientUpdated(this._id.toValue(), changedFields),
      )
    }
  }

  /** Desativa o paciente (soft delete) */
  deactivate(): void {
    if (this.props.status === PatientStatus.INACTIVE) return
    this.props.status = PatientStatus.INACTIVE
    this.props.updatedAt = new Date()
  }

  /** Adiciona um registro ao histórico médico */
  addMedicalHistory(history: MedicalHistory): void {
    this.props.medicalHistory.push(history)
    this.props.updatedAt = new Date()
  }

  // ── Helpers privados ─────────────────────────────────────────────────────────

  private static isUnderage(birthDate: Date): boolean {
    return birthDate > new Date()
  }
}
