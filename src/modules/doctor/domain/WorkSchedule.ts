import { ValueObject } from '@shared/domain/ValueObject'
import { Either, left, right } from '@shared/application/Either'
import { ValidationException } from '@modules/patient/domain/exceptions/DomainException'

export class InvalidWorkScheduleException extends ValidationException {
  constructor(message: string) {
    super(`Horário de trabalho inválido: ${message}`)
  }
}

export enum Weekday {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
}

export interface TimeWindow {
  weekday: Weekday
  startTime: string  // "HH:MM"
  endTime: string    // "HH:MM"
}

interface WorkScheduleProps {
  windows: TimeWindow[]
}

/**
 * Value Object: WorkSchedule
 *
 * Representa a grade de horários de trabalho de um médico.
 * Ex: Segunda-Feira 08:00-12:00, Quarta-Feira 14:00-18:00
 *
 * É imutável: para alterar a agenda, cria-se um novo WorkSchedule.
 */
export class WorkSchedule extends ValueObject<WorkScheduleProps> {
  private constructor(props: WorkScheduleProps) {
    super(props)
  }

  get windows(): TimeWindow[] {
    return [...this.props.windows]
  }

  /** Verifica se o médico trabalha em um dia/horário específico */
  isAvailableAt(weekday: Weekday, time: string): boolean {
    return this.props.windows.some(
      (w) =>
        w.weekday === weekday &&
        w.startTime <= time &&
        w.endTime >= time,
    )
  }

  static create(windows: TimeWindow[]): Either<InvalidWorkScheduleException, WorkSchedule> {
    if (windows.length === 0) {
      return left(new InvalidWorkScheduleException('Deve ter pelo menos uma janela de horário.'))
    }

    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/
    for (const w of windows) {
      if (!timeRegex.test(w.startTime) || !timeRegex.test(w.endTime)) {
        return left(new InvalidWorkScheduleException(`Horário inválido: ${w.startTime} - ${w.endTime}`))
      }
      if (w.startTime >= w.endTime) {
        return left(new InvalidWorkScheduleException(`Horário de início deve ser anterior ao fim: ${w.startTime} >= ${w.endTime}`))
      }
    }

    return right(new WorkSchedule({ windows }))
  }
}
