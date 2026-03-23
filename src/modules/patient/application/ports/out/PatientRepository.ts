import { Patient } from '@modules/patient/domain/Patient'
import { PatientId } from '@modules/patient/domain/PatientId'
import { CPF } from '@modules/patient/domain/CPF'

/**
 * Driven Port: PatientRepository
 *
 * Esta interface é definida na camada de APLICAÇÃO,
 * mas implementada na camada de INFRAESTRUTURA.
 *
 * Isso é a inversão de dependência (DIP):
 * - A aplicação define O QUE precisa (esta interface)
 * - A infraestrutura entrega COMO (TypeOrmPatientRepository)
 *
 * Se amanhã quisermos trocar TypeORM por Prisma,
 * só criamos uma nova implementação desta interface.
 * O use case não muda.
 */
export interface PatientRepository {
  findById(id: PatientId): Promise<Patient | null>
  findByCPF(cpf: CPF): Promise<Patient | null>
  findAll(): Promise<Patient[]>
  save(patient: Patient): Promise<void>
  update(patient: Patient): Promise<void>
  delete(id: PatientId): Promise<void>
}
