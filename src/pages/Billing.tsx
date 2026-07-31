import { useEffect, useRef } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
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
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Full Name <span className="text-primary">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Jon Doe" autoComplete="name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Email <span className="text-primary">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="example@gmail.com"
                        autoComplete="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Country <span className="text-primary">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Sri Lanka" autoComplete="country-name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Street Address <span className="text-primary">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="11 Galle Road" autoComplete="street-address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="post"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Post Code <span className="text-primary">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input inputMode="numeric" placeholder="10100" autoComplete="postal-code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Phone <span className="text-primary">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input inputMode="tel" placeholder="+94 71 234 5678" autoComplete="tel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                        <dd className="text-right font-medium">
                          {formatLKR(item.product.price * item.quantity)}
                        </dd>
                      </div>
                      <Separator className="mt-3" />
                    </div>
                  ))}
                  <div className="flex justify-between text-lg">
                    <dt className="font-bold">Total</dt>
                    <dd className="font-bold">{formatLKR(total)}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="gap-3"
                        >
                          <FormItem className="flex items-center gap-3">
                            <FormControl>
                              <RadioGroupItem value="cod" />
                            </FormControl>
                            <FormLabel className="font-medium">Cash on Delivery</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center gap-3">
                            <FormControl>
                              <RadioGroupItem value="card" />
                            </FormControl>
                            <FormLabel className="font-medium">Debit or Credit Card</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {paymentMethod === 'card' && (
                  <FormField
                    control={form.control}
                    name="cardNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Card Number <span className="text-primary">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            inputMode="numeric"
                            autoComplete="cc-number"
                            placeholder="1234 5678 9012 3456"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="terms"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-start gap-3">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          I have read and agree to the website terms and conditions *
                        </FormLabel>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full">
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
