import { ValueObject } from '@shared/domain/ValueObject'
import { Either, left, right } from '@shared/application/Either'
import { ValidationException } from '@modules/patient/domain/exceptions/DomainException'

export class InvalidMedicationException extends ValidationException {
  constructor(msg: string) { super(`Medicamento inválido: ${msg}`) }
}

interface MedicationProps {
  name: string
  dosage: string      // ex: "500mg"
  frequency: string   // ex: "1x ao dia"
  duration: string    // ex: "7 dias"
}

/**
 * Value Object: Medication (Medicamento)
 */
export class Medication extends ValueObject<MedicationProps> {
  private constructor(props: MedicationProps) { super(props) }

  get name(): string { return this.props.name }
  get dosage(): string { return this.props.dosage }
  get frequency(): string { return this.props.frequency }
  get duration(): string { return this.props.duration }

  static create(props: {
    name: string
    dosage: string
    frequency: string
    duration: string
  }): Either<InvalidMedicationException, Medication> {
    if (!props.name?.trim()) return left(new InvalidMedicationException('Nome é obrigatório.'))
    if (!props.dosage?.trim()) return left(new InvalidMedicationException('Dosagem é obrigatória.'))
    return right(new Medication({
      name: props.name.trim(),
      dosage: props.dosage.trim(),
      frequency: props.frequency?.trim() ?? '',
      duration: props.duration?.trim() ?? '',
    }))
  }
}
