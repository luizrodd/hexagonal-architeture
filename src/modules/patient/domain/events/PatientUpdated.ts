import { DomainEventBase } from '@shared/domain/DomainEventBase'

/**
 * Domain Event: PatientUpdated
 * Emitido quando dados de contato do paciente são alterados.
 */
export class PatientUpdated extends DomainEventBase {
  readonly eventName = 'patient.updated'

  constructor(
    aggregateId: string,
    public readonly changedFields: string[],
  ) {
    super(aggregateId)
  }
}
