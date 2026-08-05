import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  applyTheme,
  readStoredPreference,
  resolveTheme,
  systemTheme,
  THEME_STORAGE_KEY,
  ThemeContext,
  type Theme,
  type ThemePreference,
} from '@/lib/theme'

/**
 * Applies the theme class to <html>. Resolution order: stored preference, then
 * `prefers-color-scheme`, then dark.
 *
 * No toggle UI yet — `useTheme().setPreference` is the seam a control will use.
 * `index.html` runs the same resolution inline before first paint to avoid a
 * flash of the wrong theme; keep the two in sync.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(readStoredPreference)
  const [theme, setTheme] = useState<Theme>(() => resolveTheme(readStoredPreference()))

  useEffect(() => {
    const resolved = resolveTheme(preference)
    setTheme(resolved)
    applyTheme(resolved)
  }, [preference])

  // Track OS changes only while the user is following the system.
  useEffect(() => {
    if (preference !== 'system' || !window.matchMedia) return

    const query = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      const resolved = systemTheme()
      setTheme(resolved)
      applyTheme(resolved)
    }

    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [preference])

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      // Persistence is best-effort; the in-memory preference still applies.
    }
  }, [])

  const value = useMemo(
    () => ({ preference, theme, setPreference }),
    [preference, theme, setPreference],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
