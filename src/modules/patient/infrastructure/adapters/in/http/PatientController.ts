import { Request, Response } from 'express'
import { injectable, inject } from 'tsyringe'
import { RegisterPatientUseCase } from '@modules/patient/application/ports/in/RegisterPatientUseCase'
import { GetPatientUseCase } from '@modules/patient/application/ports/in/GetPatientUseCase'
import { UpdatePatientUseCase } from '@modules/patient/application/ports/in/UpdatePatientUseCase'
import { registerPatientSchema, updatePatientSchema } from './schemas/PatientSchemas'

/**
 * Driving Adapter: PatientController
 *
 * O controller é um adaptador entre o protocolo HTTP e os Use Cases.
 *
 * Responsabilidades do controller (e APENAS estas):
 * 1. Parsear e validar a requisição HTTP (via Zod)
 * 2. Chamar o Use Case correto
 * 3. Mapear o resultado (Either) para resposta HTTP
 *
 * === O QUE O CONTROLLER NÃO FAZ ===
 * - Não tem lógica de negócio
 * - Não conhece entidades de domínio
 * - Não acessa banco de dados
 * - Não sabe se o use case usa TypeORM ou MongoDB
 *
 * === THIN CONTROLLER ===
 * O controller é intencionalmente "thin" (magro).
 * Toda lógica fica no Use Case.
 * Isso facilita testes e troca de protocolos (HTTP → gRPC).
 */
@injectable()
export class PatientController {
  constructor(
    @inject('RegisterPatientUseCase')
    private readonly registerPatient: RegisterPatientUseCase,

    @inject('GetPatientUseCase')
    private readonly getPatient: GetPatientUseCase,

    @inject('UpdatePatientUseCase')
    private readonly updatePatient: UpdatePatientUseCase,
  ) {}

  async register(req: Request, res: Response): Promise<void> {
    // Validação do schema (formato da requisição)
    const dto = registerPatientSchema.parse(req.body)

    // Delega para o use case
    const result = await this.registerPatient.execute(dto)

    if (result.isLeft()) {
      // O errorHandler middleware captura a exceção e transforma em resposta HTTP
      throw result.value
    }

    res.status(201).json(result.value)
  }

  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params
    const result = await this.getPatient.execute(id)

    if (result.isLeft()) {
      throw result.value
    }

    res.status(200).json(result.value)
  }

  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params
    const dto = updatePatientSchema.parse(req.body)

    const result = await this.updatePatient.execute(id, dto)

    if (result.isLeft()) {
      throw result.value
    }

    res.status(200).json(result.value)
  }

  async listAll(req: Request, res: Response): Promise<void> {
    // Para simplicidade didática, este endpoint não usa use case separado
    // Em produção, teria ListPatientsUseCase com paginação
    res.status(200).json({ message: 'Implemente ListPatientsUseCase com paginação' })
  }
}
