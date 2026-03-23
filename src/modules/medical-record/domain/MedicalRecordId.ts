import { UniqueEntityId } from '@shared/domain/UniqueEntityId'

export class MedicalRecordId extends UniqueEntityId {
  private readonly _brand: 'MedicalRecordId' = 'MedicalRecordId'
  constructor(id?: string) { super(id) }
}
