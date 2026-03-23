import { container } from 'tsyringe'
import { TypeOrmPatientRepository } from '../adapters/out/persistence/TypeOrmPatientRepository'
import { EventEmitterPatientEventPublisher } from '../adapters/out/messaging/EventEmitterPatientEventPublisher'
import { RegisterPatientUseCaseImpl } from '../../application/use-cases/RegisterPatientUseCaseImpl'
import { GetPatientUseCaseImpl } from '../../application/use-cases/GetPatientUseCaseImpl'
import { UpdatePatientUseCaseImpl } from '../../application/use-cases/UpdatePatientUseCaseImpl'

/**
 * PatientContainer — Wiring do Módulo Patient
 *
 * Este é o único arquivo que "conhece tudo" do módulo.
 * Ele liga interfaces (tokens de string) às implementações concretas.
 *
 * === O PRINCÍPIO DA INVERSÃO DE DEPENDÊNCIA EM AÇÃO ===
 *
 * O Use Case depende de 'PatientRepository' (string token → interface).
 * O Container mapeia 'PatientRepository' → TypeOrmPatientRepository.
 *
 * Para usar banco em memória nos testes:
 * container.register('PatientRepository', { useClass: InMemoryPatientRepository })
 *
 * Para trocar de TypeORM para Prisma:
 * container.register('PatientRepository', { useClass: PrismaPatientRepository })
 *
 * O Use Case não muda. O Domínio não muda. Apenas o container.
 */
export function registerPatientDependencies(): void {
  // ── Driven Adapters (Repositório e Publisher) ─────────────────────────────
  container.registerSingleton<TypeOrmPatientRepository>(
    'PatientRepository',
    TypeOrmPatientRepository,
  )

  container.registerSingleton<EventEmitterPatientEventPublisher>(
    'PatientEventPublisher',
    EventEmitterPatientEventPublisher,
  )

  // ── Use Cases (Driving Ports — implementações) ────────────────────────────
  container.registerSingleton<RegisterPatientUseCaseImpl>(
    'RegisterPatientUseCase',
    RegisterPatientUseCaseImpl,
  )

  container.registerSingleton<GetPatientUseCaseImpl>(
    'GetPatientUseCase',
    GetPatientUseCaseImpl,
  )

  container.registerSingleton<UpdatePatientUseCaseImpl>(
    'UpdatePatientUseCase',
    UpdatePatientUseCaseImpl,
  )
}
