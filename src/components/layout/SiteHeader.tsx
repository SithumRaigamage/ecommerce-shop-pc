import { Link } from 'react-router-dom'
import { Laptop, LogIn, LogOut, Menu, Settings, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { SideNav } from '@/components/layout/SideNav'
import { useCartStore } from '@/store/cart'
import { useAuth } from '@/hooks/useAuth'
import { navRoutes } from '@/routes'

/** Generated from the route table; see routes.ts. */
const NAV_LINKS = navRoutes('primary')

interface SiteHeaderProps {
  onCartClick: () => void
}

export function SiteHeader({ onCartClick }: SiteHeaderProps) {
  const cartItemCount = useCartStore((state) => state.items.length)
  const { isLoggedIn } = useAuth()

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border-subtle bg-bg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 lg:px-8">
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Categories</SheetTitle>
              </SheetHeader>
              <div className="px-4 pb-6">
                <SideNav className="border-0 p-0" />
              </div>
            </SheetContent>
          </Sheet>

          <Link to="/" className="flex items-center gap-2">
            <Laptop className="size-7 text-fg-primary" aria-hidden="true" />
            <span className="text-xl font-bold text-fg-primary duration-fast ease-standard transition-colors group-hover:text-accent-default">PC Shop</span>
          </Link>
        </div>

        <nav aria-label="Main" className="flex items-center gap-1 sm:gap-2">
          <ul className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.path}>
                <Button variant="ghost" asChild>
                  <Link to={link.path}>{link.label}</Link>
                </Button>
              </li>
            ))}
          </ul>

          <Button variant="ghost" onClick={onCartClick} className="relative" aria-label="Open cart">
            <ShoppingCart />
            <span className="hidden sm:inline">Cart</span>
            {cartItemCount > 0 && (
              // Keyed on the count so the pop replays on every change. This is
              // the entire add-to-cart feedback — no overlay, no confetti.
              <span
                key={cartItemCount}
                className="animate-badge-pop numeric absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-danger-fg text-xs font-medium text-on-accent"
                data-numeric
              >
                {cartItemCount}
              </span>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full" aria-label="Account menu">
                <img
                  src={isLoggedIn ? '/assets/icons/profile-photo.png' : '/assets/icons/profile-user.png'}
                  alt=""
                  className="size-8 rounded-full object-cover"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link to="/settings">
                  <Settings />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/sign-in">
                  <LogIn />
                  Sign In
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/sign-out">
                  <LogOut />
                  Sign out
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  )
}
