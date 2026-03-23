import { UniqueEntityId } from '@shared/domain/UniqueEntityId'

export class AppointmentId extends UniqueEntityId {
  private readonly _brand: 'AppointmentId' = 'AppointmentId'
  constructor(id?: string) { super(id) }
}
