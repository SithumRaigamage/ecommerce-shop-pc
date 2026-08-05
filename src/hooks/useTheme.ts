import { useContext } from 'react'
import { ThemeContext } from '@/lib/theme'

/** Seam for the theme toggle UI that Stage 2 designs. */
export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within <ThemeProvider>')
  }
  return context
}
