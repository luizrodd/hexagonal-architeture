import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql'
import { TypeOrmPatientRepository } from '@modules/patient/infrastructure/adapters/out/persistence/TypeOrmPatientRepository'
import { Patient } from '@modules/patient/domain/Patient'
import { PatientId } from '@modules/patient/domain/PatientId'
import { CPF } from '@modules/patient/domain/CPF'
import { Email } from '@modules/patient/domain/Email'
import { Phone } from '@modules/patient/domain/Phone'
import { Address } from '@modules/patient/domain/Address'
import { PatientOrmEntity } from '@modules/patient/infrastructure/adapters/out/persistence/entities/PatientOrmEntity'
import { MedicalHistoryOrmEntity } from '@modules/patient/infrastructure/adapters/out/persistence/entities/MedicalHistoryOrmEntity'

/**
 * Teste de integração: PatientRepository
 *
 * Usa @testcontainers/postgresql para subir um PostgreSQL real em Docker.
 * Isso garante que o código SQL gerado pelo TypeORM funciona de verdade.
 *
 * Por que TestContainers em vez de banco em memória?
 * - SQLite se comporta diferente do PostgreSQL (ex: JSONB, UUIDs, timestamps)
 * - TestContainers detecta problemas que mocks jamais detectariam
 * - É o que vai rodar em produção
 */
describe('TypeOrmPatientRepository (integração)', () => {
  let container: StartedPostgreSqlContainer
  let dataSource: DataSource
  let repository: TypeOrmPatientRepository

  function buildPatient(): Patient {
    return Patient.create({
      name: 'Ana Costa',
      cpf: CPF.create('529.982.247-25').value as CPF,
      email: Email.create('ana@email.com').value as Email,
      phone: Phone.create('11987654321').value as Phone,
      birthDate: new Date('1990-01-01'),
      address: Address.create({
        street: 'Rua A',
        number: '1',
        neighborhood: 'Centro',
        city: 'SP',
        state: 'SP',
        zipCode: '01310100',
      }).value as Address,
    }).value as Patient
  }

  beforeAll(async () => {
    // Sobe PostgreSQL via Docker
    container = await new PostgreSqlContainer('postgres:16-alpine').start()

    dataSource = new DataSource({
      type: 'postgres',
      host: container.getHost(),
      port: container.getPort(),
      username: container.getUsername(),
      password: container.getPassword(),
      database: container.getDatabase(),
      entities: [PatientOrmEntity, MedicalHistoryOrmEntity],
      synchronize: true,
      logging: false,
    })

    await dataSource.initialize()
    repository = new TypeOrmPatientRepository(dataSource)
  })

  afterAll(async () => {
    await dataSource.destroy()
    await container.stop()
  })

  afterEach(async () => {
    // Limpa entre testes
    await dataSource.getRepository(PatientOrmEntity).clear()
  })

  it('salva e encontra paciente por ID', async () => {
    const patient = buildPatient()
    await repository.save(patient)

    const found = await repository.findById(patient.patientId)
    expect(found).not.toBeNull()
    expect(found!.name).toBe('Ana Costa')
    expect(found!.cpf.value).toBe('52998224725')
    expect(found!.email.value).toBe('ana@email.com')
  })

  it('encontra paciente por CPF', async () => {
    const patient = buildPatient()
    await repository.save(patient)

    const cpf = CPF.create('529.982.247-25').value as CPF
    const found = await repository.findByCPF(cpf)
    expect(found).not.toBeNull()
    expect(found!.id.toValue()).toBe(patient.id.toValue())
  })

  it('retorna null se paciente não existir', async () => {
    const found = await repository.findById(new PatientId())
    expect(found).toBeNull()
  })

  it('atualiza dados do paciente', async () => {
    const patient = buildPatient()
    await repository.save(patient)

    const novoEmail = Email.create('novo@email.com').value as Email
    patient.updateContactInfo({ email: novoEmail })
    await repository.update(patient)

    const found = await repository.findById(patient.patientId)
    expect(found!.email.value).toBe('novo@email.com')
  })

  it('lista todos os pacientes', async () => {
    await repository.save(buildPatient())

    // Segundo paciente com CPF diferente
    const patient2 = Patient.create({
      name: 'Carlos Mendes',
      cpf: CPF.create('111.444.777-35').value as CPF,
      email: Email.create('carlos@email.com').value as Email,
      phone: Phone.create('11911112222').value as Phone,
      birthDate: new Date('1985-03-10'),
      address: Address.create({
        street: 'Rua B',
        number: '2',
        neighborhood: 'Vila Nova',
        city: 'SP',
        state: 'SP',
        zipCode: '04101300',
      }).value as Address,
    }).value as Patient
    await repository.save(patient2)

    const all = await repository.findAll()
    expect(all).toHaveLength(2)
  })

  it('mantém igualdade de domínio após persistência (round-trip)', async () => {
    const patient = buildPatient()
    await repository.save(patient)
    const loaded = await repository.findById(patient.patientId)

    // O CPF carregado do banco deve ser igual ao original (igualdade de VO)
    expect(loaded!.cpf.equals(patient.cpf)).toBe(true)
    expect(loaded!.email.equals(patient.email)).toBe(true)
  })
})
