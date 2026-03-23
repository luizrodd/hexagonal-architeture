import { ValueObject } from '@shared/domain/ValueObject'
import { Either, left, right } from '@shared/application/Either'
import { ValidationException } from './exceptions/DomainException'

export class InvalidPhoneException extends ValidationException {
  constructor(phone: string) {
    super(`Telefone '${phone}' é inválido. Use formato: (11) 99999-9999 ou 11999999999`)
  }
}

interface PhoneProps {
  value: string // armazena apenas dígitos
}

/**
 * Value Object: Phone
 * Suporta formato brasileiro: (XX) 9XXXX-XXXX ou XXXXXXXXXXX
 */
export class Phone extends ValueObject<PhoneProps> {
  private constructor(props: PhoneProps) {
    super(props)
  }

  get value(): string {
    return this.props.value
  }

  /** Retorna formatado: (11) 99999-9999 */
  get formatted(): string {
    const v = this.props.value
    if (v.length === 11) {
      return `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`
    }
    return `(${v.slice(0, 2)}) ${v.slice(2, 6)}-${v.slice(6)}`
  }

  static create(raw: string): Either<InvalidPhoneException, Phone> {
    const digits = raw.replace(/\D/g, '')
    // Aceita 10 (fixo) ou 11 (celular) dígitos
    if (digits.length < 10 || digits.length > 11) {
      return left(new InvalidPhoneException(raw))
    }
    return right(new Phone({ value: digits }))
  }
}
