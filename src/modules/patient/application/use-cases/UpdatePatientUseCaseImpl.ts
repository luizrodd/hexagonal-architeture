import { injectable, inject } from 'tsyringe'
import { Either, left, right } from '@shared/application/Either'
import { DomainException } from '@modules/patient/domain/exceptions/DomainException'
import { PatientId } from '@modules/patient/domain/PatientId'
import { PatientNotFoundException } from '@modules/patient/domain/exceptions/PatientNotFoundException'
import { Email } from '@modules/patient/domain/Email'
import { Phone } from '@modules/patient/domain/Phone'
import { Address } from '@modules/patient/domain/Address'
import { UpdatePatientUseCase } from '../ports/in/UpdatePatientUseCase'
import { PatientRepository } from '../ports/out/PatientRepository'
import { PatientEventPublisher } from '../ports/out/PatientEventPublisher'
import { UpdatePatientDto } from '../dto/UpdatePatientDto'
import { PatientResponseDto } from '../dto/PatientResponseDto'
import { PatientMapper } from '../../infrastructure/adapters/out/persistence/PatientMapper'

@injectable()
export class UpdatePatientUseCaseImpl implements UpdatePatientUseCase {
  constructor(
    @inject('PatientRepository')
    private readonly patientRepository: PatientRepository,

    @inject('PatientEventPublisher')
    private readonly eventPublisher: PatientEventPublisher,
  ) {}

  async execute(patientId: string, dto: UpdatePatientDto): Promise<Either<DomainException, PatientResponseDto>> {
    // Carregar o agregado existente
    const id = new PatientId(patientId)
    const patient = await this.patientRepository.findById(id)

    if (!patient) {
      return left(new PatientNotFoundException(patientId))
    }

    // Criar VOs apenas para os campos fornecidos
    const updates: Parameters<typeof patient.updateContactInfo>[0] = {}

    if (dto.email !== undefined) {
      const emailOrError = Email.create(dto.email)
      if (emailOrError.isLeft()) return left(emailOrError.value)
      updates.email = emailOrError.value
    }

    if (dto.phone !== undefined) {
      const phoneOrError = Phone.create(dto.phone)
      if (phoneOrError.isLeft()) return left(phoneOrError.value)
      updates.phone = phoneOrError.value
    }

    if (dto.address !== undefined) {
      const addressOrError = Address.create(dto.address)
      if (addressOrError.isLeft()) return left(addressOrError.value)
      updates.address = addressOrError.value
    }

    // Delegar a mutação ao Aggregate Root
    patient.updateContactInfo(updates)

    // Persistir
    await this.patientRepository.update(patient)

    // Publicar eventos se houver
    if (patient.domainEvents.length > 0) {
      await this.eventPublisher.publish(patient.domainEvents)
      patient.clearEvents()
    }

    return right(PatientMapper.toResponseDto(patient))
  }
}
