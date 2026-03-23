import 'reflect-metadata'
import { Patient, PatientStatus } from '@modules/patient/domain/Patient'
import { CPF } from '@modules/patient/domain/CPF'
import { Email } from '@modules/patient/domain/Email'
import { Phone } from '@modules/patient/domain/Phone'
import { Address } from '@modules/patient/domain/Address'
import { PatientRegistered } from '@modules/patient/domain/events/PatientRegistered'
import { PatientUpdated } from '@modules/patient/domain/events/PatientUpdated'

// ── Builder de teste ──────────────────────────────────────────────────────────
// O Builder evita duplicação nos testes e facilita criar variações.
function buildValidPatientProps() {
  return {
    name: 'João da Silva',
    cpf: (CPF.create('529.982.247-25').value as CPF),
    email: (Email.create('joao@email.com').value as Email),
    phone: (Phone.create('11987654321').value as Phone),
    birthDate: new Date('1990-05-15'),
    address: (Address.create({
      street: 'Rua das Flores',
      number: '123',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310100',
    }).value as Address),
  }
}

describe('Patient (Aggregate Root)', () => {
  describe('Patient.create()', () => {
    it('cria paciente válido com Right', () => {
      const result = Patient.create(buildValidPatientProps())
      expect(result.isRight()).toBe(true)
    })

    it('novo paciente começa com status ACTIVE', () => {
      const patient = (Patient.create(buildValidPatientProps()).value as Patient)
      expect(patient.status).toBe(PatientStatus.ACTIVE)
      expect(patient.isActive).toBe(true)
    })

    it('histórico médico começa vazio', () => {
      const patient = (Patient.create(buildValidPatientProps()).value as Patient)
      expect(patient.medicalHistory).toHaveLength(0)
    })

    it('emite evento PatientRegistered ao criar', () => {
      const patient = (Patient.create(buildValidPatientProps()).value as Patient)
      expect(patient.domainEvents).toHaveLength(1)
      expect(patient.domainEvents[0]).toBeInstanceOf(PatientRegistered)
    })

    it('evento PatientRegistered contém os dados corretos', () => {
      const props = buildValidPatientProps()
      const patient = (Patient.create(props).value as Patient)
      const event = patient.domainEvents[0] as PatientRegistered
      expect(event.patientName).toBe('João da Silva')
      expect(event.email).toBe('joao@email.com')
      expect(event.cpf).toBe('52998224725')
      expect(event.aggregateId).toBe(patient.id.toValue())
    })

    it('retorna Left se nome for vazio', () => {
      const props = { ...buildValidPatientProps(), name: '' }
      const result = Patient.create(props)
      expect(result.isLeft()).toBe(true)
    })

    it('retorna Left se nome tiver menos de 2 caracteres', () => {
      const props = { ...buildValidPatientProps(), name: 'A' }
      const result = Patient.create(props)
      expect(result.isLeft()).toBe(true)
    })

    it('retorna Left se data de nascimento for futura', () => {
      const futureDate = new Date()
      futureDate.setFullYear(futureDate.getFullYear() + 1)
      const props = { ...buildValidPatientProps(), birthDate: futureDate }
      const result = Patient.create(props)
      expect(result.isLeft()).toBe(true)
    })
  })

  describe('Patient.reconstitute()', () => {
    it('NÃO emite eventos ao reconstituir do banco', () => {
      const props = buildValidPatientProps()
      const created = Patient.create(props).value as Patient

      // Simula rehidratação do banco
      const reconstituted = Patient.reconstitute(
        {
          name: created.name,
          cpf: created.cpf,
          email: created.email,
          phone: created.phone,
          birthDate: created.birthDate,
          address: created.address,
          status: created.status,
          medicalHistory: [],
          createdAt: created.createdAt,
          updatedAt: created.updatedAt,
        },
        created.id,
      )

      expect(reconstituted.domainEvents).toHaveLength(0)
    })
  })

  describe('updateContactInfo()', () => {
    it('emite PatientUpdated apenas se algo mudou', () => {
      const patient = Patient.create(buildValidPatientProps()).value as Patient
      patient.clearEvents()

      const novoEmail = Email.create('novo@email.com').value as Email
      patient.updateContactInfo({ email: novoEmail })

      expect(patient.domainEvents).toHaveLength(1)
      expect(patient.domainEvents[0]).toBeInstanceOf(PatientUpdated)
    })

    it('lista os campos alterados no evento', () => {
      const patient = Patient.create(buildValidPatientProps()).value as Patient
      patient.clearEvents()

      const novoEmail = Email.create('novo@email.com').value as Email
      const novoPhone = Phone.create('11911112222').value as Phone
      patient.updateContactInfo({ email: novoEmail, phone: novoPhone })

      const event = patient.domainEvents[0] as PatientUpdated
      expect(event.changedFields).toContain('email')
      expect(event.changedFields).toContain('phone')
    })

    it('NÃO emite evento se nada mudou', () => {
      const patient = Patient.create(buildValidPatientProps()).value as Patient
      patient.clearEvents()

      // Passa o mesmo email — não deve gerar evento
      patient.updateContactInfo({ email: patient.email })
      expect(patient.domainEvents).toHaveLength(0)
    })

    it('atualiza o campo email corretamente', () => {
      const patient = Patient.create(buildValidPatientProps()).value as Patient
      const novoEmail = Email.create('novo@email.com').value as Email
      patient.updateContactInfo({ email: novoEmail })
      expect(patient.email.value).toBe('novo@email.com')
    })
  })

  describe('deactivate()', () => {
    it('muda status para INACTIVE', () => {
      const patient = Patient.create(buildValidPatientProps()).value as Patient
      patient.deactivate()
      expect(patient.status).toBe(PatientStatus.INACTIVE)
      expect(patient.isActive).toBe(false)
    })

    it('chamar deactivate duas vezes não causa problemas', () => {
      const patient = Patient.create(buildValidPatientProps()).value as Patient
      patient.deactivate()
      patient.deactivate()
      expect(patient.status).toBe(PatientStatus.INACTIVE)
    })
  })

  describe('clearEvents()', () => {
    it('limpa a lista de eventos', () => {
      const patient = Patient.create(buildValidPatientProps()).value as Patient
      expect(patient.domainEvents).toHaveLength(1)
      patient.clearEvents()
      expect(patient.domainEvents).toHaveLength(0)
    })
  })
})
