import 'reflect-metadata'
import { RegisterPatientUseCaseImpl } from '@modules/patient/application/use-cases/RegisterPatientUseCaseImpl'
import { PatientRepository } from '@modules/patient/application/ports/out/PatientRepository'
import { PatientEventPublisher } from '@modules/patient/application/ports/out/PatientEventPublisher'
import { Patient } from '@modules/patient/domain/Patient'
import { PatientId } from '@modules/patient/domain/PatientId'
import { CPF } from '@modules/patient/domain/CPF'
import { DomainEvent } from '@shared/domain/DomainEvent'
import { RegisterPatientDto } from '@modules/patient/application/dto/RegisterPatientDto'
import { DuplicatePatientException } from '@modules/patient/domain/exceptions/DuplicatePatientException'

// ── Mocks manuais das portas ───────────────────────────────────────────────────
// Não usamos jest.mock() nas interfaces — criamos objetos simples.
// Isso é possível porque as portas são INTERFACES TypeScript.
// A vantagem: sem dependências de mocking libs, fácil de ler.

function makePatientRepository(overrides: Partial<PatientRepository> = {}): PatientRepository {
  return {
    findById: jest.fn().mockResolvedValue(null),
    findByCPF: jest.fn().mockResolvedValue(null),
    findAll: jest.fn().mockResolvedValue([]),
    save: jest.fn().mockResolvedValue(undefined),
    update: jest.fn().mockResolvedValue(undefined),
    delete: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  }
}

function makeEventPublisher(overrides: Partial<PatientEventPublisher> = {}): PatientEventPublisher {
  return {
    publish: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  }
}

const VALID_DTO: RegisterPatientDto = {
  name: 'Maria Oliveira',
  cpf: '529.982.247-25',
  email: 'maria@email.com',
  phone: '11987654321',
  birthDate: '1985-08-20',
  address: {
    street: 'Av. Paulista',
    number: '1000',
    neighborhood: 'Bela Vista',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01310100',
  },
}

describe('RegisterPatientUseCaseImpl', () => {
  function makeUseCase(repoOverrides = {}, publisherOverrides = {}) {
    const repo = makePatientRepository(repoOverrides)
    const publisher = makeEventPublisher(publisherOverrides)
    const useCase = new RegisterPatientUseCaseImpl(repo, publisher)
    return { useCase, repo, publisher }
  }

  it('registra paciente com sucesso quando CPF não existe', async () => {
    const { useCase } = makeUseCase()
    const result = await useCase.execute(VALID_DTO)

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.name).toBe('Maria Oliveira')
      expect(result.value.cpf).toBe('529.982.247-25') // formatado
      expect(result.value.status).toBe('ACTIVE')
    }
  })

  it('chama repository.save() exatamente uma vez', async () => {
    const { useCase, repo } = makeUseCase()
    await useCase.execute(VALID_DTO)
    expect(repo.save).toHaveBeenCalledTimes(1)
  })

  it('publica os domain events após salvar', async () => {
    const { useCase, publisher } = makeUseCase()
    await useCase.execute(VALID_DTO)
    expect(publisher.publish).toHaveBeenCalledTimes(1)

    const [events] = (publisher.publish as jest.Mock).mock.calls[0] as [DomainEvent[]]
    expect(events).toHaveLength(1)
    expect(events[0].eventName).toBe('patient.registered')
  })

  it('retorna Left<DuplicatePatientException> quando CPF já existe', async () => {
    // Simula paciente já cadastrado
    const existingPatient = {} as Patient
    const { useCase } = makeUseCase({
      findByCPF: jest.fn().mockResolvedValue(existingPatient),
    })

    const result = await useCase.execute(VALID_DTO)
    expect(result.isLeft()).toBe(true)
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(DuplicatePatientException)
    }
  })

  it('NÃO chama save() se CPF já existir', async () => {
    const { useCase, repo } = makeUseCase({
      findByCPF: jest.fn().mockResolvedValue({} as Patient),
    })
    await useCase.execute(VALID_DTO)
    expect(repo.save).not.toHaveBeenCalled()
  })

  it('retorna Left se CPF for inválido', async () => {
    const { useCase } = makeUseCase()
    const result = await useCase.execute({ ...VALID_DTO, cpf: '111.111.111-11' })
    expect(result.isLeft()).toBe(true)
  })

  it('retorna Left se email for inválido', async () => {
    const { useCase } = makeUseCase()
    const result = await useCase.execute({ ...VALID_DTO, email: 'nao-e-email' })
    expect(result.isLeft()).toBe(true)
  })

  it('NÃO chama save() se dados do domínio forem inválidos', async () => {
    const { useCase, repo } = makeUseCase()
    await useCase.execute({ ...VALID_DTO, cpf: '000.000.000-00' })
    expect(repo.save).not.toHaveBeenCalled()
  })
})
