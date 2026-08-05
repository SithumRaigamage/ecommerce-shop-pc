import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CheckoutSteps } from '@/components/CheckoutSteps'

export default function OrderMessage() {
  return (
    <div>
      <CheckoutSteps current={3} />

      <div className="mt-12 flex flex-col items-center rounded-lg border border-border-subtle bg-surface-1 px-6 py-10 text-center md:px-10 md:py-16">
        <div className="inline-flex rounded-full border border-success-border bg-success-bg p-4 text-success-fg">
          <Check className="size-6" aria-hidden="true" />
        </div>
        <h1 className="mt-4 mb-2 font-display text-3xl leading-tight font-semibold text-fg-primary md:text-4xl">
          Your Order is Successful
        </h1>
        <p className="text-fg-tertiary max-w-prose">
          Thanks for shopping with PC Shop. A confirmation email with your order details is on its
          way.
        </p>
        <Button asChild className="mt-12">
          <Link to="/">Back To Home</Link>
        </Button>
      </div>
    </div>
  )
}
