import { ValidationException } from './DomainException'

export class InvalidCPFException extends ValidationException {
  constructor(cpf: string) {
    super(`CPF '${cpf}' é inválido. Verifique os dígitos verificadores.`)
  }
}
