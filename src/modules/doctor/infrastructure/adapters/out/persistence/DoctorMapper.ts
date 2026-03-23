import { UniqueEntityId } from '@shared/domain/UniqueEntityId'
import { Doctor, DoctorStatus } from '@modules/doctor/domain/Doctor'
import { CRM } from '@modules/doctor/domain/CRM'
import { Specialty, SpecialtyType } from '@modules/doctor/domain/Specialty'
import { WorkSchedule, Weekday } from '@modules/doctor/domain/WorkSchedule'
import { Email } from '@modules/patient/domain/Email'
import { Phone } from '@modules/patient/domain/Phone'
import { DoctorResponseDto } from '@modules/doctor/application/dto/DoctorResponseDto'
import { DoctorOrmEntity } from './entities/DoctorOrmEntity'

export class DoctorMapper {
  static toDomain(raw: DoctorOrmEntity): Doctor {
    const crm = CRM.create(`CRM/${raw.crmState}${raw.crmNumber}`)
    const specialty = Specialty.create(raw.specialty)
    const email = Email.create(raw.email)
    const phone = Phone.create(raw.phone)
    const schedule = WorkSchedule.create(
      raw.workSchedule.map((w) => ({
        weekday: w.weekday as Weekday,
        startTime: w.startTime,
        endTime: w.endTime,
      })),
    )

    if (crm.isLeft()) throw new Error(`[DoctorMapper] CRM inválido no banco: ${raw.crmNumber}`)
    if (specialty.isLeft()) throw new Error(`[DoctorMapper] Specialty inválida: ${raw.specialty}`)
    if (email.isLeft()) throw new Error(`[DoctorMapper] Email inválido: ${raw.email}`)
    if (phone.isLeft()) throw new Error(`[DoctorMapper] Phone inválido: ${raw.phone}`)
    if (schedule.isLeft()) throw new Error(`[DoctorMapper] WorkSchedule inválido`)

    return Doctor.reconstitute(
      {
        name: raw.name,
        crm: crm.value,
        specialty: specialty.value,
        email: email.value,
        phone: phone.value,
        workSchedule: schedule.value,
        status: raw.status as DoctorStatus,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityId(raw.id),
    )
  }

  static toOrmEntity(doctor: Doctor): DoctorOrmEntity {
    const orm = new DoctorOrmEntity()
    orm.id = doctor.id.toValue()
    orm.name = doctor.name
    orm.crmNumber = doctor.crm.number
    orm.crmState = doctor.crm.state
    orm.specialty = doctor.specialty.type
    orm.email = doctor.email.value
    orm.phone = doctor.phone.value
    orm.workSchedule = doctor.workSchedule.windows
    orm.status = doctor.status
    return orm
  }

  static toResponseDto(doctor: Doctor): DoctorResponseDto {
    return {
      id: doctor.id.toValue(),
      name: doctor.name,
      crm: doctor.crm.formatted,
      specialty: doctor.specialty.type,
      specialtyLabel: doctor.specialty.label,
      email: doctor.email.value,
      phone: doctor.phone.formatted,
      workSchedule: doctor.workSchedule.windows,
      status: doctor.status,
      createdAt: doctor.createdAt.toISOString(),
      updatedAt: doctor.updatedAt.toISOString(),
    }
  }
}
