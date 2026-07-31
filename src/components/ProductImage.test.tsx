import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { ProductImage } from './ProductImage'

describe('ProductImage', () => {
  it('renders the image with a root-absolute src', () => {
    render(<ProductImage src="assets/products/ps5.png" alt="PlayStation 5" />)
    expect(screen.getByAltText('PlayStation 5')).toHaveAttribute(
      'src',
      '/assets/products/ps5.png',
    )
  })

  it('leaves remote URLs untouched', () => {
    render(<ProductImage src="https://example.com/a.png" alt="Remote" />)
    expect(screen.getByAltText('Remote')).toHaveAttribute('src', 'https://example.com/a.png')
  })

  /** Most catalogue images are dead scraped URLs; they must not render broken. */
  it('falls back to a labelled placeholder when the image fails to load', () => {
    render(<ProductImage src="https://example.com/gone.png" alt="Missing product" />)

    fireEvent.error(screen.getByAltText('Missing product'))

    const placeholder = screen.getByRole('img', { name: 'Missing product' })
    expect(placeholder).toBeInTheDocument()
    expect(placeholder.tagName).not.toBe('IMG')
  })

  it('renders the placeholder immediately when there is no src', () => {
    render(<ProductImage src={undefined} alt="No image" />)
    expect(screen.getByRole('img', { name: 'No image' })).toBeInTheDocument()
  })

  it('retries when the src changes', () => {
    const { rerender } = render(<ProductImage src="https://example.com/gone.png" alt="Product" />)
    fireEvent.error(screen.getByAltText('Product'))
    expect(screen.getByRole('img', { name: 'Product' }).tagName).not.toBe('IMG')

    rerender(<ProductImage src="assets/products/ps5.png" alt="Product" />)
    expect(screen.getByAltText('Product').tagName).toBe('IMG')
  })
})
