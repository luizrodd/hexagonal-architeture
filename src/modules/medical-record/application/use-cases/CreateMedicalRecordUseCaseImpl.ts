import { injectable, inject } from 'tsyringe'
import { Either, left, right } from '@shared/application/Either'
import { DomainException } from '@modules/patient/domain/exceptions/DomainException'
import { Diagnosis } from '@modules/medical-record/domain/Diagnosis'
import { Medication } from '@modules/medical-record/domain/Medication'
import { Prescription } from '@modules/medical-record/domain/Prescription'
import { MedicalRecord } from '@modules/medical-record/domain/MedicalRecord'
import { MedicalRecordRepository } from '../ports/out/MedicalRecordRepository'
import { CreateMedicalRecordDto } from '../dto/CreateMedicalRecordDto'

@injectable()
export class CreateMedicalRecordUseCaseImpl {
  constructor(
    @inject('MedicalRecordRepository')
    private readonly medicalRecordRepository: MedicalRecordRepository,
  ) {}

  async execute(dto: CreateMedicalRecordDto): Promise<Either<DomainException, { id: string }>> {
    // Criar o Aggregate Root
    const recordOrError = MedicalRecord.create({
      patientId: dto.patientId,
      appointmentId: dto.appointmentId,
      anamnesis: dto.anamnesis,
      physicalExam: dto.physicalExam ?? '',
    })
    if (recordOrError.isLeft()) return left(recordOrError.value)
    const record = recordOrError.value

    // Adicionar receita se fornecida
    if (dto.prescription) {
      const diagnosisOrError = Diagnosis.create(
        dto.prescription.diagnosisCode,
        dto.prescription.diagnosisDescription,
      )
      if (diagnosisOrError.isLeft()) return left(diagnosisOrError.value)

      const medications: Medication[] = []
      for (const med of dto.prescription.medications) {
        const medOrError = Medication.create(med)
        if (medOrError.isLeft()) return left(medOrError.value)
        medications.push(medOrError.value)
      }

      const prescription = Prescription.create({
        appointmentId: dto.appointmentId,
        doctorId: dto.doctorId,
        diagnosis: diagnosisOrError.value,
        medications,
        instructions: dto.prescription.instructions,
      })

      record.addPrescription(prescription)
    }

    await this.medicalRecordRepository.save(record)
    record.clearEvents()

    return right({ id: record.id.toValue() })
  }
}
