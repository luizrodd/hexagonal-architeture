export interface MedicationDto {
  name: string
  dosage: string
  frequency: string
  duration: string
}

export interface PrescriptionDto {
  diagnosisCode: string
  diagnosisDescription: string
  medications: MedicationDto[]
  instructions: string
}

export interface CreateMedicalRecordDto {
  patientId: string
  appointmentId: string
  doctorId: string
  anamnesis: string
  physicalExam?: string
  prescription?: PrescriptionDto
}
