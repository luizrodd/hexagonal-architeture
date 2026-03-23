import { UniqueEntityId } from './UniqueEntityId'

/**
 * Classe base para Entidades de domínio.
 *
 * Características:
 * - Igualdade por identidade (ID), não por estado
 * - Dois objetos com o mesmo ID são a mesma entidade, mesmo com props diferentes
 *
 * Entidades filhas (child entities) estendem esta classe.
 * Aggregate Roots estendem AggregateRoot (que estende Entity).
 */
export abstract class Entity<T> {
  protected readonly _id: UniqueEntityId
  protected props: T

  protected constructor(props: T, id?: UniqueEntityId) {
    this._id = id ?? new UniqueEntityId()
    this.props = props
  }

  get id(): UniqueEntityId {
    return this._id
  }

  /**
   * Compara duas entidades por ID.
   */
  equals(entity?: Entity<T>): boolean {
    if (!entity) return false
    if (!(entity instanceof Entity)) return false
    return this._id.equals(entity._id)
  }
}
