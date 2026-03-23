import { injectable, inject } from 'tsyringe'
import { DataSource, Repository } from 'typeorm'
import { Patient } from '@modules/patient/domain/Patient'
import { PatientId } from '@modules/patient/domain/PatientId'
import { CPF } from '@modules/patient/domain/CPF'
import { PatientRepository } from '@modules/patient/application/ports/out/PatientRepository'
import { PatientOrmEntity } from './entities/PatientOrmEntity'
import { PatientMapper } from './PatientMapper'

/**
 * Driven Adapter: TypeOrmPatientRepository
 *
 * Implementa a porta PatientRepository usando TypeORM + PostgreSQL.
 *
 * Responsabilidades:
 * 1. Traduzir operações do domínio em queries SQL (via TypeORM)
 * 2. Usar o Mapper para converter entre Domain Object e ORM Entity
 *
 * O Use Case não sabe que este arquivo existe.
 * Ele só conhece a interface PatientRepository.
 *
 * === SWAP DE BANCO ===
 * Para trocar para Prisma:
 * 1. Criar PrismaPatientRepository implementando PatientRepository
 * 2. Alterar o container para injetar a nova implementação
 * 3. Zero mudanças no domínio ou nos use cases
 */
@injectable()
export class TypeOrmPatientRepository implements PatientRepository {
  private readonly repo: Repository<PatientOrmEntity>

  constructor(
    @inject('DataSource')
    private readonly dataSource: DataSource,
  ) {
    this.repo = dataSource.getRepository(PatientOrmEntity)
  }

  async findById(id: PatientId): Promise<Patient | null> {
    const entity = await this.repo.findOne({
      where: { id: id.toValue() },
      relations: ['medicalHistory'],
    })

    if (!entity) return null
    return PatientMapper.toDomain(entity)
  }

  async findByCPF(cpf: CPF): Promise<Patient | null> {
    const entity = await this.repo.findOne({
      where: { cpf: cpf.value },
      relations: ['medicalHistory'],
    })

    if (!entity) return null
    return PatientMapper.toDomain(entity)
  }

  async findAll(): Promise<Patient[]> {
    const entities = await this.repo.find({
      relations: ['medicalHistory'],
      order: { createdAt: 'DESC' },
    })

    return entities.map(PatientMapper.toDomain)
  }

  async save(patient: Patient): Promise<void> {
    const ormEntity = PatientMapper.toOrmEntity(patient)
    await this.repo.save(ormEntity)
  }

  async update(patient: Patient): Promise<void> {
    const ormEntity = PatientMapper.toOrmEntity(patient)
    await this.repo.save(ormEntity)
  }

  async delete(id: PatientId): Promise<void> {
    await this.repo.delete({ id: id.toValue() })
  }
}
