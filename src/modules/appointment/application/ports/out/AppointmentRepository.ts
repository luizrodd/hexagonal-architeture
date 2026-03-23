import { Appointment } from '@modules/appointment/domain/Appointment'
import { AppointmentId } from '@modules/appointment/domain/AppointmentId'

export interface AppointmentRepository {
  findById(id: AppointmentId): Promise<Appointment | null>
  findByDoctorAndPeriod(doctorId: string, start: Date, end: Date): Promise<Appointment[]>
  findByPatient(patientId: string): Promise<Appointment[]>
  save(appointment: Appointment): Promise<void>
  update(appointment: Appointment): Promise<void>
}
