import { ConflictException } from './DomainException'

export class DuplicatePatientException extends ConflictException {
  constructor(cpf: string) {
    super(`Já existe um paciente cadastrado com o CPF '${cpf}'.`)
  }
}
