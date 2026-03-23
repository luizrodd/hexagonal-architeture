import { Either } from '@shared/application/Either'
import { DomainException } from '@modules/patient/domain/exceptions/DomainException'
import { PatientResponseDto } from '../../dto/PatientResponseDto'

export interface GetPatientUseCase {
  execute(patientId: string): Promise<Either<DomainException, PatientResponseDto>>
}
