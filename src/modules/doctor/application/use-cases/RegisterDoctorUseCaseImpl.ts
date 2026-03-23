import { injectable, inject } from 'tsyringe'
import { Either, left, right } from '@shared/application/Either'
import { DomainException } from '@modules/patient/domain/exceptions/DomainException'
import { CRM } from '@modules/doctor/domain/CRM'
import { Specialty } from '@modules/doctor/domain/Specialty'
import { WorkSchedule, Weekday } from '@modules/doctor/domain/WorkSchedule'
import { Doctor } from '@modules/doctor/domain/Doctor'
import { DuplicateCRMException } from '@modules/doctor/domain/exceptions/DoctorExceptions'
import { Email } from '@modules/patient/domain/Email'
import { Phone } from '@modules/patient/domain/Phone'
import { RegisterDoctorUseCase } from '../ports/in/RegisterDoctorUseCase'
import { DoctorRepository } from '../ports/out/DoctorRepository'
import { RegisterDoctorDto } from '../dto/RegisterDoctorDto'
import { DoctorResponseDto } from '../dto/DoctorResponseDto'
import { DoctorMapper } from '../../infrastructure/adapters/out/persistence/DoctorMapper'

@injectable()
export class RegisterDoctorUseCaseImpl implements RegisterDoctorUseCase {
  constructor(
    @inject('DoctorRepository')
    private readonly doctorRepository: DoctorRepository,
  ) {}

  async execute(dto: RegisterDoctorDto): Promise<Either<DomainException, DoctorResponseDto>> {
    // Criar VOs
    const crmOrError = CRM.create(dto.crm)
    if (crmOrError.isLeft()) return left(crmOrError.value)

    const specialtyOrError = Specialty.create(dto.specialty)
    if (specialtyOrError.isLeft()) return left(specialtyOrError.value)

    const emailOrError = Email.create(dto.email)
    if (emailOrError.isLeft()) return left(emailOrError.value)

    const phoneOrError = Phone.create(dto.phone)
    if (phoneOrError.isLeft()) return left(phoneOrError.value)

    const scheduleOrError = WorkSchedule.create(
      dto.workSchedule.map((w) => ({
        weekday: w.weekday as Weekday,
        startTime: w.startTime,
        endTime: w.endTime,
      })),
    )
    if (scheduleOrError.isLeft()) return left(scheduleOrError.value)

    // Verificar duplicidade de CRM
    const existing = await this.doctorRepository.findByCRM(crmOrError.value)
    if (existing) {
      return left(new DuplicateCRMException(dto.crm))
    }

    // Criar agregado
    const doctorOrError = Doctor.create({
      name: dto.name,
      crm: crmOrError.value,
      specialty: specialtyOrError.value,
      email: emailOrError.value,
      phone: phoneOrError.value,
      workSchedule: scheduleOrError.value,
    })
    if (doctorOrError.isLeft()) return left(doctorOrError.value)

    const doctor = doctorOrError.value
    await this.doctorRepository.save(doctor)
    doctor.clearEvents()

    return right(DoctorMapper.toResponseDto(doctor))
  }
}
