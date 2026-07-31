import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CheckoutSteps } from '@/components/CheckoutSteps'

export default function OrderMessage() {
  return (
    <div>
      <CheckoutSteps current={3} />

      <div className="bg-muted/40 mt-12 flex flex-col items-center rounded-md px-6 py-10 text-center md:px-10 md:py-16">
        <div className="text-primary border-primary inline-flex rounded-full border p-4">
          <Check className="size-6" aria-hidden="true" />
        </div>
        <h1 className="mt-4 mb-2 text-3xl leading-tight font-medium md:text-4xl">
          Your Order is Successful
        </h1>
        <p className="text-muted-foreground max-w-prose">
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
