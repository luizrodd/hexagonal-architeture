import 'reflect-metadata'
import request from 'supertest'
import { Express } from 'express'
import { DataSource } from 'typeorm'
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql'
import { setupContainer } from '@shared/infrastructure/container'
import { createApp } from '@shared/infrastructure/http/Server'
import { PatientOrmEntity } from '@modules/patient/infrastructure/adapters/out/persistence/entities/PatientOrmEntity'
import { MedicalHistoryOrmEntity } from '@modules/patient/infrastructure/adapters/out/persistence/entities/MedicalHistoryOrmEntity'

/**
 * Teste de integração HTTP: Patient endpoints
 *
 * Testa o stack completo:
 * HTTP Request → Controller → Use Case → Domain → Repository → PostgreSQL
 *
 * Este é o teste que verifica que todas as camadas trabalham juntas.
 */
describe('POST /api/patients (integração HTTP)', () => {
  let pgContainer: StartedPostgreSqlContainer
  let dataSource: DataSource
  let app: Express

  const VALID_PATIENT = {
    name: 'Fernanda Lima',
    cpf: '529.982.247-25',
    email: 'fernanda@email.com',
    phone: '11987654321',
    birthDate: '1992-07-10',
    address: {
      street: 'Rua das Palmeiras',
      number: '200',
      neighborhood: 'Jardins',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01452001',
    },
  }

  beforeAll(async () => {
    pgContainer = await new PostgreSqlContainer('postgres:16-alpine').start()

    dataSource = new DataSource({
      type: 'postgres',
      host: pgContainer.getHost(),
      port: pgContainer.getPort(),
      username: pgContainer.getUsername(),
      password: pgContainer.getPassword(),
      database: pgContainer.getDatabase(),
      entities: [PatientOrmEntity, MedicalHistoryOrmEntity],
      synchronize: true,
      logging: false,
    })

    await dataSource.initialize()
    setupContainer(dataSource)
    app = createApp()
  })

  afterAll(async () => {
    await dataSource.destroy()
    await pgContainer.stop()
  })

  afterEach(async () => {
    await dataSource.getRepository(PatientOrmEntity).clear()
  })

  it('retorna 201 e dados do paciente ao cadastrar com sucesso', async () => {
    const res = await request(app)
      .post('/api/patients')
      .send(VALID_PATIENT)

    expect(res.status).toBe(201)
    expect(res.body.id).toBeDefined()
    expect(res.body.name).toBe('Fernanda Lima')
    expect(res.body.cpf).toBe('529.982.247-25') // formatado
    expect(res.body.status).toBe('ACTIVE')
  })

  it('retorna 409 ao tentar cadastrar CPF duplicado', async () => {
    // Primeiro cadastro
    await request(app).post('/api/patients').send(VALID_PATIENT)

    // Segundo cadastro com mesmo CPF
    const res = await request(app)
      .post('/api/patients')
      .send({ ...VALID_PATIENT, email: 'outro@email.com' })

    expect(res.status).toBe(409)
    expect(res.body.error.type).toBe('DuplicatePatientException')
  })

  it('retorna 422 para CPF inválido', async () => {
    const res = await request(app)
      .post('/api/patients')
      .send({ ...VALID_PATIENT, cpf: '111.111.111-11' })

    expect(res.status).toBe(422)
  })

  it('retorna 400 para requisição malformada (Zod)', async () => {
    const res = await request(app)
      .post('/api/patients')
      .send({ name: 'X' }) // faltam campos obrigatórios

    expect(res.status).toBe(400)
    expect(res.body.error.type).toBe('ValidationError')
    expect(res.body.error.details).toBeDefined()
  })

  it('GET /api/patients/:id retorna 404 para ID inexistente', async () => {
    const res = await request(app)
      .get('/api/patients/00000000-0000-0000-0000-000000000000')

    expect(res.status).toBe(404)
  })

  it('GET /api/patients/:id retorna paciente cadastrado', async () => {
    const postRes = await request(app).post('/api/patients').send(VALID_PATIENT)
    const { id } = postRes.body

    const getRes = await request(app).get(`/api/patients/${id}`)
    expect(getRes.status).toBe(200)
    expect(getRes.body.id).toBe(id)
    expect(getRes.body.name).toBe('Fernanda Lima')
  })
})
