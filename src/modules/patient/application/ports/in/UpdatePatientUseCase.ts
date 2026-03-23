import { Either } from '@shared/application/Either'
import { DomainException } from '@modules/patient/domain/exceptions/DomainException'
import { UpdatePatientDto } from '../../dto/UpdatePatientDto'
import { PatientResponseDto } from '../../dto/PatientResponseDto'

export interface UpdatePatientUseCase {
  execute(patientId: string, dto: UpdatePatientDto): Promise<Either<DomainException, PatientResponseDto>>
}
