import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PriceSlider } from './PriceSlider'

function renderSlider(overrides: Partial<Parameters<typeof PriceSlider>[0]> = {}) {
  const onValueChange = vi.fn()
  render(
    <PriceSlider
      min={0}
      max={100}
      step={10}
      value={50}
      onValueChange={onValueChange}
      label="Maximum price"
      {...overrides}
    />,
  )
  return { onValueChange }
}

describe('PriceSlider', () => {
  /**
   * The regression this guards: Radix puts role="slider" on the thumb, so a
   * label on the Root leaves the control unnamed for assistive tech.
   */
  it('puts the accessible name on the element carrying role="slider"', () => {
    renderSlider()
    expect(screen.getByRole('slider', { name: 'Maximum price' })).toBeInTheDocument()
  })

  it('exposes the current value and bounds', () => {
    renderSlider()
    const thumb = screen.getByRole('slider', { name: 'Maximum price' })
    expect(thumb).toHaveAttribute('aria-valuenow', '50')
    expect(thumb).toHaveAttribute('aria-valuemin', '0')
    expect(thumb).toHaveAttribute('aria-valuemax', '100')
  })

  it('announces a human-readable value when given one', () => {
    renderSlider({ valueText: 'LKR 50.00' })
    expect(screen.getByRole('slider', { name: 'Maximum price' })).toHaveAttribute(
      'aria-valuetext',
      'LKR 50.00',
    )
  })

  it('is keyboard operable', async () => {
    const user = userEvent.setup()
    const { onValueChange } = renderSlider()

    await user.tab()
    expect(screen.getByRole('slider', { name: 'Maximum price' })).toHaveFocus()

    await user.keyboard('{ArrowRight}')
    expect(onValueChange).toHaveBeenCalledWith(60)

    await user.keyboard('{Home}')
    expect(onValueChange).toHaveBeenLastCalledWith(0)
  })
})
