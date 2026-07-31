import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider } from './ThemeProvider'
import { DEFAULT_PREFERENCE, THEME_STORAGE_KEY } from '@/lib/theme'
import { useTheme } from '@/hooks/useTheme'

function mockPrefersDark(matches: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes('prefers-color-scheme: dark') ? matches : false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia
}

function Probe() {
  const { theme, preference } = useTheme()
  return <span data-testid="probe">{`${preference}:${theme}`}</span>
}

const renderProvider = () =>
  render(
    <ThemeProvider>
      <Probe />
    </ThemeProvider>,
  )

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.className = ''
    mockPrefersDark(false)
  })

  afterEach(() => {
    document.documentElement.className = ''
  })

  /**
   * Chromium reports `prefers-color-scheme: light` when the OS has no
   * preference, so a 'system' default would make light the effective default.
   * Dark must win when nothing is stored, even against an OS light preference.
   */
  it('defaults to dark when nothing is stored', () => {
    renderProvider()
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(screen.getByTestId('probe')).toHaveTextContent(`${DEFAULT_PREFERENCE}:dark`)
  })

  it('still defaults to dark when the OS prefers light', () => {
    mockPrefersDark(false)
    renderProvider()
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('prefers a stored light preference over the default', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'light')
    renderProvider()
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(screen.getByTestId('probe')).toHaveTextContent('light:light')
  })

  it('follows the OS only when the stored preference is "system"', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'system')
    mockPrefersDark(false)
    renderProvider()
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(screen.getByTestId('probe')).toHaveTextContent('system:light')
  })

  it('resolves "system" to dark when the OS prefers dark', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'system')
    mockPrefersDark(true)
    renderProvider()
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('ignores a corrupt stored value', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'neon')
    renderProvider()
    expect(screen.getByTestId('probe')).toHaveTextContent(`${DEFAULT_PREFERENCE}:dark`)
  })

  it('sets colorScheme on the root element', () => {
    renderProvider()
    expect(document.documentElement.style.colorScheme).toBe('dark')
  })

  it('throws if useTheme is used outside the provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Probe />)).toThrow(/within <ThemeProvider>/)
    spy.mockRestore()
  })
})
