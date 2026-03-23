import { DomainEventBase } from '@shared/domain/DomainEventBase'

/**
 * Domain Event: PatientRegistered
 *
 * Emitido quando um novo paciente é cadastrado com sucesso.
 *
 * Possíveis consumidores deste evento:
 * - Enviar email de boas-vindas
 * - Criar prontuário inicial
 * - Notificar sistema de CRM
 */
export class PatientRegistered extends DomainEventBase {
  readonly eventName = 'patient.registered'

  constructor(
    aggregateId: string,
    public readonly patientName: string,
    public readonly email: string,
    public readonly cpf: string,
  ) {
    super(aggregateId)
  }
}
