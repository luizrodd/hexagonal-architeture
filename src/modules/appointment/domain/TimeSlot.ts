import { ValueObject } from '@shared/domain/ValueObject'
import { Either, left, right } from '@shared/application/Either'
import { InvalidTimeSlotException } from './exceptions/AppointmentExceptions'

interface TimeSlotProps {
  start: Date
  end: Date
}

/**
 * Value Object: TimeSlot
 *
 * Representa um intervalo de tempo com início e fim.
 * Contém lógica de negócio para detectar sobreposições.
 *
 * Por que TimeSlot é um Value Object?
 * - É definido pelos seus valores (start, end), não por ID
 * - É imutável
 * - "08:00-09:00 de amanhã" ≡ "08:00-09:00 de amanhã" (mesmos valores = mesmo TS)
 */
export class TimeSlot extends ValueObject<TimeSlotProps> {
  private constructor(props: TimeSlotProps) {
    super(props)
  }

  get start(): Date { return this.props.start }
  get end(): Date { return this.props.end }

  /** Duração em minutos */
  get durationMinutes(): number {
    return (this.props.end.getTime() - this.props.start.getTime()) / 60_000
  }

  /**
   * Detecta sobreposição com outro TimeSlot.
   *
   * Dois slots se sobrepõem se um começa antes do outro terminar.
   * [A.start, A.end] overlaps [B.start, B.end] quando:
   *   A.start < B.end AND A.end > B.start
   */
  overlapsWith(other: TimeSlot): boolean {
    return this.props.start < other.props.end && this.props.end > other.props.start
  }

  static create(start: Date, end: Date): Either<InvalidTimeSlotException, TimeSlot> {
    if (!(start instanceof Date) || isNaN(start.getTime())) {
      return left(new InvalidTimeSlotException('Data de início inválida.'))
    }

    if (!(end instanceof Date) || isNaN(end.getTime())) {
      return left(new InvalidTimeSlotException('Data de fim inválida.'))
    }

    if (end <= start) {
      return left(new InvalidTimeSlotException('O horário de fim deve ser posterior ao início.'))
    }

    const duration = (end.getTime() - start.getTime()) / 60_000
    if (duration < 15) {
      return left(new InvalidTimeSlotException('Duração mínima é de 15 minutos.'))
    }

    if (duration > 240) {
      return left(new InvalidTimeSlotException('Duração máxima é de 4 horas.'))
    }

    return right(new TimeSlot({ start, end }))
  }
}
