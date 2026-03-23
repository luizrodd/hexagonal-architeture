import 'reflect-metadata'
import { CPF } from '@modules/patient/domain/CPF'

describe('CPF (Value Object)', () => {
  const CPF_VALIDO = '529.982.247-25'
  const CPF_VALIDO_SEM_MASK = '52998224725'

  describe('create() — casos válidos', () => {
    it('aceita CPF formatado', () => {
      const result = CPF.create(CPF_VALIDO)
      expect(result.isRight()).toBe(true)
    })

    it('aceita CPF sem formatação', () => {
      const result = CPF.create(CPF_VALIDO_SEM_MASK)
      expect(result.isRight()).toBe(true)
    })

    it('armazena apenas dígitos internamente', () => {
      const cpf = CPF.create(CPF_VALIDO).value as CPF
      expect(cpf.value).toBe('52998224725')
    })

    it('retorna formatado no getter .formatted', () => {
      const cpf = CPF.create(CPF_VALIDO_SEM_MASK).value as CPF
      expect(cpf.formatted).toBe('529.982.247-25')
    })
  })

  describe('create() — casos inválidos', () => {
    it('rejeita CPF com dígitos verificadores errados', () => {
      const result = CPF.create('529.982.247-26')
      expect(result.isLeft()).toBe(true)
    })

    it('rejeita sequência repetida (111.111.111-11)', () => {
      const result = CPF.create('111.111.111-11')
      expect(result.isLeft()).toBe(true)
    })

    it('rejeita CPF com menos de 11 dígitos', () => {
      const result = CPF.create('123.456.789')
      expect(result.isLeft()).toBe(true)
    })

    it('rejeita string vazia', () => {
      const result = CPF.create('')
      expect(result.isLeft()).toBe(true)
    })
  })

  describe('igualdade (Value Object)', () => {
    it('dois CPFs com mesmo valor são iguais', () => {
      const a = CPF.create(CPF_VALIDO).value as CPF
      const b = CPF.create(CPF_VALIDO_SEM_MASK).value as CPF
      expect(a.equals(b)).toBe(true)
    })

    it('dois CPFs com valores diferentes não são iguais', () => {
      const a = CPF.create('529.982.247-25').value as CPF
      const b = CPF.create('111.444.777-35').value as CPF
      expect(a.equals(b)).toBe(false)
    })
  })
})
