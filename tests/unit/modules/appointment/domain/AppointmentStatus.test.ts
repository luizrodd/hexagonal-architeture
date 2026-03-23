import 'reflect-metadata'
import { AppointmentStatus, AppointmentStatusType } from '@modules/appointment/domain/AppointmentStatus'

describe('AppointmentStatus (máquina de estados)', () => {
  it('estado inicial é SCHEDULED', () => {
    const status = AppointmentStatus.initial()
    expect(status.value).toBe(AppointmentStatusType.SCHEDULED)
  })

  it('SCHEDULED → CONFIRMED é permitido', () => {
    const result = AppointmentStatus.initial()
      .transitionTo(AppointmentStatusType.CONFIRMED)
    expect(result.isRight()).toBe(true)
  })

  it('SCHEDULED → CANCELLED é permitido', () => {
    const result = AppointmentStatus.initial()
      .transitionTo(AppointmentStatusType.CANCELLED)
    expect(result.isRight()).toBe(true)
  })

  it('SCHEDULED → COMPLETED é proibido', () => {
    const result = AppointmentStatus.initial()
      .transitionTo(AppointmentStatusType.COMPLETED)
    expect(result.isLeft()).toBe(true)
  })

  it('CONFIRMED → COMPLETED é permitido', () => {
    const confirmed = AppointmentStatus.initial()
      .transitionTo(AppointmentStatusType.CONFIRMED).value as AppointmentStatus
    const result = confirmed.transitionTo(AppointmentStatusType.COMPLETED)
    expect(result.isRight()).toBe(true)
  })

  it('CONFIRMED → NO_SHOW é permitido', () => {
    const confirmed = AppointmentStatus.initial()
      .transitionTo(AppointmentStatusType.CONFIRMED).value as AppointmentStatus
    const result = confirmed.transitionTo(AppointmentStatusType.NO_SHOW)
    expect(result.isRight()).toBe(true)
  })

  it('COMPLETED é estado terminal (não permite transições)', () => {
    const completed = AppointmentStatus.reconstitute(AppointmentStatusType.COMPLETED)
    expect(completed.isTerminal).toBe(true)
    expect(completed.transitionTo(AppointmentStatusType.CANCELLED).isLeft()).toBe(true)
  })

  it('CANCELLED é estado terminal', () => {
    const cancelled = AppointmentStatus.reconstitute(AppointmentStatusType.CANCELLED)
    expect(cancelled.isTerminal).toBe(true)
  })

  it('mensagem de erro descreve a transição inválida', () => {
    const result = AppointmentStatus.initial()
      .transitionTo(AppointmentStatusType.COMPLETED)
    expect(result.value.message).toContain('SCHEDULED')
    expect(result.value.message).toContain('COMPLETED')
  })
})
