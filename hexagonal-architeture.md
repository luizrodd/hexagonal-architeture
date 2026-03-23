# Arquitetura Hexagonal — Clínica Médica

Projeto completo de estudo com **domínio rico**, cobrindo todos os conceitos da Arquitetura Hexagonal (Ports & Adapters) em TypeScript.

---

## O que é Arquitetura Hexagonal?

```
        [Driving Adapters]               [Driven Adapters]
         (eles nos chamam)               (nós os chamamos)

  HTTP (Express) ──────┐           ┌──── PostgreSQL (TypeORM)
  Testes ──────────────┤  DOMÍNIO  ├──── RabbitMQ (EventEmitter2)
  CLI ─────────────────┤     +     ├──── Email (Nodemailer)
  gRPC ────────────────┤  APP      │
                       └───────────┘

  Ports   = Interfaces definidas DENTRO do núcleo
  Adapters = Implementações FORA do núcleo
```

**A regra de dependência**: todas as setas apontam para dentro.
O domínio não conhece nada da infraestrutura.

---

## Estrutura de Camadas

```
src/
├── shared/             # Primitivas reutilizáveis entre módulos
│   ├── domain/         # Entity, AggregateRoot, ValueObject, DomainEvent
│   └── application/    # Either, UseCase
│
└── modules/
    ├── patient/        # Módulo de Pacientes (mais completo, referência)
    │   ├── domain/         ← DOMÍNIO PURO (zero dependências externas)
    │   ├── application/    ← Ports (interfaces) + Use Cases
    │   └── infrastructure/ ← Adapters (TypeORM, Express, EventEmitter)
    │
    ├── doctor/         # Módulo de Médicos
    ├── appointment/    # Módulo de Consultas (mais complexo, state machine)
    └── medical-record/ # Módulo de Prontuários
```

---

## Conceitos do Domínio Rico

### Value Object
Imutável, sem identidade, igualdade por estrutura.

```typescript
// CPF só existe se for válido — construtor privado + factory
const cpfOrError = CPF.create('529.982.247-25')
if (cpfOrError.isLeft()) {
  // CPF inválido — tratado sem throw
}
const cpf = cpfOrError.value // CPF garantidamente válido
```

**VOs neste projeto**: `CPF`, `Email`, `Phone`, `Address`, `TimeSlot`, `AppointmentStatus`, `CRM`, `Specialty`, `WorkSchedule`, `Diagnosis`, `Medication`

### Entity
Tem identidade própria (ID), mas não é raiz de transação.

```typescript
// MedicalHistory é Entity filha — existe dentro de Patient
// Nunca é carregada/salva diretamente pelo repositório
class MedicalHistory extends Entity<MedicalHistoryProps> { ... }
```

**Entities filhas**: `MedicalHistory` (dentro de Patient), `Prescription` (dentro de MedicalRecord)

### Aggregate Root
Fronteira de consistência. Repositório só opera em ARs.

```typescript
// Patient.create() — novo paciente (valida + emite evento)
// Patient.reconstitute() — rehidrata do banco (sem eventos)
const patientOrError = Patient.create({ name, cpf, email, ... })
```

**Aggregate Roots**: `Patient`, `Doctor`, `Appointment`, `MedicalRecord`

### Domain Events
Captados pelo AR, publicados pela Aplicação **após** persistência.

```typescript
// No AR:
this.addDomainEvent(new PatientRegistered(this.id.toValue(), ...))

// No Use Case:
await this.patientRepository.save(patient)            // persiste primeiro
await this.eventPublisher.publish(patient.domainEvents) // depois publica
patient.clearEvents()
```

**Eventos**: `PatientRegistered`, `PatientUpdated`, `DoctorRegistered`, `AppointmentScheduled`, `AppointmentConfirmed`, `AppointmentCancelled`, `AppointmentCompleted`, `MedicalRecordCreated`, `PrescriptionAdded`

### Domain Service
Lógica que envolve múltiplos AGs, sem infraestrutura.

```typescript
// AppointmentSchedulingService NÃO chama repositório
// O Use Case busca os dados e passa para o Domain Service
const isAvailable = this.schedulingService.isSlotAvailable(
  doctorId,
  timeSlot,
  existingAppointments, // carregados pelo Use Case via repositório
)
```

### Either<L, R>
Erros recuperáveis retornam `Left`, não lançam exceções.

```typescript
const result: Either<DomainException, PatientResponseDto> =
  await registerPatient.execute(dto)

if (result.isLeft()) {
  throw result.value // o errorHandler mapeia para HTTP status
}
res.status(201).json(result.value)
```

---

## Ports & Adapters

### Driving Ports (in/) — O que a aplicação oferece
```typescript
// Definida em application/ports/in/
export interface RegisterPatientUseCase {
  execute(dto: RegisterPatientDto): Promise<Either<DomainException, PatientResponseDto>>
}
// Implementada por RegisterPatientUseCaseImpl
// Chamada pelo PatientController (HTTP adapter)
```

