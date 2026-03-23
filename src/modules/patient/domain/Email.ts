import { ValueObject } from '@shared/domain/ValueObject'
import { Either, left, right } from '@shared/application/Either'
import { ValidationException } from './exceptions/DomainException'

export class InvalidEmailException extends ValidationException {
  constructor(email: string) {
    super(`Email '${email}' é inválido.`)
  }
}

interface EmailProps {
  value: string
}

/**
 * Value Object: Email
 * Normaliza para lowercase e valida formato.
 */
export class Email extends ValueObject<EmailProps> {
  private constructor(props: EmailProps) {
    super(props)
  }

  get value(): string {
    return this.props.value
  }

  static create(raw: string): Either<InvalidEmailException, Email> {
    const normalized = raw.trim().toLowerCase()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(normalized)) {
      return left(new InvalidEmailException(raw))
    }

    return right(new Email({ value: normalized }))
  }
}
