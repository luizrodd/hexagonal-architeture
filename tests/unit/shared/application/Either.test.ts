import 'reflect-metadata'
import { left, right, Left, Right } from '@shared/application/Either'

describe('Either', () => {
  it('left() cria Left com o valor correto', () => {
    const result = left<string, number>('erro')
    expect(result).toBeInstanceOf(Left)
    expect(result.isLeft()).toBe(true)
    expect(result.isRight()).toBe(false)
    expect(result.value).toBe('erro')
  })

  it('right() cria Right com o valor correto', () => {
    const result = right<string, number>(42)
    expect(result).toBeInstanceOf(Right)
    expect(result.isRight()).toBe(true)
    expect(result.isLeft()).toBe(false)
    expect(result.value).toBe(42)
  })
})
