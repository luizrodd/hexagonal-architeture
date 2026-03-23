import { ValueObject } from '@shared/domain/ValueObject'
import { Either, left, right } from '@shared/application/Either'
import { ValidationException } from '@modules/patient/domain/exceptions/DomainException'

export class InvalidSpecialtyException extends ValidationException {
  constructor(specialty: string) {
    super(`Especialidade '${specialty}' não é válida.`)
  }
}

/**
 * Especialidades médicas disponíveis.
 * Em produção, poderia vir de um banco de dados ou configuração.
 */
export enum SpecialtyType {
  GENERAL_PRACTICE = 'GENERAL_PRACTICE',
  CARDIOLOGY = 'CARDIOLOGY',
  DERMATOLOGY = 'DERMATOLOGY',
  ENDOCRINOLOGY = 'ENDOCRINOLOGY',
  GASTROENTEROLOGY = 'GASTROENTEROLOGY',
  NEUROLOGY = 'NEUROLOGY',
  ONCOLOGY = 'ONCOLOGY',
  ORTHOPEDICS = 'ORTHOPEDICS',
  PEDIATRICS = 'PEDIATRICS',
  PSYCHIATRY = 'PSYCHIATRY',
  UROLOGY = 'UROLOGY',
}

const SPECIALTY_LABELS: Record<SpecialtyType, string> = {
  [SpecialtyType.GENERAL_PRACTICE]: 'Clínica Geral',
  [SpecialtyType.CARDIOLOGY]: 'Cardiologia',
  [SpecialtyType.DERMATOLOGY]: 'Dermatologia',
  [SpecialtyType.ENDOCRINOLOGY]: 'Endocrinologia',
  [SpecialtyType.GASTROENTEROLOGY]: 'Gastroenterologia',
  [SpecialtyType.NEUROLOGY]: 'Neurologia',
  [SpecialtyType.ONCOLOGY]: 'Oncologia',
  [SpecialtyType.ORTHOPEDICS]: 'Ortopedia',
  [SpecialtyType.PEDIATRICS]: 'Pediatria',
  [SpecialtyType.PSYCHIATRY]: 'Psiquiatria',
  [SpecialtyType.UROLOGY]: 'Urologia',
}

interface SpecialtyProps {
  type: SpecialtyType
}

/**
 * Value Object: Specialty
 * VO enum-backed: encapsula o enum e adiciona comportamentos.
 */
export class Specialty extends ValueObject<SpecialtyProps> {
  private constructor(props: SpecialtyProps) {
    super(props)
  }

  get type(): SpecialtyType { return this.props.type }
  get label(): string { return SPECIALTY_LABELS[this.props.type] }

  static create(type: string): Either<InvalidSpecialtyException, Specialty> {
    if (!Object.values(SpecialtyType).includes(type as SpecialtyType)) {
      return left(new InvalidSpecialtyException(type))
    }
    return right(new Specialty({ type: type as SpecialtyType }))
  }

  static fromType(type: SpecialtyType): Specialty {
    return new Specialty({ type })
  }
}
