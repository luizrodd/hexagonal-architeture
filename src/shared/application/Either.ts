/**
 * Either<L, R> — tipo funcional para tratamento de erros sem exceções.
 *
 * Em vez de lançar exceções para falhas recuperáveis do domínio,
 * os use cases retornam Either<ErroEsperado, Sucesso>.
 *
 * - Left<L>  → representa falha (ex: CPF inválido, paciente não encontrado)
 * - Right<R> → representa sucesso (ex: PatientResponseDto)
 *
 * Uso:
 * ```ts
 * const result: Either<DomainException, PatientDto> = await useCase.execute(dto)
 *
 * if (result.isLeft()) {
 *   // result.value é o erro
 * } else {
 *   // result.value é o sucesso
 * }
 * ```
 *
 * Por que não usar exceções?
 * - Exceções são invisíveis na assinatura do método
 * - Either força o chamador a tratar o erro explicitamente
 * - Melhora a legibilidade e testabilidade
 */

export class Left<L, R> {
  readonly value: L

  constructor(value: L) {
    this.value = value
  }

  isLeft(): this is Left<L, R> {
    return true
  }

  isRight(): this is Right<L, R> {
    return false
  }
}

export class Right<L, R> {
  readonly value: R

  constructor(value: R) {
    this.value = value
  }

  isLeft(): this is Left<L, R> {
    return false
  }

  isRight(): this is Right<L, R> {
    return true
  }
}

export type Either<L, R> = Left<L, R> | Right<L, R>

/** Helper para criar Left (falha) */
export const left = <L, R>(value: L): Either<L, R> => new Left<L, R>(value)

/** Helper para criar Right (sucesso) */
export const right = <L, R>(value: R): Either<L, R> => new Right<L, R>(value)
