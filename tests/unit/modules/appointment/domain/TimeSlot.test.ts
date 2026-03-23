import 'reflect-metadata'
import { TimeSlot } from '@modules/appointment/domain/TimeSlot'

function makeSlot(startH: number, endH: number): TimeSlot {
  const base = new Date('2024-03-15')
  const start = new Date(base)
  start.setHours(startH, 0, 0, 0)
  const end = new Date(base)
  end.setHours(endH, 0, 0, 0)
  return TimeSlot.create(start, end).value as TimeSlot
}

describe('TimeSlot (Value Object)', () => {
  describe('create()', () => {
    it('cria slot válido', () => {
      const result = TimeSlot.create(
        new Date('2024-03-15T09:00:00Z'),
        new Date('2024-03-15T10:00:00Z'),
      )
      expect(result.isRight()).toBe(true)
    })

    it('rejeita se fim <= início', () => {
      const result = TimeSlot.create(
        new Date('2024-03-15T10:00:00Z'),
        new Date('2024-03-15T09:00:00Z'),
      )
      expect(result.isLeft()).toBe(true)
    })

    it('rejeita duração menor que 15 minutos', () => {
      const start = new Date('2024-03-15T09:00:00Z')
      const end = new Date('2024-03-15T09:10:00Z')
      const result = TimeSlot.create(start, end)
      expect(result.isLeft()).toBe(true)
    })

    it('rejeita duração maior que 4 horas', () => {
      const start = new Date('2024-03-15T08:00:00Z')
      const end = new Date('2024-03-15T13:00:00Z')
      const result = TimeSlot.create(start, end)
      expect(result.isLeft()).toBe(true)
    })

    it('calcula durationMinutes corretamente', () => {
      const slot = makeSlot(9, 10)
      expect(slot.durationMinutes).toBe(60)
    })
  })

  describe('overlapsWith()', () => {
    it('detecta sobreposição total', () => {
      // 08:00-12:00 sobrepõe 09:00-10:00
      expect(makeSlot(8, 12).overlapsWith(makeSlot(9, 10))).toBe(true)
    })

    it('detecta sobreposição parcial', () => {
      // 08:00-10:00 sobrepõe 09:00-11:00
      expect(makeSlot(8, 10).overlapsWith(makeSlot(9, 11))).toBe(true)
    })

    it('não detecta sobreposição em slots adjacentes', () => {
      // 08:00-09:00 NÃO sobrepõe 09:00-10:00 (adjacente, não sobreposto)
      expect(makeSlot(8, 9).overlapsWith(makeSlot(9, 10))).toBe(false)
    })

    it('não detecta sobreposição em slots separados', () => {
      // 08:00-09:00 NÃO sobrepõe 10:00-11:00
      expect(makeSlot(8, 9).overlapsWith(makeSlot(10, 11))).toBe(false)
    })
  })
})