### Driven Ports (out/) — O que a aplicação precisa
```typescript
// Definida em application/ports/out/
export interface PatientRepository {
  findById(id: PatientId): Promise<Patient | null>
  save(patient: Patient): Promise<void>
}
// Implementada por TypeOrmPatientRepository (infraestrutura)
```

### Mapper — A ponte entre mundos
```typescript
PatientMapper.toDomain(ormEntity)    // ORM Entity → Domain Object
PatientMapper.toOrmEntity(patient)   // Domain Object → ORM Entity
PatientMapper.toResponseDto(patient) // Domain Object → Response DTO
```

---

## Regra de Dependências

```
Domain      → não importa nada externo
Application → importa apenas Domain
Infrastructure → importa Application + Domain + pacotes externos
DI Container → importa tudo (ponto de fiação)
```

**Teste de sanidade**: se você deletar todo `src/modules/*/infrastructure/`,
o código de `domain/` e `application/` ainda deve compilar sem erros.

---

## Hierarquia de Exceções → HTTP Status

```
DomainException (base)
├── ValidationException   → HTTP 422  (CPF inválido, Email inválido)
├── ConflictException     → HTTP 409  (CPF duplicado, horário ocupado)
├── NotFoundException     → HTTP 404  (paciente não encontrado)
└── InvalidStateException → HTTP 422  (transição de estado inválida)

ZodError (validação do schema HTTP) → HTTP 400
```

O mapeamento ocorre exclusivamente em `src/shared/infrastructure/http/middlewares/errorHandler.ts`.

---

## Como executar

```bash
# 1. Instalar dependências
npm install

# 2. Subir banco e mensageria
docker-compose up -d

# 3. Copiar variáveis de ambiente
cp .env.example .env

# 4. Iniciar em desenvolvimento
npm run dev

# 5. Testes unitários (sem banco)
npm run test:unit

# 6. Testes de integração (sobe PostgreSQL via Docker automaticamente)
npm run test:integration
```

---

## Exemplos de requisições

### Cadastrar paciente
```http
POST /api/patients
Content-Type: application/json

{
  "name": "João da Silva",
  "cpf": "529.982.247-25",
  "email": "joao@email.com",
  "phone": "11987654321",
  "birthDate": "1990-05-15",
  "address": {
    "street": "Av. Paulista",
    "number": "1000",
    "neighborhood": "Bela Vista",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01310100"
  }
}
```

### Agendar consulta
```http
POST /api/appointments
Content-Type: application/json

{
  "patientId": "uuid-do-paciente",
  "doctorId": "uuid-do-medico",
  "startTime": "2024-03-15T09:00:00Z",
  "endTime": "2024-03-15T10:00:00Z",
  "reason": "Consulta de rotina"
}
```

### Cancelar consulta
```http
PATCH /api/appointments/:id/cancel
Content-Type: application/json

{
  "reason": "Paciente indisponível",
  "cancelledBy": "patient"
}
```

---

## Arquivos-chave para estudo

| Arquivo | Conceito demonstrado |
|---|---|
| [src/shared/domain/AggregateRoot.ts](src/shared/domain/AggregateRoot.ts) | Base de todo AR — coleta de eventos |
| [src/shared/application/Either.ts](src/shared/application/Either.ts) | Tratamento funcional de erros |
| [src/modules/patient/domain/CPF.ts](src/modules/patient/domain/CPF.ts) | Value Object com validação |
| [src/modules/patient/domain/Patient.ts](src/modules/patient/domain/Patient.ts) | Aggregate Root completo |
| [src/modules/appointment/domain/AppointmentStatus.ts](src/modules/appointment/domain/AppointmentStatus.ts) | VO com máquina de estados |
| [src/modules/appointment/domain/services/AppointmentSchedulingService.ts](src/modules/appointment/domain/services/AppointmentSchedulingService.ts) | Domain Service |
| [src/modules/patient/application/use-cases/RegisterPatientUseCaseImpl.ts](src/modules/patient/application/use-cases/RegisterPatientUseCaseImpl.ts) | Use Case completo |
| [src/modules/patient/infrastructure/adapters/out/persistence/PatientMapper.ts](src/modules/patient/infrastructure/adapters/out/persistence/PatientMapper.ts) | Mapper Domain ↔ ORM |
| [src/modules/patient/infrastructure/container/PatientContainer.ts](src/modules/patient/infrastructure/container/PatientContainer.ts) | Wiring de DI |
| [tests/unit/modules/patient/domain/Patient.test.ts](tests/unit/modules/patient/domain/Patient.test.ts) | Testes de AR |
| [tests/unit/modules/patient/application/RegisterPatientUseCaseImpl.test.ts](tests/unit/modules/patient/application/RegisterPatientUseCaseImpl.test.ts) | Testes de Use Case com mocks manuais |