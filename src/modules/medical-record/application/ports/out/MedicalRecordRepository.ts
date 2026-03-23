import { MedicalRecord } from '@modules/medical-record/domain/MedicalRecord'
import { MedicalRecordId } from '@modules/medical-record/domain/MedicalRecordId'

export interface MedicalRecordRepository {
  findById(id: MedicalRecordId): Promise<MedicalRecord | null>
  findByPatient(patientId: string): Promise<MedicalRecord[]>
  findByAppointment(appointmentId: string): Promise<MedicalRecord | null>
  save(record: MedicalRecord): Promise<void>
  update(record: MedicalRecord): Promise<void>
}
