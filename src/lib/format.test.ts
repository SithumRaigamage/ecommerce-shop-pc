import { describe, expect, it } from 'vitest'
import { assetUrl, formatLKR } from './format'

describe('assetUrl', () => {
  it('makes Angular-style relative asset paths root-absolute', () => {
    expect(assetUrl('assets/products/ps5.png')).toBe('/assets/products/ps5.png')
  })

  it('leaves absolute and remote URLs untouched', () => {
    expect(assetUrl('/assets/icons/profile-user.png')).toBe('/assets/icons/profile-user.png')
    expect(assetUrl('https://example.com/a.png')).toBe('https://example.com/a.png')
    expect(assetUrl('//cdn.example.com/a.png')).toBe('//cdn.example.com/a.png')
  })

  it('returns an empty string for missing paths', () => {
    expect(assetUrl(undefined)).toBe('')
  })
})

describe('formatLKR', () => {
  it('formats numbers with the LKR currency code', () => {
    expect(formatLKR(1500)).toContain('LKR')
    expect(formatLKR(1500)).toContain('1,500.00')
  })

  it('treats null and undefined as zero', () => {
    expect(formatLKR(undefined)).toContain('0.00')
    expect(formatLKR(null)).toContain('0.00')
  })
})
