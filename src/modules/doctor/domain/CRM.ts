import { ValueObject } from '@shared/domain/ValueObject'
import { Either, left, right } from '@shared/application/Either'
import { InvalidCRMException } from './exceptions/DoctorExceptions'

interface CRMProps {
  number: string    // apenas dígitos
  state: string     // UF: SP, RJ, MG...
}

/**
 * Value Object: CRM (Conselho Regional de Medicina)
 *
 * Formato: CRM/SP 123456 ou CRM/RJ 98765
 * Armazena número e estado separados para facilitar consultas.
 */
export class CRM extends ValueObject<CRMProps> {
  private constructor(props: CRMProps) {
    super(props)
  }

  get number(): string { return this.props.number }
  get state(): string { return this.props.state }

  get formatted(): string {
    return `CRM/${this.props.state} ${this.props.number}`
  }

  /** Aceita: "CRM/SP 123456", "SP123456", "123456-SP" */
  static create(raw: string): Either<InvalidCRMException, CRM> {
    const normalized = raw.toUpperCase().replace(/\s/g, '')

    // Tenta extrair número e estado
    const patterns = [
      /^CRM\/([A-Z]{2})(\d{4,6})$/,   // CRM/SP123456
      /^([A-Z]{2})(\d{4,6})$/,          // SP123456
      /^(\d{4,6})-?([A-Z]{2})$/,        // 123456-SP
    ]

    for (const pattern of patterns) {
      const match = normalized.match(pattern)
      if (match) {
        const [, a, b] = match
        const state = /^[A-Z]{2}$/.test(a) ? a : b
        const number = /^\d+$/.test(a) ? a : b

        if (state.length !== 2 || !/^\d{4,6}$/.test(number)) continue

        return right(new CRM({ number, state }))
      }
    }

    return left(new InvalidCRMException(raw))
  }
}
