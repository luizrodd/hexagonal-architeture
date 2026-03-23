import 'reflect-metadata'
import { Appointment } from '@modules/appointment/domain/Appointment'
import { TimeSlot } from '@modules/appointment/domain/TimeSlot'
import { AppointmentStatusType } from '@modules/appointment/domain/AppointmentStatus'
import {
  AppointmentScheduled,
  AppointmentConfirmed,
  AppointmentCancelled,
  AppointmentCompleted,
} from '@modules/appointment/domain/events/AppointmentEvents'

function makeSlot(): TimeSlot {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(9, 0, 0, 0)
  const end = new Date(tomorrow)
  end.setHours(10, 0, 0, 0)
  return TimeSlot.create(tomorrow, end).value as TimeSlot
}

function makeAppointment(): Appointment {
  return Appointment.schedule({
    patientId: 'patient-uuid-1',
    doctorId: 'doctor-uuid-1',
    timeSlot: makeSlot(),
    reason: 'Consulta de rotina',
  }).value as Appointment
}

describe('Appointment (Aggregate Root — máquina de estados)', () => {
  it('novo agendamento começa com status SCHEDULED', () => {
    const appt = makeAppointment()
    expect(appt.status.value).toBe(AppointmentStatusType.SCHEDULED)
  })

  it('emite AppointmentScheduled ao criar', () => {
    const appt = makeAppointment()
    expect(appt.domainEvents).toHaveLength(1)
    expect(appt.domainEvents[0]).toBeInstanceOf(AppointmentScheduled)
  })

  it('retorna Left se motivo for vazio', () => {
    const result = Appointment.schedule({
      patientId: 'p1',
      doctorId: 'd1',
      timeSlot: makeSlot(),
      reason: '',
    })
    expect(result.isLeft()).toBe(true)
  })

  describe('confirm()', () => {
    it('transita para CONFIRMED e emite AppointmentConfirmed', () => {
      const appt = makeAppointment()
      appt.clearEvents()

      const result = appt.confirm()
      expect(result.isRight()).toBe(true)
      expect(appt.status.value).toBe(AppointmentStatusType.CONFIRMED)
      expect(appt.domainEvents[0]).toBeInstanceOf(AppointmentConfirmed)
    })
  })

  describe('cancel()', () => {
    it('cancela consulta SCHEDULED', () => {
      const appt = makeAppointment()
      appt.clearEvents()

      const result = appt.cancel('Paciente indisponível', 'patient')
      expect(result.isRight()).toBe(true)
      expect(appt.status.value).toBe(AppointmentStatusType.CANCELLED)
      expect(appt.cancelReason).toBe('Paciente indisponível')
      expect(appt.domainEvents[0]).toBeInstanceOf(AppointmentCancelled)
    })

    it('cancela consulta CONFIRMED', () => {
      const appt = makeAppointment()
      appt.confirm()
      appt.clearEvents()

      const result = appt.cancel('Urgência', 'doctor')
      expect(result.isRight()).toBe(true)
    })

    it('NÃO pode cancelar consulta já COMPLETED', () => {
      const appt = makeAppointment()
      appt.confirm()
      appt.complete('Tudo bem')
      appt.clearEvents()

      const result = appt.cancel('Tarde demais', 'system')
      expect(result.isLeft()).toBe(true)
    })
  })

  describe('complete()', () => {
    it('só pode completar se estiver CONFIRMED', () => {
      const appt = makeAppointment()
      const result = appt.complete()
      // SCHEDULED → COMPLETED é inválido
      expect(result.isLeft()).toBe(true)
    })

    it('completa com sucesso e emite AppointmentCompleted', () => {
      const appt = makeAppointment()
      appt.confirm()
      appt.clearEvents()

      const result = appt.complete('Paciente bem. Retorno em 30 dias.')
      expect(result.isRight()).toBe(true)
      expect(appt.status.value).toBe(AppointmentStatusType.COMPLETED)
      expect(appt.notes).toBe('Paciente bem. Retorno em 30 dias.')
      expect(appt.domainEvents[0]).toBeInstanceOf(AppointmentCompleted)
    })
  })
})
