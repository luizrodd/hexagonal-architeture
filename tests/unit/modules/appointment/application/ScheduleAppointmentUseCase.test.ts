import 'reflect-metadata'
import { ScheduleAppointmentUseCaseImpl } from '@modules/appointment/application/use-cases/ScheduleAppointmentUseCaseImpl'
import { PatientRepository } from '@modules/patient/application/ports/out/PatientRepository'
import { DoctorRepository } from '@modules/doctor/application/ports/out/DoctorRepository'
import { AppointmentRepository } from '@modules/appointment/application/ports/out/AppointmentRepository'
import { Patient, PatientStatus } from '@modules/patient/domain/Patient'
import { Doctor, DoctorStatus } from '@modules/doctor/domain/Doctor'
import { Appointment } from '@modules/appointment/domain/Appointment'
import { ScheduleAppointmentDto } from '@modules/appointment/application/dto/ScheduleAppointmentDto'
import { TimeSlotUnavailableException } from '@modules/appointment/domain/exceptions/AppointmentExceptions'

// ── Factories de mocks ────────────────────────────────────────────────────────

function makeActivePatient(): Patient {
  return {
    id: { toValue: () => 'patient-uuid-1' },
    isActive: true,
    domainEvents: [],
    clearEvents: jest.fn(),
  } as unknown as Patient
}

function makeActiveDoctor(): Doctor {
  return {
    id: { toValue: () => 'doctor-uuid-1' },
    isActive: true,
    domainEvents: [],
    clearEvents: jest.fn(),
  } as unknown as Doctor
}

function makePatientRepo(patient: Patient | null = makeActivePatient()): PatientRepository {
  return {
    findById: jest.fn().mockResolvedValue(patient),
    findByCPF: jest.fn().mockResolvedValue(null),
    findAll: jest.fn().mockResolvedValue([]),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  }
}

function makeDoctorRepo(doctor: Doctor | null = makeActiveDoctor()): DoctorRepository {
  return {
    findById: jest.fn().mockResolvedValue(doctor),
    findByCRM: jest.fn().mockResolvedValue(null),
    findBySpecialty: jest.fn().mockResolvedValue([]),
    findAll: jest.fn().mockResolvedValue([]),
    save: jest.fn(),
    update: jest.fn(),
  }
}

function makeAppointmentRepo(existing: Appointment[] = []): AppointmentRepository {
  return {
    findById: jest.fn().mockResolvedValue(null),
    findByDoctorAndPeriod: jest.fn().mockResolvedValue(existing),
    findByPatient: jest.fn().mockResolvedValue([]),
    save: jest.fn(),
    update: jest.fn(),
  }
}

const VALID_DTO: ScheduleAppointmentDto = {
  patientId: 'patient-uuid-1',
  doctorId: 'doctor-uuid-1',
  startTime: '2025-12-15T09:00:00.000Z',
  endTime: '2025-12-15T10:00:00.000Z',
  reason: 'Consulta de rotina',
}

describe('ScheduleAppointmentUseCaseImpl', () => {
  function makeUseCase(
    patientRepo = makePatientRepo(),
    doctorRepo = makeDoctorRepo(),
    appointmentRepo = makeAppointmentRepo(),
  ) {
    return new ScheduleAppointmentUseCaseImpl(patientRepo, doctorRepo, appointmentRepo)
  }

  it('agenda consulta com sucesso', async () => {
    const useCase = makeUseCase()
    const result = await useCase.execute(VALID_DTO)

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.patientId).toBe('patient-uuid-1')
      expect(result.value.doctorId).toBe('doctor-uuid-1')
      expect(result.value.status).toBe('SCHEDULED')
    }
  })

  it('retorna Left se paciente não for encontrado', async () => {
    const useCase = makeUseCase(makePatientRepo(null))
    const result = await useCase.execute(VALID_DTO)
    expect(result.isLeft()).toBe(true)
  })

  it('retorna Left se médico não for encontrado', async () => {
    const useCase = makeUseCase(makePatientRepo(), makeDoctorRepo(null))
    const result = await useCase.execute(VALID_DTO)
    expect(result.isLeft()).toBe(true)
  })

  it('retorna Left<TimeSlotUnavailableException> se horário já estiver ocupado', async () => {
    // Cria uma consulta existente que ocupa o mesmo horário
    const conflictingAppointment = {
      doctorId: 'doctor-uuid-1',
      status: { isTerminal: false },
      timeSlot: {
        overlapsWith: () => true, // sempre sobrepõe
      },
    } as unknown as Appointment

    const useCase = makeUseCase(
      makePatientRepo(),
      makeDoctorRepo(),
      makeAppointmentRepo([conflictingAppointment]),
    )

    const result = await useCase.execute(VALID_DTO)
    expect(result.isLeft()).toBe(true)
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(TimeSlotUnavailableException)
    }
  })

  it('retorna Left se datas forem inválidas', async () => {
    const useCase = makeUseCase()
    const result = await useCase.execute({
      ...VALID_DTO,
      startTime: '2025-12-15T10:00:00.000Z',
      endTime: '2025-12-15T09:00:00.000Z', // fim antes do início
    })
    expect(result.isLeft()).toBe(true)
  })
})
