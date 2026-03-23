import { Either } from '@shared/application/Either'
import { DomainException } from '@modules/patient/domain/exceptions/DomainException'
import { RegisterPatientDto } from '../../dto/RegisterPatientDto'
import { PatientResponseDto } from '../../dto/PatientResponseDto'

/**
 * Driving Port: RegisterPatientUseCase
 *
 * Esta interface representa O QUE o sistema oferece.
 * O HTTP controller (driving adapter) programa contra esta interface,
 * não contra a implementação concreta.
 *
 * Vantagens:
 * - Fácil de testar: mock da interface em vez do use case real
 * - O controller não depende de TypeORM, banco, etc.
 * - Podemos ter múltiplos driving adapters (HTTP, CLI, gRPC) usando a mesma interface
 */
export interface RegisterPatientUseCase {
  execute(dto: RegisterPatientDto): Promise<Either<DomainException, PatientResponseDto>>
}
