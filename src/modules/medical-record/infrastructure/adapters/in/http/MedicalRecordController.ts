import { Request, Response } from 'express'
import { injectable, inject } from 'tsyringe'
import { z } from 'zod'
import { CreateMedicalRecordUseCaseImpl } from '@modules/medical-record/application/use-cases/CreateMedicalRecordUseCaseImpl'

const createSchema = z.object({
  patientId: z.string().uuid(),
  appointmentId: z.string().uuid(),
  doctorId: z.string().uuid(),
  anamnesis: z.string().min(10),
  physicalExam: z.string().optional(),
  prescription: z.object({
    diagnosisCode: z.string().min(1),
    diagnosisDescription: z.string().min(1),
    medications: z.array(z.object({
      name: z.string().min(1),
      dosage: z.string().min(1),
      frequency: z.string(),
      duration: z.string(),
    })),
    instructions: z.string(),
  }).optional(),
})

@injectable()
export class MedicalRecordController {
  constructor(
    @inject('CreateMedicalRecordUseCase')
    private readonly createUseCase: CreateMedicalRecordUseCaseImpl,
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    const dto = createSchema.parse(req.body)
    const result = await this.createUseCase.execute(dto)
    if (result.isLeft()) throw result.value
    res.status(201).json(result.value)
  }
}
