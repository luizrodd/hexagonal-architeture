import {
  ConflictException,
  NotFoundException,
  InvalidStateException,
  ValidationException,
} from '@modules/patient/domain/exceptions/DomainException'

export class TimeSlotUnavailableException extends ConflictException {
  constructor(doctorId: string, start: Date) {
    super(
      `Médico '${doctorId}' não está disponível em ${start.toISOString()}.`,
    )
  }
}

export class AppointmentNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Consulta não encontrada: '${id}'.`)
  }
}

export class InvalidStatusTransitionException extends InvalidStateException {
  constructor(from: string, to: string) {
    super(
      `Transição de estado inválida: '${from}' → '${to}'. ` +
      `Consulte o diagrama de estados para transições permitidas.`,
    )
  }
}

export class InvalidTimeSlotException extends ValidationException {
  constructor(message: string) {
    super(`TimeSlot inválido: ${message}`)
  }
}
