import { DomainEventBase } from '@shared/domain/DomainEventBase'

export class DoctorRegistered extends DomainEventBase {
  readonly eventName = 'doctor.registered'

  constructor(
    aggregateId: string,
    public readonly doctorName: string,
    public readonly crm: string,
    public readonly specialty: string,
  ) {
    super(aggregateId)
  }
}
