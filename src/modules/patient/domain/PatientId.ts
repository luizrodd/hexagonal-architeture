import { UniqueEntityId } from '@shared/domain/UniqueEntityId'

/**
 * Identificador tipado para Patient.
 * Usar PatientId (em vez de string) torna o código mais seguro:
 * você nunca passa um DoctorId onde um PatientId é esperado.
 */
export class PatientId extends UniqueEntityId {
  private readonly _brand: 'PatientId' = 'PatientId'

  constructor(id?: string) {
    super(id)
  }
}
