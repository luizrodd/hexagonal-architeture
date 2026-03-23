/**
 * Classe base para Value Objects.
 *
 * Características:
 * - Imutabilidade: props são readonly
 * - Igualdade estrutural: dois VOs com as mesmas props são iguais
 * - Sem identidade própria (diferente de Entity)
 *
 * Exemplos de VOs: CPF, Email, Endereço, TimeSlot, AppointmentStatus
 */
export abstract class ValueObject<T extends object> {
  protected readonly props: T

  protected constructor(props: T) {
    this.props = Object.freeze(props)
  }

  /**
   * Compara dois Value Objects por igualdade estrutural (deep equality das props).
   */
  equals(vo?: ValueObject<T>): boolean {
    if (!vo) return false
    if (vo.constructor.name !== this.constructor.name) return false
    return JSON.stringify(this.props) === JSON.stringify(vo.props)
  }
}
