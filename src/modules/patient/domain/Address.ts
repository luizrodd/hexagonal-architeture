import { ValueObject } from '@shared/domain/ValueObject'
import { Either, left, right } from '@shared/application/Either'
import { ValidationException } from './exceptions/DomainException'

export class InvalidAddressException extends ValidationException {
  constructor(field: string) {
    super(`Endereço inválido: campo '${field}' é obrigatório.`)
  }
}

interface AddressProps {
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string       // UF: SP, RJ, etc.
  zipCode: string     // CEP: apenas dígitos
}

/**
 * Value Object: Address
 *
 * Um endereço é imutável. Para "alterar" um endereço,
 * cria-se um novo Address e o atribui à entidade.
 *
 * VOs complexos podem ter múltiplas propriedades — igualdade
 * ainda é estrutural (todas as props iguais = mesmo endereço).
 */
export class Address extends ValueObject<AddressProps> {
  private constructor(props: AddressProps) {
    super(props)
  }

  get street(): string { return this.props.street }
  get number(): string { return this.props.number }
  get complement(): string | undefined { return this.props.complement }
  get neighborhood(): string { return this.props.neighborhood }
  get city(): string { return this.props.city }
  get state(): string { return this.props.state }
  get zipCode(): string { return this.props.zipCode }

  get formatted(): string {
    const comp = this.props.complement ? `, ${this.props.complement}` : ''
    return `${this.props.street}, ${this.props.number}${comp} - ${this.props.neighborhood}, ${this.props.city}/${this.props.state} - CEP ${this.props.zipCode}`
  }

  static create(props: {
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
    zipCode: string
  }): Either<InvalidAddressException, Address> {
    const required = ['street', 'number', 'neighborhood', 'city', 'state', 'zipCode'] as const
    for (const field of required) {
      if (!props[field]?.trim()) {
        return left(new InvalidAddressException(field))
      }
    }

    const zipDigits = props.zipCode.replace(/\D/g, '')
    if (zipDigits.length !== 8) {
      return left(new InvalidAddressException('zipCode (deve ter 8 dígitos)'))
    }

    return right(new Address({ ...props, zipCode: zipDigits }))
  }
}
