import { Request, Response } from 'express'
import { injectable, inject } from 'tsyringe'
import { z } from 'zod'
import { ScheduleAppointmentUseCaseImpl } from '@modules/appointment/application/use-cases/ScheduleAppointmentUseCaseImpl'
import { CancelAppointmentUseCaseImpl } from '@modules/appointment/application/use-cases/CancelAppointmentUseCaseImpl'

const scheduleSchema = z.object({
  patientId: z.string().uuid(),
  doctorId: z.string().uuid(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  reason: z.string().min(5),
})

const cancelSchema = z.object({
  reason: z.string().min(5),
  cancelledBy: z.enum(['patient', 'doctor', 'system']),
})

@injectable()
export class AppointmentController {
  constructor(
    @inject('ScheduleAppointmentUseCase')
    private readonly scheduleUseCase: ScheduleAppointmentUseCaseImpl,

    @inject('CancelAppointmentUseCase')
    private readonly cancelUseCase: CancelAppointmentUseCaseImpl,
  ) {}

  async schedule(req: Request, res: Response): Promise<void> {
    const dto = scheduleSchema.parse(req.body)
    const result = await this.scheduleUseCase.execute(dto)
    if (result.isLeft()) throw result.value
    res.status(201).json(result.value)
  }

  async cancel(req: Request, res: Response): Promise<void> {
    const { id } = req.params
    const { reason, cancelledBy } = cancelSchema.parse(req.body)
    const result = await this.cancelUseCase.execute(id, reason, cancelledBy)
    if (result.isLeft()) throw result.value
    res.status(200).json(result.value)
  }
}
