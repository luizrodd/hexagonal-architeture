import { UniqueEntityId } from '@shared/domain/UniqueEntityId'

export class DoctorId extends UniqueEntityId {
  private readonly _brand: 'DoctorId' = 'DoctorId'

  constructor(id?: string) {
    super(id)
  }
}
