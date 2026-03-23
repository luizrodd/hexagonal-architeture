import { DomainEvent } from './DomainEvent'

/**
 * Classe base abstrata para todos os Domain Events.
 *
 * Subclasses apenas definem o eventName e os dados específicos.
 *
 * Exemplo:
 * ```ts
 * class PatientRegistered extends DomainEventBase {
 *   readonly eventName = 'patient.registered'
 *   constructor(readonly aggregateId: string, readonly name: string) {
 *     super(aggregateId)
 *   }
 * }
 * ```
 */
export abstract class DomainEventBase implements DomainEvent {
  abstract readonly eventName: string
  readonly aggregateId: string
  readonly occurredOn: Date

  protected constructor(aggregateId: string) {
    this.aggregateId = aggregateId
    this.occurredOn = new Date()
  }
}
