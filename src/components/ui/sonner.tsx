import { CircleCheckIcon, InfoIcon, Loader2Icon, OctagonXIcon, TriangleAlertIcon } from 'lucide-react'
import { Toaster as Sonner, type ToasterProps } from 'sonner'

/**
 * Sonner draws from CSS variables rather than classes, so the token bridge is
 * done here. Status colours come from the semantic layer, not sonner's defaults.
 */
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      position="bottom-right"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          '--normal-bg': 'var(--elevation-2-bg)',
          '--normal-text': 'var(--fg-primary)',
          '--normal-border': 'var(--elevation-2-border)',
          '--success-bg': 'var(--success-bg)',
          '--success-text': 'var(--success-fg)',
          '--success-border': 'var(--success-border)',
          '--warning-bg': 'var(--warning-bg)',
          '--warning-text': 'var(--warning-fg)',
          '--warning-border': 'var(--warning-border)',
          '--error-bg': 'var(--danger-bg)',
          '--error-text': 'var(--danger-fg)',
          '--error-border': 'var(--danger-border)',
          '--border-radius': 'var(--radius-lg)',
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
