import { Either } from '@shared/application/Either'
import { DomainException } from '@modules/patient/domain/exceptions/DomainException'
import { RegisterDoctorDto } from '../../dto/RegisterDoctorDto'
import { DoctorResponseDto } from '../../dto/DoctorResponseDto'

export interface RegisterDoctorUseCase {
  execute(dto: RegisterDoctorDto): Promise<Either<DomainException, DoctorResponseDto>>
}
