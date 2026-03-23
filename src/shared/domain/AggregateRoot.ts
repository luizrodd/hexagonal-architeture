import { Entity } from './Entity'
import { UniqueEntityId } from './UniqueEntityId'
import { DomainEvent } from './DomainEvent'

/**
 * Classe base para Aggregate Roots.
 *
 * O Aggregate Root é:
 * - A fronteira de consistência transacional
 * - O único ponto de entrada para mutações do agregado
 * - O coletor de Domain Events gerados durante operações
 *
 * Regras:
 * - Repositórios só carregam/salvam Aggregate Roots (nunca entidades filhas diretamente)
 * - Invariantes do agregado são garantidos dentro do AR
 * - Eventos são publicados pela camada de Aplicação APÓS persistência
 *
 * Exemplos: Patient, Doctor, Appointment, MedicalRecord
 */
export abstract class AggregateRoot<T> extends Entity<T> {
  private _domainEvents: DomainEvent[] = []

  protected constructor(props: T, id?: UniqueEntityId) {
    super(props, id)
  }

  get domainEvents(): DomainEvent[] {
    return this._domainEvents
  }

  /**
   * Adiciona um Domain Event à fila interna do agregado.
   * Chamado pelos métodos de domínio do AR (ex: Patient.create, appointment.cancel).
   */
  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event)
  }

  /**
   * Limpa a fila de eventos após publicação.
   * Chamado pela camada de aplicação após publicar os eventos.
   */
  clearEvents(): void {
    this._domainEvents = []
  }
}
