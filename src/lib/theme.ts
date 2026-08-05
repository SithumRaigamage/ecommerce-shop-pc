import { createContext } from 'react'

export type Theme = 'light' | 'dark'
/** 'system' follows the OS; the resolved value is still 'light' | 'dark'. */
export type ThemePreference = Theme | 'system'

export const THEME_STORAGE_KEY = 'pc-shop-theme'

/**
 * Applied when nothing is stored.
 *
 * Deliberately 'dark' rather than 'system': modern Chromium reports
 * `prefers-color-scheme: light` when the OS expresses *no* preference — there is
 * no "no-preference" value to detect — so a 'system' default would silently make
 * light the effective default for most visitors. The OS is still honoured for
 * anyone who opts into 'system' via `setPreference`.
 */
export const DEFAULT_PREFERENCE: ThemePreference = 'dark'
/** Resolved fallback when the OS is consulted but `matchMedia` is unavailable. */
export const DEFAULT_THEME: Theme = 'dark'

export interface ThemeContextValue {
  /** What the user chose ('system' means "follow the OS"). */
  preference: ThemePreference
  /** The theme actually applied to <html>. */
  theme: Theme
  setPreference: (preference: ThemePreference) => void
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export function readStoredPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
  } catch {
    // localStorage can throw in private/blocked contexts; fall through to default.
  }
  return DEFAULT_PREFERENCE
}

/** Only consulted when the preference is explicitly 'system'. */
export function systemTheme(): Theme {
  if (typeof window === 'undefined' || !window.matchMedia) return DEFAULT_THEME
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function resolveTheme(preference: ThemePreference): Theme {
  return preference === 'system' ? systemTheme() : preference
}

export function applyTheme(theme: Theme): void {
  const root = document.documentElement
  root.classList.toggle('dark', theme === 'dark')
  root.style.colorScheme = theme
}
