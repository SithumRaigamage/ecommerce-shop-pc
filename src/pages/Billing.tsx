import { useEffect, useRef } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Form } from '@/components/ui/form'
import { Field } from '@/components/Field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { CheckoutSteps } from '@/components/CheckoutSteps'
import { formatLKR } from '@/lib/format'
import { orderTotals, useCartStore } from '@/store/cart'

const billingSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().min(1, 'Email is required').email('Valid email is required'),
  country: z.string().min(1, 'Country is required'),
  address: z.string().min(1, 'Street address is required'),
  post: z.string().min(1, 'Post code is required'),
  phone: z.string().min(1, 'Phone number is required'),
  paymentMethod: z.enum(['cod', 'card'], {
    required_error: 'Please select a payment method',
  }),
  cardNumber: z.string().optional(),
  terms: z.literal(true, {
    errorMap: () => ({ message: 'You must agree to the terms and conditions' }),
  }),
})

/** Card number becomes required once the card payment method is selected. */
const cardBillingSchema = billingSchema.extend({
  cardNumber: z.string().trim().min(1, 'Card number is required'),
})

type BillingValues = z.infer<typeof billingSchema>

/**
 * Chosen over a `.refine()` on the object: object-level refinements only run
 * after every field-level check has passed, so "Card number is required" stayed
 * hidden until the rest of the form was already valid. Swapping the schema keeps
 * it a field-level rule, surfacing alongside the other errors.
 */
const billingResolver: Resolver<BillingValues> = (values, context, options) => {
  const schema = values.paymentMethod === 'card' ? cardBillingSchema : billingSchema
  return zodResolver(schema)(values, context, options)
}

export default function Billing() {
  const navigate = useNavigate()
  const completeOrder = useCartStore((store) => store.completeOrder)
  const placingOrder = useRef(false)

  // Read from the persisted store rather than router location state, which does
  // not survive a reload — refreshing this page used to show a LKR 0.00 order.
  const items = useCartStore((store) => store.checkoutItems)
  const coupon = useCartStore((store) => store.coupon)
  const { total } = orderTotals(items, coupon)

  const form = useForm<BillingValues>({
    resolver: billingResolver,
    defaultValues: {
      name: '',
      email: '',
      country: '',
      address: '',
      post: '',
      phone: '',
      cardNumber: '',
    },
  })

  const paymentMethod = form.watch('paymentMethod')

  // Keep the conditional card field from holding a stale value.
  useEffect(() => {
    if (paymentMethod !== 'card') form.setValue('cardNumber', '')
  }, [paymentMethod, form])

  const onSubmit = (values: BillingValues) => {
    console.info('Billing submitted', values)
    placingOrder.current = true
    navigate('/thankyou', { replace: true })
    completeOrder()
  }

  // Reached without going through checkout. The ref keeps `completeOrder()`
  // from tripping this guard and bouncing the user away from the confirmation.
  if (items.length === 0 && !placingOrder.current) {
    return <Navigate replace to="/checkout" />
  }

  return (
    <div>
      <CheckoutSteps current={2} />
      <h1 className="sr-only">Billing and payment</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Billing Details</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-stack">
              <Field control={form.control} name="name" label="Full Name" required>
                {(field) => <Input placeholder="Jon Doe" autoComplete="name" {...field} />}
              </Field>
              <Field control={form.control} name="email" label="Email" required>
                {(field) => (
                  <Input
                    type="email"
                    placeholder="example@gmail.com"
                    autoComplete="email"
                    {...field}
                  />
                )}
              </Field>
              <Field control={form.control} name="country" label="Country" required>
                {(field) => (
                  <Input placeholder="Sri Lanka" autoComplete="country-name" {...field} />
                )}
              </Field>
              <Field control={form.control} name="address" label="Street Address" required>
                {(field) => (
                  <Input placeholder="11 Galle Road" autoComplete="street-address" {...field} />
                )}
              </Field>
              <Field control={form.control} name="post" label="Post Code" required>
                {(field) => (
                  <Input
                    inputMode="numeric"
                    placeholder="10100"
                    autoComplete="postal-code"
                    {...field}
                  />
                )}
              </Field>
              <Field control={form.control} name="phone" label="Phone" required>
                {(field) => (
                  <Input
                    inputMode="tel"
                    placeholder="+94 71 234 5678"
                    autoComplete="tel"
                    {...field}
                  />
                )}
              </Field>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Your Order</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-3">
                  {items.map((item) => (
                    <div key={item.product.id}>
                      <div className="grid grid-cols-3 gap-3">
                        <dt className="col-span-2 line-clamp-2 font-medium">{item.product.title}</dt>
                        <dd className="numeric text-right font-medium" data-numeric>
                          {formatLKR(item.product.price * item.quantity)}
                        </dd>
                      </div>
                      <Separator className="mt-3" />
                    </div>
                  ))}
                  <div className="flex justify-between text-lg">
                    <dt className="font-bold">Total</dt>
                    <dd className="numeric font-bold" data-numeric>{formatLKR(total)}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Payment</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-stack">
                <Field
                  control={form.control}
                  name="paymentMethod"
                  label="Payment method"
                  required
                >
                  {(field, control) => (
                    <RadioGroup
                      {...control}
                      onValueChange={field.onChange}
                      value={field.value}
                      className="gap-stack-tight"
                    >
                      <span className="flex items-center gap-3">
                        <RadioGroupItem value="cod" id="pay-cod" />
                        <Label htmlFor="pay-cod">Cash on Delivery</Label>
                      </span>
                      <span className="flex items-center gap-3">
                        <RadioGroupItem value="card" id="pay-card" />
                        <Label htmlFor="pay-card">Debit or Credit Card</Label>
                      </span>
                    </RadioGroup>
                  )}
                </Field>

                {paymentMethod === 'card' && (
                  <Field control={form.control} name="cardNumber" label="Card Number" required>
                    {(field) => (
                      <Input
                        inputMode="numeric"
                        autoComplete="cc-number"
                        placeholder="1234 5678 9012 3456"
                        {...field}
                      />
                    )}
                  </Field>
                )}

                <Field
                  control={form.control}
                  name="terms"
                  label="I have read and agree to the website terms and conditions"
                  required
                  className="flex flex-row-reverse items-start justify-end gap-3"
                >
                  {(field) => (
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  )}
                </Field>

                <Button type="submit" className="w-full" loading={form.formState.isSubmitting}>
                  Pay {total > 0 && formatLKR(total)}
                </Button>
              </CardContent>
            </Card>
          </div>
        </form>
      </Form>
    </div>
  )
}
