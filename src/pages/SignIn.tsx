import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
    <div className="grid items-center gap-8 py-12 lg:grid-cols-2">
      <div className="order-2 hidden lg:block">
        <img
          src="https://cdn.easyfrontend.com/pictures/sign-in-up/sign3.jpg"
          alt=""
          className="h-140 w-full rounded-2xl object-cover"
        />
      </div>

      <Card className="order-1 mx-auto w-full max-w-md">
        <CardContent>
          <h1 className="mb-3 text-3xl font-bold">Welcome to PC Shop</h1>
          <div className="text-muted-foreground mb-8 flex items-center gap-2 text-sm">
            <span>Don&apos;t have an account?</span>
            <a href="#" className="text-primary hover:underline">
              Create Account
            </a>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter Email Address"
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
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter Password"
                        autoComplete="current-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="font-normal">Remember me</FormLabel>
                  </FormItem>
                )}
              />

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
