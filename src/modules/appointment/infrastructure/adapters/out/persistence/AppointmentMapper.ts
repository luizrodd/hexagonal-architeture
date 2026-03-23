import { UniqueEntityId } from '@shared/domain/UniqueEntityId'
import { Appointment } from '@modules/appointment/domain/Appointment'
import { TimeSlot } from '@modules/appointment/domain/TimeSlot'
import { AppointmentStatus } from '@modules/appointment/domain/AppointmentStatus'
import { AppointmentResponseDto } from '@modules/appointment/application/dto/AppointmentResponseDto'
import { AppointmentOrmEntity } from './entities/AppointmentOrmEntity'

export class AppointmentMapper {
  static toDomain(raw: AppointmentOrmEntity): Appointment {
    const slotOrError = TimeSlot.create(raw.slotStart, raw.slotEnd)
    if (slotOrError.isLeft()) {
      throw new Error(`[AppointmentMapper] TimeSlot inválido no banco: ${raw.id}`)
    }

    return Appointment.reconstitute(
      {
        patientId: raw.patientId,
        doctorId: raw.doctorId,
        timeSlot: slotOrError.value,
        status: AppointmentStatus.reconstitute(raw.status),
        reason: raw.reason,
        notes: raw.notes ?? undefined,
        cancelReason: raw.cancelReason ?? undefined,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityId(raw.id),
    )
  }

  static toOrmEntity(appointment: Appointment): AppointmentOrmEntity {
    const orm = new AppointmentOrmEntity()
    orm.id = appointment.id.toValue()
    orm.patientId = appointment.patientId
    orm.doctorId = appointment.doctorId
    orm.slotStart = appointment.timeSlot.start
    orm.slotEnd = appointment.timeSlot.end
    orm.status = appointment.status.value
    orm.reason = appointment.reason
    orm.notes = appointment.notes ?? null
    orm.cancelReason = appointment.cancelReason ?? null
    return orm
  }

  static toResponseDto(appointment: Appointment): AppointmentResponseDto {
    return {
      id: appointment.id.toValue(),
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      timeSlot: {
        start: appointment.timeSlot.start.toISOString(),
        end: appointment.timeSlot.end.toISOString(),
        durationMinutes: appointment.timeSlot.durationMinutes,
      },
      status: appointment.status.value,
      reason: appointment.reason,
      notes: appointment.notes,
      cancelReason: appointment.cancelReason,
      createdAt: appointment.createdAt.toISOString(),
      updatedAt: appointment.updatedAt.toISOString(),
    }
  }
}
