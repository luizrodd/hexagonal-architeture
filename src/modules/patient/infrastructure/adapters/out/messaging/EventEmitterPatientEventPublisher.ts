import { injectable } from 'tsyringe'
import { EventEmitter2 } from 'eventemitter2'
import { DomainEvent } from '@shared/domain/DomainEvent'
import { PatientEventPublisher } from '@modules/patient/application/ports/out/PatientEventPublisher'

/**
 * Driven Adapter: EventEmitterPatientEventPublisher
 *
 * Implementação simples usando EventEmitter2 (in-process).
 * Ótima para desenvolvimento e testes.
 *
 * Em produção, poderia ser substituída por uma implementação
 * que envia para RabbitMQ, AWS SQS, ou Kafka.
 *
 * O use case não sabe qual implementação está sendo usada.
 * Ele só chama eventPublisher.publish(events).
 */
@injectable()
export class EventEmitterPatientEventPublisher implements PatientEventPublisher {
  private readonly emitter: EventEmitter2

  constructor() {
    this.emitter = new EventEmitter2({ wildcard: true })
  }

  async publish(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      this.emitter.emit(event.eventName, event)
      console.log(`[Event Published] ${event.eventName}`, {
        aggregateId: event.aggregateId,
        occurredOn: event.occurredOn,
      })
    }
  }

  /** Registra um listener para um tipo de evento (útil para handlers) */
  on(eventName: string, handler: (event: DomainEvent) => void): void {
    this.emitter.on(eventName, handler)
  }
}
