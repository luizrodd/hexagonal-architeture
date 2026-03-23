import 'reflect-metadata'
import { ValueObject } from '@shared/domain/ValueObject'

interface MoneyProps {
  amount: number
  currency: string
}

class Money extends ValueObject<MoneyProps> {
  constructor(props: MoneyProps) { super(props) }
  get amount() { return this.props.amount }
  get currency() { return this.props.currency }
}

describe('ValueObject', () => {
  it('dois VOs com mesmas props são iguais', () => {
    const a = new Money({ amount: 100, currency: 'BRL' })
    const b = new Money({ amount: 100, currency: 'BRL' })
    expect(a.equals(b)).toBe(true)
  })

  it('dois VOs com props diferentes não são iguais', () => {
    const a = new Money({ amount: 100, currency: 'BRL' })
    const b = new Money({ amount: 200, currency: 'BRL' })
    expect(a.equals(b)).toBe(false)
  })

  it('VO não é igual a undefined', () => {
    const a = new Money({ amount: 100, currency: 'BRL' })
    expect(a.equals(undefined)).toBe(false)
  })

  it('props são imutáveis (frozen)', () => {
    const m = new Money({ amount: 100, currency: 'BRL' })
    expect(() => {
      (m as any).props.amount = 999
    }).toThrow()
  })
})
