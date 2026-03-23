import { injectable, inject } from 'tsyringe'
import { Either, left, right } from '@shared/application/Either'
import { DomainException } from '@modules/patient/domain/exceptions/DomainException'
import { PatientId } from '@modules/patient/domain/PatientId'
import { PatientNotFoundException } from '@modules/patient/domain/exceptions/PatientNotFoundException'
import { GetPatientUseCase } from '../ports/in/GetPatientUseCase'
import { PatientRepository } from '../ports/out/PatientRepository'
import { PatientResponseDto } from '../dto/PatientResponseDto'
import { PatientMapper } from '../../infrastructure/adapters/out/persistence/PatientMapper'

@injectable()
export class GetPatientUseCaseImpl implements GetPatientUseCase {
  constructor(
    @inject('PatientRepository')
    private readonly patientRepository: PatientRepository,
  ) {}

  async execute(patientId: string): Promise<Either<DomainException, PatientResponseDto>> {
    const id = new PatientId(patientId)
    const patient = await this.patientRepository.findById(id)

    if (!patient) {
      return left(new PatientNotFoundException(patientId))
    }

    return right(PatientMapper.toResponseDto(patient))
  }
}
