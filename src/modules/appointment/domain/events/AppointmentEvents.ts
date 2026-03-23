import { DomainEventBase } from '@shared/domain/DomainEventBase'

export class AppointmentScheduled extends DomainEventBase {
  readonly eventName = 'appointment.scheduled'

  constructor(
    aggregateId: string,
    public readonly patientId: string,
    public readonly doctorId: string,
    public readonly timeSlot: { start: Date; end: Date },
  ) {
    super(aggregateId)
  }
}

export class AppointmentConfirmed extends DomainEventBase {
  readonly eventName = 'appointment.confirmed'

  constructor(
    aggregateId: string,
    public readonly patientId: string,
    public readonly doctorId: string,
  ) {
    super(aggregateId)
  }
}

export class AppointmentCancelled extends DomainEventBase {
  readonly eventName = 'appointment.cancelled'

  constructor(
    aggregateId: string,
    public readonly reason: string,
    public readonly cancelledBy: 'patient' | 'doctor' | 'system',
  ) {
    super(aggregateId)
  }
}

export class AppointmentCompleted extends DomainEventBase {
  readonly eventName = 'appointment.completed'

  constructor(
    aggregateId: string,
    public readonly patientId: string,
    public readonly doctorId: string,
  ) {
    super(aggregateId)
  }
}
