import { UniqueEntityId } from '@shared/domain/UniqueEntityId'
import { MedicalRecord } from '@modules/medical-record/domain/MedicalRecord'
import { Prescription } from '@modules/medical-record/domain/Prescription'
import { Diagnosis } from '@modules/medical-record/domain/Diagnosis'
import { Medication } from '@modules/medical-record/domain/Medication'
import { MedicalRecordOrmEntity } from './entities/MedicalRecordOrmEntity'
import { PrescriptionOrmEntity } from './entities/PrescriptionOrmEntity'

export class MedicalRecordMapper {
  static toDomain(raw: MedicalRecordOrmEntity): MedicalRecord {
    const prescriptions = (raw.prescriptions ?? []).map((p) => {
      const diagnosis = Diagnosis.create(p.diagnosisCode, p.diagnosisDescription)
      if (diagnosis.isLeft()) throw new Error(`[MedicalRecordMapper] Diagnosis inválido`)

      const medications = p.medications.map((m) => {
        const med = Medication.create(m)
        if (med.isLeft()) throw new Error(`[MedicalRecordMapper] Medication inválido`)
        return med.value
      })

      return Prescription.reconstitute(
        {
          appointmentId: p.appointmentId,
          doctorId: p.doctorId,
          diagnosis: diagnosis.value,
          medications,
          instructions: p.instructions,
          prescribedAt: p.prescribedAt,
          isActive: p.isActive,
        },
        new UniqueEntityId(p.id),
      )
    })

    return MedicalRecord.reconstitute(
      {
        patientId: raw.patientId,
        appointmentId: raw.appointmentId,
        anamnesis: raw.anamnesis,
        physicalExam: raw.physicalExam ?? '',
        prescriptions,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityId(raw.id),
    )
  }

  static toOrmEntity(record: MedicalRecord): MedicalRecordOrmEntity {
    const orm = new MedicalRecordOrmEntity()
    orm.id = record.id.toValue()
    orm.patientId = record.patientId
    orm.appointmentId = record.appointmentId
    orm.anamnesis = record.anamnesis
    orm.physicalExam = record.physicalExam || null

    orm.prescriptions = record.prescriptions.map((p) => {
      const pOrm = new PrescriptionOrmEntity()
      pOrm.id = p.id.toValue()
      pOrm.medicalRecordId = record.id.toValue()
      pOrm.appointmentId = p.appointmentId
      pOrm.doctorId = p.doctorId
      pOrm.diagnosisCode = p.diagnosis.code
      pOrm.diagnosisDescription = p.diagnosis.description
      pOrm.medications = p.medications.map((m) => ({
        name: m.name,
        dosage: m.dosage,
        frequency: m.frequency,
        duration: m.duration,
      }))
      pOrm.instructions = p.instructions
      pOrm.isActive = p.isActive
      return pOrm
    })

    return orm
  }
}
