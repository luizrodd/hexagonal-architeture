import { Entity } from '@shared/domain/Entity'
import { UniqueEntityId } from '@shared/domain/UniqueEntityId'
import { Medication } from './Medication'
import { Diagnosis } from './Diagnosis'

interface PrescriptionProps {
  appointmentId: string
  doctorId: string
  diagnosis: Diagnosis
  medications: Medication[]
  instructions: string
  prescribedAt: Date
  isActive: boolean
}

/**
 * Entity filha: Prescription (Receita Médica)
 *
 * Tem identidade própria (cada receita é única),
 * mas pertence ao MedicalRecord (Aggregate Root).
 *
 * Nunca é carregada ou salva diretamente pelo repositório.
 * Sempre é acessada via MedicalRecord.
 *
 * Diferença entre Entity filha e Value Object:
 * - Prescription TEM identidade (duas receitas com mesmo conteúdo são diferentes)
 * - Medication NÃO tem identidade (dois medicamentos iguais = o mesmo medicamento)
 */
export class Prescription extends Entity<PrescriptionProps> {
  private constructor(props: PrescriptionProps, id?: UniqueEntityId) {
    super(props, id)
  }

  get appointmentId(): string { return this.props.appointmentId }
  get doctorId(): string { return this.props.doctorId }
  get diagnosis(): Diagnosis { return this.props.diagnosis }
  get medications(): Medication[] { return [...this.props.medications] }
  get instructions(): string { return this.props.instructions }
  get prescribedAt(): Date { return this.props.prescribedAt }
  get isActive(): boolean { return this.props.isActive }

  static create(props: {
    appointmentId: string
    doctorId: string
    diagnosis: Diagnosis
    medications: Medication[]
    instructions: string
  }): Prescription {
    return new Prescription({
      ...props,
      prescribedAt: new Date(),
      isActive: true,
    })
  }

  static reconstitute(props: PrescriptionProps, id: UniqueEntityId): Prescription {
    return new Prescription(props, id)
  }

  revoke(): void {
    this.props.isActive = false
  }
}
