import { ValueObject } from '@shared/domain/ValueObject'
import { Either, left, right } from '@shared/application/Either'
import { ValidationException } from '@modules/patient/domain/exceptions/DomainException'

export class InvalidDiagnosisException extends ValidationException {
  constructor(msg: string) { super(`Diagnóstico inválido: ${msg}`) }
}

interface DiagnosisProps {
  code: string        // CID-10: ex "E11", "I10"
  description: string
}

/**
 * Value Object: Diagnosis (Diagnóstico)
 * Representa um diagnóstico médico com código CID-10.
 */
export class Diagnosis extends ValueObject<DiagnosisProps> {
  private constructor(props: DiagnosisProps) { super(props) }

  get code(): string { return this.props.code }
  get description(): string { return this.props.description }
  get formatted(): string { return `${this.props.code} - ${this.props.description}` }

  static create(code: string, description: string): Either<InvalidDiagnosisException, Diagnosis> {
    if (!code?.trim()) return left(new InvalidDiagnosisException('Código CID-10 é obrigatório.'))
    if (!description?.trim()) return left(new InvalidDiagnosisException('Descrição é obrigatória.'))
    return right(new Diagnosis({ code: code.trim().toUpperCase(), description: description.trim() }))
  }
}
