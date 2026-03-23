import { ValueObject } from '@shared/domain/ValueObject'
import { Either, left, right } from '@shared/application/Either'
import { InvalidStatusTransitionException } from './exceptions/AppointmentExceptions'

/**
 * Os possíveis estados de uma consulta.
 */
export enum AppointmentStatusType {
  SCHEDULED = 'SCHEDULED',     // Agendada (aguardando confirmação)
  CONFIRMED = 'CONFIRMED',     // Confirmada pelo médico
  COMPLETED = 'COMPLETED',     // Realizada
  CANCELLED = 'CANCELLED',     // Cancelada
  NO_SHOW = 'NO_SHOW',         // Paciente não compareceu
}

/**
 * Transições de estado permitidas.
 *
 * Diagrama:
 *   SCHEDULED → CONFIRMED
 *   SCHEDULED → CANCELLED
 *   CONFIRMED → COMPLETED
 *   CONFIRMED → CANCELLED
 *   CONFIRMED → NO_SHOW
 */
const ALLOWED_TRANSITIONS: Record<AppointmentStatusType, AppointmentStatusType[]> = {
  [AppointmentStatusType.SCHEDULED]: [
    AppointmentStatusType.CONFIRMED,
    AppointmentStatusType.CANCELLED,
  ],
  [AppointmentStatusType.CONFIRMED]: [
    AppointmentStatusType.COMPLETED,
    AppointmentStatusType.CANCELLED,
    AppointmentStatusType.NO_SHOW,
  ],
  [AppointmentStatusType.COMPLETED]: [],
  [AppointmentStatusType.CANCELLED]: [],
  [AppointmentStatusType.NO_SHOW]: [],
}

interface AppointmentStatusProps {
  value: AppointmentStatusType
}

/**
 * Value Object: AppointmentStatus
 *
 * Encapsula a máquina de estados da consulta.
 * Garante que apenas transições válidas sejam feitas.
 *
 * Por que o status é um Value Object em vez de um enum simples?
 * - Centraliza a lógica de transição de estados
 * - A entidade Appointment não precisa conhecer as regras de transição
 * - Fácil de testar isoladamente
 */
export class AppointmentStatus extends ValueObject<AppointmentStatusProps> {
  private constructor(props: AppointmentStatusProps) {
    super(props)
  }

  get value(): AppointmentStatusType { return this.props.value }

  get isTerminal(): boolean {
    return (
      this.props.value === AppointmentStatusType.COMPLETED ||
      this.props.value === AppointmentStatusType.CANCELLED ||
      this.props.value === AppointmentStatusType.NO_SHOW
    )
  }

  /**
   * Tenta fazer uma transição para um novo estado.
   * Retorna Left se a transição não for permitida.
   */
  transitionTo(
    next: AppointmentStatusType,
  ): Either<InvalidStatusTransitionException, AppointmentStatus> {
    const allowed = ALLOWED_TRANSITIONS[this.props.value]

    if (!allowed.includes(next)) {
      return left(
        new InvalidStatusTransitionException(this.props.value, next),
      )
    }

    return right(new AppointmentStatus({ value: next }))
  }

  static initial(): AppointmentStatus {
    return new AppointmentStatus({ value: AppointmentStatusType.SCHEDULED })
  }

  static reconstitute(value: string): AppointmentStatus {
    return new AppointmentStatus({ value: value as AppointmentStatusType })
  }
}
