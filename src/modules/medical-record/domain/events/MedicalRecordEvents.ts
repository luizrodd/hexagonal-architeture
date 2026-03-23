import { DomainEventBase } from '@shared/domain/DomainEventBase'

export class MedicalRecordCreated extends DomainEventBase {
  readonly eventName = 'medical-record.created'

  constructor(
    aggregateId: string,
    public readonly patientId: string,
    public readonly appointmentId: string,
  ) {
    super(aggregateId)
  }
}

export class PrescriptionAdded extends DomainEventBase {
  readonly eventName = 'medical-record.prescription-added'

  constructor(
    aggregateId: string,
    public readonly prescriptionId: string,
    public readonly patientId: string,
  ) {
    super(aggregateId)
  }
}
