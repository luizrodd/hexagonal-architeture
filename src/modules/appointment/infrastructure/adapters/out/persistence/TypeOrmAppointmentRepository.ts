import { injectable, inject } from 'tsyringe'
import { DataSource, Repository, Between } from 'typeorm'
import { Appointment } from '@modules/appointment/domain/Appointment'
import { AppointmentId } from '@modules/appointment/domain/AppointmentId'
import { AppointmentRepository } from '@modules/appointment/application/ports/out/AppointmentRepository'
import { AppointmentOrmEntity } from './entities/AppointmentOrmEntity'
import { AppointmentMapper } from './AppointmentMapper'

@injectable()
export class TypeOrmAppointmentRepository implements AppointmentRepository {
  private readonly repo: Repository<AppointmentOrmEntity>

  constructor(
    @inject('DataSource')
    private readonly dataSource: DataSource,
  ) {
    this.repo = dataSource.getRepository(AppointmentOrmEntity)
  }

  async findById(id: AppointmentId): Promise<Appointment | null> {
    const entity = await this.repo.findOne({ where: { id: id.toValue() } })
    if (!entity) return null
    return AppointmentMapper.toDomain(entity)
  }

  async findByDoctorAndPeriod(
    doctorId: string,
    start: Date,
    end: Date,
  ): Promise<Appointment[]> {
    const entities = await this.repo.find({
      where: {
        doctorId,
        slotStart: Between(start, end),
      },
    })
    return entities.map(AppointmentMapper.toDomain)
  }

  async findByPatient(patientId: string): Promise<Appointment[]> {
    const entities = await this.repo.find({
      where: { patientId },
      order: { slotStart: 'DESC' },
    })
    return entities.map(AppointmentMapper.toDomain)
  }

  async save(appointment: Appointment): Promise<void> {
    await this.repo.save(AppointmentMapper.toOrmEntity(appointment))
  }

  async update(appointment: Appointment): Promise<void> {
    await this.repo.save(AppointmentMapper.toOrmEntity(appointment))
  }
}
