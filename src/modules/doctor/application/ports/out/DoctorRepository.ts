import { Doctor } from '@modules/doctor/domain/Doctor'
import { DoctorId } from '@modules/doctor/domain/DoctorId'
import { CRM } from '@modules/doctor/domain/CRM'
import { SpecialtyType } from '@modules/doctor/domain/Specialty'

export interface DoctorRepository {
  findById(id: DoctorId): Promise<Doctor | null>
  findByCRM(crm: CRM): Promise<Doctor | null>
  findBySpecialty(specialty: SpecialtyType): Promise<Doctor[]>
  findAll(): Promise<Doctor[]>
  save(doctor: Doctor): Promise<void>
  update(doctor: Doctor): Promise<void>
}
