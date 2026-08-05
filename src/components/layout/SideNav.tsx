import { useNavigate } from 'react-router-dom'
import { CATEGORIES } from '@/lib/categories'
import { cn } from '@/lib/utils'

interface SideNavProps {
  className?: string
  onNavigate?: () => void
}

export function SideNav({ className, onNavigate }: SideNavProps) {
  const navigate = useNavigate()

  const selectCategory = (slug: string) => {
    navigate(`/product-grid?category=${encodeURIComponent(slug)}`)
    onNavigate?.()
  }

  return (
    <nav
      aria-label="Product categories"
      className={cn('bg-surface-1 rounded-lg border p-3', className)}
    >
      <ul className="space-y-2">
        {CATEGORIES.map(({ slug, label, icon: Icon }) => (
          <li key={slug}>
            <button
              type="button"
              onClick={() => selectCategory(slug)}
              className="focus-ring flex w-full cursor-pointer flex-col items-center gap-1 rounded-md border border-border-subtle p-2 text-center text-fg-secondary duration-fast ease-standard transition-colors hover:border-border-strong hover:bg-surface-2 hover:text-fg-primary active:bg-surface-3"
            >
              <Icon className="size-5 text-fg-tertiary" aria-hidden="true" />
              <span className="text-xs leading-tight break-words">{label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
