import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import {
  DomainException,
  ValidationException,
  ConflictException,
  NotFoundException,
  InvalidStateException,
} from '@modules/patient/domain/exceptions/DomainException'

/**
 * Middleware de tratamento de erros global.
 *
 * Este é o único lugar onde erros de domínio são convertidos
 * em respostas HTTP. O domínio não sabe nada sobre status codes.
 *
 * Hierarquia de mapeamento:
 * - ZodError (validação do schema HTTP)  → 400 Bad Request
 * - ValidationException (VO inválido)    → 422 Unprocessable Entity
 * - ConflictException (regra de negócio) → 409 Conflict
 * - NotFoundException (não encontrado)   → 404 Not Found
 * - InvalidStateException (estado)       → 422 Unprocessable Entity
 * - Erro inesperado                      → 500 Internal Server Error
 *
 * === POR QUE USAR THROW NO CONTROLLER? ===
 * O controller faz: if (result.isLeft()) throw result.value
 * O express-async-errors captura esse throw e passa para este middleware.
 * Isso mantém o controller limpo (sem res.status(422).json(...)).
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  // Erro de validação do Zod (formato da requisição)
  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        type: 'ValidationError',
        message: 'Dados da requisição inválidos.',
        details: err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      },
    })
    return
  }

  // Erros de domínio conhecidos
  if (err instanceof DomainException) {
    const statusCode = getStatusCode(err)
    res.status(statusCode).json({
      error: {
        type: err.constructor.name,
        message: err.message,
      },
    })
    return
  }

  // Erro inesperado (bug, infraestrutura fora, etc.)
  console.error('[Unhandled Error]', err)
  res.status(500).json({
    error: {
      type: 'InternalServerError',
      message: process.env.NODE_ENV === 'production'
        ? 'Erro interno do servidor.'
        : err.message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    },
  })
}

function getStatusCode(err: DomainException): number {
  if (err instanceof NotFoundException) return 404
  if (err instanceof ConflictException) return 409
  if (err instanceof ValidationException) return 422
  if (err instanceof InvalidStateException) return 422
  return 422
}
