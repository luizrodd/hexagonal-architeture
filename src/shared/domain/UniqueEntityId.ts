import { v4 as uuidv4 } from 'uuid'

/**
 * Wrapper de UUID para identificadores de entidades.
 * Garante type safety: PatientId, DoctorId, etc. estendem esta classe.
 */
export class UniqueEntityId {
  private readonly _value: string

  constructor(id?: string) {
    this._value = id ?? uuidv4()
  }

  toString(): string {
    return this._value
  }

  toValue(): string {
    return this._value
  }

  equals(id?: UniqueEntityId): boolean {
    if (!id) return false
    return this._value === id._value
  }
}
