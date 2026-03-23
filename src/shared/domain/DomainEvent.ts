/**
 * Interface que todos os Domain Events implementam.
 *
 * Domain Events representam algo que aconteceu no domínio.
 * Eles são capturados pelos Aggregate Roots e publicados pela camada de aplicação
 * APÓS a persistência ser confirmada.
 *
 * Exemplos: PatientRegistered, AppointmentScheduled, AppointmentCancelled
 */
export interface DomainEvent {
  /** Nome único do evento (ex: 'patient.registered') */
  readonly eventName: string
  /** ID do agregado que gerou o evento */
  readonly aggregateId: string
  /** Quando o evento ocorreu */
  readonly occurredOn: Date
}
