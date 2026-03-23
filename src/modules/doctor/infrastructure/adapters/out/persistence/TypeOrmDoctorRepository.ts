import { injectable, inject } from 'tsyringe'
import { DataSource, Repository } from 'typeorm'
import { Doctor } from '@modules/doctor/domain/Doctor'
import { DoctorId } from '@modules/doctor/domain/DoctorId'
import { CRM } from '@modules/doctor/domain/CRM'
import { SpecialtyType } from '@modules/doctor/domain/Specialty'
import { DoctorRepository } from '@modules/doctor/application/ports/out/DoctorRepository'
import { DoctorOrmEntity } from './entities/DoctorOrmEntity'
import { DoctorMapper } from './DoctorMapper'

@injectable()
export class TypeOrmDoctorRepository implements DoctorRepository {
  private readonly repo: Repository<DoctorOrmEntity>

  constructor(
    @inject('DataSource')
    private readonly dataSource: DataSource,
  ) {
    this.repo = dataSource.getRepository(DoctorOrmEntity)
  }

  async findById(id: DoctorId): Promise<Doctor | null> {
    const entity = await this.repo.findOne({ where: { id: id.toValue() } })
    if (!entity) return null
    return DoctorMapper.toDomain(entity)
  }

  async findByCRM(crm: CRM): Promise<Doctor | null> {
    const entity = await this.repo.findOne({
      where: { crmNumber: crm.number, crmState: crm.state },
    })
    if (!entity) return null
    return DoctorMapper.toDomain(entity)
  }

  async findBySpecialty(specialty: SpecialtyType): Promise<Doctor[]> {
    const entities = await this.repo.find({ where: { specialty } })
    return entities.map(DoctorMapper.toDomain)
  }

  async findAll(): Promise<Doctor[]> {
    const entities = await this.repo.find({ order: { name: 'ASC' } })
    return entities.map(DoctorMapper.toDomain)
  }

  async save(doctor: Doctor): Promise<void> {
    await this.repo.save(DoctorMapper.toOrmEntity(doctor))
  }

  async update(doctor: Doctor): Promise<void> {
    await this.repo.save(DoctorMapper.toOrmEntity(doctor))
  }
}
