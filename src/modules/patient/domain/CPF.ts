import { ValueObject } from '@shared/domain/ValueObject'
import { Either, left, right } from '@shared/application/Either'
import { InvalidCPFException } from './exceptions/InvalidCPFException'

interface CPFProps {
  value: string
}

/**
 * Value Object: CPF (Cadastro de Pessoa Física)
 *
 * Demonstra:
 * - Construtor privado + static factory (garante que só VOs válidos existem)
 * - Retorno Either<Erro, VO> em vez de throw na factory
 * - Algoritmo de validação encapsulado no próprio VO
 * - Normalização (remove pontos e hífen) no momento da criação
 * - Igualdade estrutural herdada de ValueObject
 */
export class CPF extends ValueObject<CPFProps> {
  private constructor(props: CPFProps) {
    super(props)
  }

  get value(): string {
    return this.props.value
  }

  /** CPF formatado: 000.000.000-00 */
  get formatted(): string {
    const v = this.props.value
    return `${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6, 9)}-${v.slice(9)}`
  }

  /**
   * Cria um CPF válido.
   * Aceita com ou sem formatação (pontos e hífen são removidos).
   */
  static create(raw: string): Either<InvalidCPFException, CPF> {
    const normalized = CPF.normalize(raw)

    if (!CPF.isValid(normalized)) {
      return left(new InvalidCPFException(raw))
    }

    return right(new CPF({ value: normalized }))
  }

  /** Remove formatação */
  private static normalize(cpf: string): string {
    return cpf.replace(/[.\-]/g, '').trim()
  }

  /**
   * Valida CPF pelo algoritmo dos dígitos verificadores.
   *
   * Algoritmo:
   * 1. Rejeita sequências repetidas (111.111.111-11)
   * 2. Calcula o 1º dígito verificador
   * 3. Calcula o 2º dígito verificador
   */
  private static isValid(cpf: string): boolean {
    if (cpf.length !== 11) return false
    if (/^(\d)\1{10}$/.test(cpf)) return false // ex: 00000000000

    const calc = (factor: number): number => {
      let sum = 0
      for (let i = 0; i < factor - 1; i++) {
        sum += parseInt(cpf[i]) * (factor - i)
      }
      const remainder = (sum * 10) % 11
      return remainder >= 10 ? 0 : remainder
    }

    return calc(10) === parseInt(cpf[9]) && calc(11) === parseInt(cpf[10])
  }
}
