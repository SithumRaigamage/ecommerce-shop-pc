import { describe, expect, it } from 'vitest'
import { BETTER_DIRECTION, bestIndices, numericOf } from './catalogue'

describe('numericOf', () => {
  it('reads the leading number out of a formatted value', () => {
    expect(numericOf('32GB (2x16GB)')).toBe(32)
    expect(numericOf('215,000')).toBe(215000)
    expect(numericOf(5.2)).toBe(5.2)
    expect(numericOf('-40')).toBe(-40)
  })

  it('returns null for anything without a number in it', () => {
    expect(numericOf('LGA1700')).toBe(1700) // a socket does have digits — see below
    expect(numericOf('AM5')).toBe(5)
    expect(numericOf('Fully modular')).toBeNull()
    expect(numericOf(null)).toBeNull()
    expect(numericOf(undefined)).toBeNull()
    expect(numericOf(['a', 'b'])).toBeNull()
    expect(numericOf(Number.NaN)).toBeNull()
  })
})

describe('bestIndices', () => {
  it('marks the highest when higher is better', () => {
    expect(bestIndices([8, 24, 12], 'higher')).toEqual([1])
  })

  it('marks the lowest when lower is better', () => {
    expect(bestIndices(['215,000', '168,000', '125,000'], 'lower')).toEqual([2])
  })

  it('marks every joint leader, because they genuinely are joint best', () => {
    expect(bestIndices([125, 125, 170], 'lower')).toEqual([0, 1])
  })

  it('stays silent when the row is a whole-row tie', () => {
    expect(bestIndices([16, 16], 'higher')).toEqual([])
  })

  it('stays silent when the spec has no agreed direction', () => {
    // Socket is the case this protects: LGA1700 parses to 1700 and AM5 to 5, so
    // without the direction gate the table would claim Intel "wins" the socket.
    expect(bestIndices(['LGA1700', 'AM5'], BETTER_DIRECTION.socket)).toEqual([])
    expect(bestIndices([1, 2], undefined)).toEqual([])
  })

  it('stays silent when any value is not numeric', () => {
    expect(bestIndices([16, 'Fully modular'], 'higher')).toEqual([])
    expect(bestIndices([16, null], 'higher')).toEqual([])
  })

  it('stays silent with fewer than two columns', () => {
    expect(bestIndices([16], 'higher')).toEqual([])
    expect(bestIndices([], 'higher')).toEqual([])
  })
})

describe('BETTER_DIRECTION', () => {
  it('points TDP and PSU wattage in opposite directions despite the shared unit', () => {
    // The reason this map is hand-written rather than derived from SPEC_UNITS.
    expect(BETTER_DIRECTION.tdp).toBe('lower')
    expect(BETTER_DIRECTION.wattage).toBe('higher')
  })

  it('omits every spec that has no better', () => {
    for (const key of ['socket', 'chipset', 'form_factor', 'panel', 'type', 'efficiency']) {
      expect(BETTER_DIRECTION[key], `${key} must not be rankable`).toBeUndefined()
    }
  })
})
