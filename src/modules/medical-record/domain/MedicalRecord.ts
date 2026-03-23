import { AggregateRoot } from '@shared/domain/AggregateRoot'
import { UniqueEntityId } from '@shared/domain/UniqueEntityId'
import { Either, left, right } from '@shared/application/Either'
import { ValidationException } from '@modules/patient/domain/exceptions/DomainException'
import { MedicalRecordId } from './MedicalRecordId'
import { Prescription } from './Prescription'
import { MedicalRecordCreated, PrescriptionAdded } from './events/MedicalRecordEvents'

export class MedicalRecordException extends ValidationException {
  constructor(msg: string) { super(msg) }
}

interface MedicalRecordProps {
  patientId: string
  appointmentId: string
  anamnesis: string           // história clínica
  physicalExam: string        // exame físico
  prescriptions: Prescription[]
  createdAt: Date
  updatedAt: Date
}

/**
 * Aggregate Root: MedicalRecord (Prontuário Médico)
 *
 * Um prontuário é criado após uma consulta realizada.
 * Contém a história clínica, exame físico e receitas (Prescriptions).
 *
 * Prescription é uma Entity FILHA:
 * - Tem identidade própria (prescriptionId)
 * - É criada, acessada e removida APENAS através do MedicalRecord
 * - Nunca carregada por um repositório próprio
 *
 * Este módulo demonstra a relação Aggregate Root → Entity filha.
 */
export class MedicalRecord extends AggregateRoot<MedicalRecordProps> {
  private constructor(props: MedicalRecordProps, id?: UniqueEntityId) {
    super(props, id)
  }

  get medicalRecordId(): MedicalRecordId {
    return new MedicalRecordId(this._id.toValue())
  }

  get patientId(): string { return this.props.patientId }
  get appointmentId(): string { return this.props.appointmentId }
  get anamnesis(): string { return this.props.anamnesis }
  get physicalExam(): string { return this.props.physicalExam }
  get prescriptions(): Prescription[] { return [...this.props.prescriptions] }
  get createdAt(): Date { return this.props.createdAt }
  get updatedAt(): Date { return this.props.updatedAt }

  static create(props: {
    patientId: string
    appointmentId: string
    anamnesis: string
    physicalExam: string
  }): Either<MedicalRecordException, MedicalRecord> {
    if (!props.anamnesis?.trim()) {
      return left(new MedicalRecordException('Anamnese é obrigatória.'))
    }

    const now = new Date()
    const record = new MedicalRecord({
      patientId: props.patientId,
      appointmentId: props.appointmentId,
      anamnesis: props.anamnesis.trim(),
      physicalExam: props.physicalExam?.trim() ?? '',
      prescriptions: [],
      createdAt: now,
      updatedAt: now,
    })

    record.addDomainEvent(
      new MedicalRecordCreated(
        record._id.toValue(),
        props.patientId,
        props.appointmentId,
      ),
    )

    return right(record)
  }

  static reconstitute(props: MedicalRecordProps, id: UniqueEntityId): MedicalRecord {
    return new MedicalRecord(props, id)
  }

  /**
   * Adiciona uma receita ao prontuário.
   * A Prescription só existe dentro deste Aggregate Root.
   */
  addPrescription(prescription: Prescription): void {
    this.props.prescriptions.push(prescription)
    this.props.updatedAt = new Date()

    this.addDomainEvent(
      new PrescriptionAdded(
        this._id.toValue(),
        prescription.id.toValue(),
        this.props.patientId,
      ),
    )
  }
}
