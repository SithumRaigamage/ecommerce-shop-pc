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
      className={cn('bg-card rounded-lg border p-3', className)}
    >
      <ul className="space-y-2">
        {CATEGORIES.map(({ slug, label, icon: Icon }) => (
          <li key={slug}>
            <button
              type="button"
              onClick={() => selectCategory(slug)}
              className="hover:border-primary hover:text-primary focus-visible:ring-ring flex w-full cursor-pointer flex-col items-center gap-1 rounded-md border p-2 text-center transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              <Icon className="text-primary size-5" aria-hidden="true" />
              <span className="text-xs leading-tight break-words">{label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
