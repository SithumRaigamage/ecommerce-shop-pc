import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { ProductImage } from './ProductImage'
import { ThemeProvider } from './ThemeProvider'

// The shipped manifest is empty until imagery is licensed, so the built-asset
// paths are exercised against a fixture rather than against production data.
vi.mock('@/lib/media-manifest.json', () => ({
  default: {
    generated: 'test',
    products: {
      'alpha-part': {
        base: '/assets/products/build',
        widths: [400, 800, 1600],
        formats: ['avif', 'webp'],
        themed: false,
        lqip: 'data:image/webp;base64,AAAA',
      },
      'opaque-part': {
        base: '/assets/products/build',
        widths: [400, 800],
        formats: ['avif', 'webp'],
        themed: true,
        lqip: null,
      },
    },
  },
}))

function renderImage(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>)
}

const SIZES = '(min-width: 640px) 45vw, 92vw'

describe('ProductImage', () => {
  it('serves AVIF and WebP at every built width with the given sizes', () => {
    renderImage(<ProductImage assetId="alpha-part" alt="Alpha" sizes={SIZES} />)

    const img = screen.getByAltText('Alpha')
    const sources = img.closest('picture')!.querySelectorAll('source')

    expect([...sources].map((s) => s.type)).toEqual(['image/avif', 'image/webp'])
    expect(sources[0].getAttribute('srcset')).toBe(
      '/assets/products/build/alpha-part-400.avif 400w, ' +
        '/assets/products/build/alpha-part-800.avif 800w, ' +
        '/assets/products/build/alpha-part-1600.avif 1600w',
    )
    for (const source of sources) expect(source.getAttribute('sizes')).toBe(SIZES)
  })

  it('reserves the box before the bytes arrive', () => {
    renderImage(<ProductImage assetId="alpha-part" alt="Alpha" sizes={SIZES} />)

    const img = screen.getByAltText('Alpha')
    // Without both, the page reflows as each image lands.
    expect(img).toHaveAttribute('width', '800')
    expect(img).toHaveAttribute('height', '800')
    expect(img).toHaveAttribute('loading', 'lazy')
  })

  it('loads above-the-fold imagery eagerly when asked', () => {
    renderImage(<ProductImage assetId="alpha-part" alt="Alpha" sizes={SIZES} priority />)
    expect(screen.getByAltText('Alpha')).toHaveAttribute('loading', 'eager')
  })

  it('picks the theme variant only for assets built per theme', () => {
    renderImage(<ProductImage assetId="opaque-part" alt="Opaque" sizes={SIZES} />)

    const srcset = screen
      .getByAltText('Opaque')
      .closest('picture')!
      .querySelector('source')!
      .getAttribute('srcset')

    // ThemeProvider resolves to dark by default in this environment.
    expect(srcset).toContain('opaque-part-dark-400.avif 400w')
    expect(srcset).not.toContain('opaque-part-400.avif')
  })

  it('blurs up from the inlined LQIP', () => {
    renderImage(<ProductImage assetId="alpha-part" alt="Alpha" sizes={SIZES} />)

    const wrapper = screen.getByAltText('Alpha').closest('div')!
    expect(wrapper.style.backgroundImage).toContain('data:image/webp;base64,AAAA')
  })

  it('renders the designed placeholder when a product has no built imagery', () => {
    renderImage(
      <ProductImage assetId="not-built" alt="Unbuilt" category="graphics" mpn="RTX-1234" sizes={SIZES} />,
    )

    const placeholder = screen.getByRole('img', { name: 'Unbuilt' })
    expect(placeholder.tagName).not.toBe('IMG')
    // Designed, not broken: it names the part it is standing in for.
    expect(placeholder).toHaveTextContent('RTX-1234')
  })

  it('falls back to the designed placeholder when a built asset fails to load', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    renderImage(<ProductImage assetId="alpha-part" alt="Alpha" mpn="MPN-1" sizes={SIZES} />)

    fireEvent.error(screen.getByAltText('Alpha'))

    const placeholder = screen.getByRole('img', { name: 'Alpha' })
    expect(placeholder.tagName).not.toBe('IMG')
    // A manifest entry that will not load is a broken build, not a missing
    // photo, so it must not be absorbed silently.
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('alpha-part'))
    warn.mockRestore()
  })

  it('renders the placeholder immediately when there is no asset id', () => {
    renderImage(<ProductImage assetId={undefined} alt="No image" sizes={SIZES} />)
    expect(screen.getByRole('img', { name: 'No image' })).toBeInTheDocument()
  })

  it('retries when the asset changes', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { rerender } = renderImage(
      <ProductImage assetId="alpha-part" alt="Product" sizes={SIZES} />,
    )
    fireEvent.error(screen.getByAltText('Product'))
    expect(screen.getByRole('img', { name: 'Product' }).tagName).not.toBe('IMG')

    rerender(
      <ThemeProvider>
        <ProductImage assetId="opaque-part" alt="Product" sizes={SIZES} />
      </ThemeProvider>,
    )
    expect(screen.getByAltText('Product').tagName).toBe('IMG')
    warn.mockRestore()
  })
})
