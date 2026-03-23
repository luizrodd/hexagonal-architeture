import { injectable, inject } from 'tsyringe'
import { DataSource, Repository } from 'typeorm'
import { MedicalRecord } from '@modules/medical-record/domain/MedicalRecord'
import { MedicalRecordId } from '@modules/medical-record/domain/MedicalRecordId'
import { MedicalRecordRepository } from '@modules/medical-record/application/ports/out/MedicalRecordRepository'
import { MedicalRecordOrmEntity } from './entities/MedicalRecordOrmEntity'
import { MedicalRecordMapper } from './MedicalRecordMapper'

@injectable()
export class TypeOrmMedicalRecordRepository implements MedicalRecordRepository {
  private readonly repo: Repository<MedicalRecordOrmEntity>

  constructor(
    @inject('DataSource')
    private readonly dataSource: DataSource,
  ) {
    this.repo = dataSource.getRepository(MedicalRecordOrmEntity)
  }

  async findById(id: MedicalRecordId): Promise<MedicalRecord | null> {
    const entity = await this.repo.findOne({
      where: { id: id.toValue() },
      relations: ['prescriptions'],
    })
    if (!entity) return null
    return MedicalRecordMapper.toDomain(entity)
  }

  async findByPatient(patientId: string): Promise<MedicalRecord[]> {
    const entities = await this.repo.find({
      where: { patientId },
      relations: ['prescriptions'],
      order: { createdAt: 'DESC' },
    })
    return entities.map(MedicalRecordMapper.toDomain)
  }

  async findByAppointment(appointmentId: string): Promise<MedicalRecord | null> {
    const entity = await this.repo.findOne({
      where: { appointmentId },
      relations: ['prescriptions'],
    })
    if (!entity) return null
    return MedicalRecordMapper.toDomain(entity)
  }

  async save(record: MedicalRecord): Promise<void> {
    await this.repo.save(MedicalRecordMapper.toOrmEntity(record))
  }

  async update(record: MedicalRecord): Promise<void> {
    await this.repo.save(MedicalRecordMapper.toOrmEntity(record))
  }
}
