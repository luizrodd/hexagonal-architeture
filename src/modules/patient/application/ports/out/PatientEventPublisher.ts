import { DomainEvent } from '@shared/domain/DomainEvent'

/**
 * Driven Port: PatientEventPublisher
 *
 * Abstrai o mecanismo de publicação de eventos de domínio.
 * O use case não sabe se os eventos vão para RabbitMQ, Redis Streams,
 * EventEmitter local, ou um arquivo de log.
 */
export interface PatientEventPublisher {
  publish(events: DomainEvent[]): Promise<void>
}
