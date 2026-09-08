import { describe, expect, it } from 'vitest'
import { formatMoney, cn } from './utils'

describe('formatMoney', () => {
  it('formats RUB amounts without decimals', () => {
    expect(formatMoney(31400, 'RUB')).toContain('31')
    expect(formatMoney(31400, 'RUB')).toContain('400')
  })

  it('formats zero correctly', () => {
    expect(formatMoney(0, 'RUB')).toMatch(/0/)
  })
})

describe('cn', () => {
  it('merges class names and drops falsy values', () => {
    expect(cn('a', false, undefined, 'b')).toBe('a b')
  })
})
