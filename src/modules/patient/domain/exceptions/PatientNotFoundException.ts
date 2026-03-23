import { NotFoundException } from './DomainException'

export class PatientNotFoundException extends NotFoundException {
  constructor(identifier: string) {
    super(`Paciente não encontrado: '${identifier}'.`)
  }
}
