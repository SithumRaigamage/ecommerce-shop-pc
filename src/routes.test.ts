import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { ROUTES, ROUTE_PATHS, isKnownRoute, navRoutes, placeholderRoutes } from './routes'

const SRC = resolve(process.cwd(), 'src')

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) return sourceFiles(full)
    return /\.tsx?$/.test(entry) && !/\.test\.tsx?$/.test(entry) ? [full] : []
  })
}

describe('the route table', () => {
  it('declares every route exactly once', () => {
    const duplicates = ROUTE_PATHS.filter((path, i) => ROUTE_PATHS.indexOf(path) !== i)
    expect(duplicates).toEqual([])
  })

  it('gives every route either a component or a redirect, never both and never neither', () => {
    const broken = ROUTES.filter((route) => {
      if (route.path === '/') return false // the index route is eager in App.tsx
      return Boolean(route.load) === Boolean(route.redirectTo)
    })
    expect(broken.map((r) => r.path)).toEqual([])
  })

  it('resolves every route to a real component', async () => {
    // The check that used to be impossible: routes.ts was a list of strings, so
    // a path could name a page that did not exist and nothing would say so.
    const failures: string[] = []

    for (const route of ROUTES) {
      if (!route.load) continue
      try {
        const module = await route.load()
        if (typeof module.default !== 'function') {
          failures.push(`${route.path}: module has no default export component`)
        }
      } catch (error) {
        failures.push(`${route.path}: ${(error as Error).message}`)
      }
    }

    expect(failures).toEqual([])
  })

  it('points every redirect at a declared route', () => {
    const dangling = ROUTES.filter(
      (route) => route.redirectTo && !ROUTE_PATHS.includes(route.redirectTo),
    )
    expect(dangling.map((r) => `${r.path} -> ${r.redirectTo}`)).toEqual([])
  })

  it('gives every navigable route a label', () => {
    const unlabelled = ROUTES.filter((route) => route.nav && !route.label)
    expect(unlabelled.map((r) => r.path)).toEqual([])
  })
})

describe('links in the codebase', () => {
  /**
   * The regression this exists for: the footer linked to /about, /blog,
   * /careers, /privacy, /terms and /sitemap, none of which were declared
   * routes. All six rendered the 404 page, and nothing in the build or the
   * test suite noticed.
   */
  it('points every <Link to="/..."> at a declared route', () => {
    const dead: string[] = []

    for (const file of sourceFiles(SRC)) {
      const source = readFileSync(file, 'utf8')
      for (const match of source.matchAll(/\bto="(\/[^"?#]*)[^"]*"/g)) {
        const path = match[1]
        if (!isKnownRoute(path)) dead.push(`${file.replace(`${SRC}/`, '')}: ${path}`)
      }
    }

    expect(dead).toEqual([])
  })

  it('uses the canonical auth paths, not the redirected pair', () => {
    const legacy: string[] = []

    for (const file of sourceFiles(SRC)) {
      if (file.endsWith('routes.ts')) continue // declares the redirects
      const source = readFileSync(file, 'utf8')
      for (const match of source.matchAll(/\bto="(\/login|\/logout)"/g)) {
        legacy.push(`${file.replace(`${SRC}/`, '')}: ${match[1]}`)
      }
    }

    expect(legacy).toEqual([])
  })

  it('keeps the old auth paths alive as redirects', () => {
    // Bookmarks and any link already in the wild have to keep working.
    for (const path of ['/login', '/logout']) {
      const route = ROUTES.find((r) => r.path === path)
      expect(route?.redirectTo, `${path} must redirect`).toBeTruthy()
    }
  })
})

describe('navigation', () => {
  it('builds each nav group from the route table', () => {
    expect(navRoutes('primary').map((r) => r.path)).toEqual(['/build', '/deals', '/support'])
    expect(navRoutes('company').map((r) => r.path)).toContain('/sitemap')
  })

  it('has no nav group left empty', () => {
    for (const group of ['primary', 'shop', 'support', 'service', 'company'] as const) {
      expect(navRoutes(group).length, group).toBeGreaterThan(0)
    }
  })
})

describe('build progress', () => {
  /**
   * Not a threshold to defend — a number to watch fall. It is asserted so that
   * completing a route without removing its `placeholder` flag fails here, and
   * so that the count stays visible in the test output rather than being
   * rediscovered by clicking through the site.
   */
  it('reports how many routes still render shared placeholder content', () => {
    const placeholders = placeholderRoutes().map((r) => r.path).sort()

    expect(placeholders).toEqual([
      '/about',
      '/build',
      '/contact',
      '/deals',
      '/faq',
      '/installation',
      '/privacy',
      '/returns',
      '/shipping',
      '/terms',
      '/track-order',
      '/warranty',
    ])
  })
})
