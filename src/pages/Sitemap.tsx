import { Link } from 'react-router-dom'
import { Container, Stack } from '@/components/layout/primitives'
import { CATEGORIES } from '@/lib/categories'
import { ROUTES, type NavGroup } from '@/routes'

const GROUPS: { group: NavGroup; title: string }[] = [
  { group: 'shop', title: 'Shop' },
  { group: 'support', title: 'Services' },
  { group: 'service', title: 'Customer service' },
  { group: 'company', title: 'Company' },
]

/**
 * Generated from the route table rather than written by hand.
 *
 * A hand-written sitemap is the first thing to go stale, and this project has
 * already paid for that once — the footer linked to six paths that had never
 * been declared. Here the list cannot disagree with the router, because it is
 * the router's own source.
 */
export default function Sitemap() {
  // Routes reachable but in no nav group: reference pages and the like.
  const unlisted = ROUTES.filter(
    (route) => route.label && !route.nav && !route.redirectTo && route.path !== '/',
  )

  return (
    <Container size="content">
      <Stack gap="section">
        <Stack gap="tight">
          <h1 className="font-display text-3xl font-semibold text-fg-primary">Sitemap</h1>
          <p className="max-w-reading text-sm text-fg-tertiary">
            Every page on this site. Generated from the application's route table, so it
            cannot fall out of step with what actually exists.
          </p>
        </Stack>

        <div className="grid gap-section sm:grid-cols-2 lg:grid-cols-3">
          {GROUPS.map(({ group, title }) => {
            const routes = ROUTES.filter((route) => route.nav?.includes(group) && route.label)
            if (routes.length === 0) return null

            return (
              <Stack key={group} gap="tight" as="section">
                <h2 className="text-sm font-medium tracking-wide text-fg-secondary uppercase">
                  {title}
                </h2>
                <ul className="flex flex-col gap-1">
                  {routes.map((route) => (
                    <li key={`${group}-${route.path}`}>
                      <Link
                        to={route.path}
                        className="focus-ring rounded-xs text-sm text-fg-tertiary duration-fast ease-standard transition-colors hover:text-fg-primary"
                      >
                        {route.label}
                      </Link>
                      {/* Stated rather than discovered by clicking through. */}
                      {route.placeholder && (
                        <span className="ml-2 text-xs text-fg-tertiary opacity-60">
                          in progress
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </Stack>
            )
          })}

          <Stack gap="tight" as="section">
            <h2 className="text-sm font-medium tracking-wide text-fg-secondary uppercase">
              Categories
            </h2>
            <ul className="flex flex-col gap-1">
              {CATEGORIES.map((category) => (
                <li key={category.slug}>
                  <Link
                    to={`/product-grid?category=${category.slug}`}
                    className="focus-ring rounded-xs text-sm text-fg-tertiary duration-fast ease-standard transition-colors hover:text-fg-primary"
                  >
                    {category.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Stack>

          {unlisted.length > 0 && (
            <Stack gap="tight" as="section">
              <h2 className="text-sm font-medium tracking-wide text-fg-secondary uppercase">
                Other
              </h2>
              <ul className="flex flex-col gap-1">
                {unlisted.map((route) => (
                  <li key={route.path}>
                    <Link
                      to={route.path}
                      className="focus-ring rounded-xs text-sm text-fg-tertiary duration-fast ease-standard transition-colors hover:text-fg-primary"
                    >
                      {route.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </Stack>
          )}
        </div>
      </Stack>
    </Container>
  )
}
