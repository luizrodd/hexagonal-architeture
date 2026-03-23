import { injectable, inject } from 'tsyringe'
import { Either, left, right } from '@shared/application/Either'
import { DomainException } from '@modules/patient/domain/exceptions/DomainException'
import { CPF } from '@modules/patient/domain/CPF'
import { Email } from '@modules/patient/domain/Email'
import { Phone } from '@modules/patient/domain/Phone'
import { Address } from '@modules/patient/domain/Address'
import { Patient } from '@modules/patient/domain/Patient'
import { DuplicatePatientException } from '@modules/patient/domain/exceptions/DuplicatePatientException'
import { RegisterPatientUseCase } from '../ports/in/RegisterPatientUseCase'
import { PatientRepository } from '../ports/out/PatientRepository'
import { PatientEventPublisher } from '../ports/out/PatientEventPublisher'
import { RegisterPatientDto } from '../dto/RegisterPatientDto'
import { PatientResponseDto } from '../dto/PatientResponseDto'
import { PatientMapper } from '../../infrastructure/adapters/out/persistence/PatientMapper'

/**
 * Use Case: Registrar Paciente
 *
 * Este é o exemplo mais didático da arquitetura hexagonal.
 *
 * === O QUE O USE CASE FAZ ===
 * 1. Converte primitivos (DTO) → Value Objects (Domain)
 * 2. Verifica invariantes de negócio via repositório (CPF duplicado)
 * 3. Cria o Aggregate Root via factory method
 * 4. Persiste via porta de saída (PatientRepository)
 * 5. Publica os Domain Events coletados pelo AR
 * 6. Retorna DTO de resposta
 *
 * === O QUE O USE CASE NÃO FAZ ===
 * - Não sabe nada sobre HTTP (Express, status codes)
 * - Não sabe nada sobre banco de dados (TypeORM, SQL)
 * - Não sabe nada sobre mensageria (RabbitMQ, SQS)
 * - Não lança exceções para erros de negócio (usa Either)
 *
 * === INJEÇÃO DE DEPENDÊNCIA ===
 * @inject('PatientRepository') → resolve pela string token no container
 * A implementação concreta (TypeOrmPatientRepository) é configurada no container.
 */
@injectable()
export class RegisterPatientUseCaseImpl implements RegisterPatientUseCase {
  constructor(
    @inject('PatientRepository')
    private readonly patientRepository: PatientRepository,

    @inject('PatientEventPublisher')
    private readonly eventPublisher: PatientEventPublisher,
  ) {}

  async execute(dto: RegisterPatientDto): Promise<Either<DomainException, PatientResponseDto>> {
    // ── Passo 1: Criar Value Objects (pode falhar) ────────────────────────────
    const cpfOrError = CPF.create(dto.cpf)
    if (cpfOrError.isLeft()) return left(cpfOrError.value)

    const emailOrError = Email.create(dto.email)
    if (emailOrError.isLeft()) return left(emailOrError.value)

    const phoneOrError = Phone.create(dto.phone)
    if (phoneOrError.isLeft()) return left(phoneOrError.value)

    const addressOrError = Address.create(dto.address)
    if (addressOrError.isLeft()) return left(addressOrError.value)

    // ── Passo 2: Verificar duplicidade (regra de negócio via repositório) ─────
    const existingPatient = await this.patientRepository.findByCPF(cpfOrError.value)
    if (existingPatient) {
      return left(new DuplicatePatientException(dto.cpf))
    }

    // ── Passo 3: Criar o Aggregate Root ───────────────────────────────────────
    const patientOrError = Patient.create({
      name: dto.name,
      cpf: cpfOrError.value,
      email: emailOrError.value,
      phone: phoneOrError.value,
      birthDate: new Date(dto.birthDate),
      address: addressOrError.value,
    })

    if (patientOrError.isLeft()) return left(patientOrError.value)
    const patient = patientOrError.value

    // ── Passo 4: Persistir ────────────────────────────────────────────────────
    await this.patientRepository.save(patient)

    // ── Passo 5: Publicar Domain Events (APÓS persistência) ───────────────────
    // Importante: publicamos DEPOIS de salvar para garantir consistência.
    // Se o save falhar, os eventos não são publicados.
    if (patient.domainEvents.length > 0) {
      await this.eventPublisher.publish(patient.domainEvents)
      patient.clearEvents()
    }

    // ── Passo 6: Retornar DTO ─────────────────────────────────────────────────
    return right(PatientMapper.toResponseDto(patient))
  }
}
