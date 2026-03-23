import {
  ValidationException,
  NotFoundException,
  ConflictException,
} from '@modules/patient/domain/exceptions/DomainException'

export class InvalidCRMException extends ValidationException {
  constructor(crm: string) {
    super(`CRM '${crm}' é inválido. Formato esperado: CRM/UF 123456`)
  }
}

export class DoctorNotFoundException extends NotFoundException {
  constructor(identifier: string) {
    super(`Médico não encontrado: '${identifier}'.`)
  }
}

export class DuplicateCRMException extends ConflictException {
  constructor(crm: string) {
    super(`Já existe um médico cadastrado com o CRM '${crm}'.`)
  }
}
