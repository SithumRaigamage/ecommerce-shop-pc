import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Form } from '@/components/ui/form'
import { Field } from '@/components/Field'
import { Input } from '@/components/ui/input'

const signInSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean(),
})

type SignInValues = z.infer<typeof signInSchema>

export default function SignIn() {
  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '', rememberMe: true },
  })

  const onSubmit = (values: SignInValues) => {
    console.info('Sign in submitted', values)
    toast.info('Sign-in is not wired to a backend yet.')
  }

  return (
    // The decorative half of this layout was a hotlink to a third-party CDN.
    // A sign-in form does not need a stock photograph beside it; centred and
    // alone is both honest and calmer.
    <div className="flex items-center justify-center py-12">
      <Card className="mx-auto w-full max-w-md">
        <CardContent>
          <h1 className="mb-3 text-3xl font-bold">Welcome to PC Shop</h1>
          <div className="text-fg-tertiary mb-8 flex items-center gap-2 text-sm">
            <span>Don&apos;t have an account?</span>
            <a href="#" className="focus-ring rounded-xs text-accent-default hover:underline">
              Create Account
            </a>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <Field control={form.control} name="email" label="Email Address" required>
                {(field) => (
                  <Input
                    type="email"
                    placeholder="Enter Email Address"
                    autoComplete="email"
                    {...field}
                  />
                )}
              </Field>
              <Field control={form.control} name="password" label="Password" required>
                {(field) => (
                  <Input
                    type="password"
                    placeholder="Enter Password"
                    autoComplete="current-password"
                    {...field}
                  />
                )}
              </Field>
              <Field
                control={form.control}
                name="rememberMe"
                label="Remember me"
                className="flex flex-row-reverse items-center justify-end gap-2"
              >
                {(field) => (
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                )}
              </Field>

              <Button type="submit" className="w-full">
                Log In
                <ArrowRight />
              </Button>
              <Button type="button" variant="ghost" className="w-full">
                Forgot your password?
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
