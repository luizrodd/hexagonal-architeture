import { Request, Response } from 'express'
import { injectable, inject } from 'tsyringe'
import { z } from 'zod'
import { RegisterDoctorUseCase } from '@modules/doctor/application/ports/in/RegisterDoctorUseCase'

const weekdayEnum = z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'])
const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/

const registerDoctorSchema = z.object({
  name: z.string().min(2),
  crm: z.string().min(1),
  specialty: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  workSchedule: z.array(z.object({
    weekday: weekdayEnum,
    startTime: z.string().regex(timePattern),
    endTime: z.string().regex(timePattern),
  })).min(1),
})

@injectable()
export class DoctorController {
  constructor(
    @inject('RegisterDoctorUseCase')
    private readonly registerDoctor: RegisterDoctorUseCase,
  ) {}

  async register(req: Request, res: Response): Promise<void> {
    const dto = registerDoctorSchema.parse(req.body)
    const result = await this.registerDoctor.execute(dto)

    if (result.isLeft()) throw result.value

    res.status(201).json(result.value)
  }
}
