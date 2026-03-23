/**
 * Classe base para todas as exceções de domínio.
 *
 * As exceções de domínio representam violações de regras de negócio.
 * Elas NÃO são erros de infraestrutura (banco fora, rede indisponível).
 *
 * O mapeamento de DomainException → HTTP status code acontece
 * exclusivamente no middleware de erro da camada de infraestrutura.
 * O domínio não sabe nada sobre HTTP.
 */
export abstract class DomainException extends Error {
  protected constructor(message: string) {
    super(message)
    this.name = this.constructor.name
    // Necessário para `instanceof` funcionar corretamente com subclasses
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

/** Erros de validação (dados inválidos) → HTTP 422 */
export abstract class ValidationException extends DomainException {}

/** Conflitos de negócio (recurso já existe, regra violada) → HTTP 409 */
export abstract class ConflictException extends DomainException {}

/** Recurso não encontrado → HTTP 404 */
export abstract class NotFoundException extends DomainException {}

/** Transição de estado inválida → HTTP 422 */
export abstract class InvalidStateException extends DomainException {}
