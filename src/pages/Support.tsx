import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

const ISSUE_TYPES = [
  { value: 'hardware', label: 'Hardware Problem' },
  { value: 'software', label: 'Software Issue' },
  { value: 'network', label: 'Network Connection' },
  { value: 'other', label: 'Other' },
]

const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
]

const supportSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().min(1, 'Email is required').email('Valid email is required'),
  issueType: z.string().min(1, 'Please select an issue type'),
  productModel: z.string().min(1, 'Product model is required'),
  priority: z.string().min(1, 'Please select a priority level'),
  description: z.string().min(1, 'Description is required'),
})

type SupportValues = z.infer<typeof supportSchema>

export default function Support() {
  const form = useForm<SupportValues>({
    resolver: zodResolver(supportSchema),
    defaultValues: {
      name: '',
      email: '',
      issueType: '',
      productModel: '',
      priority: '',
      description: '',
    },
  })

  const onSubmit = (values: SupportValues) => {
    console.info('Support ticket submitted', values)
    toast.success('Your ticket has been submitted. We’ll be in touch shortly.')
    form.reset()
  }

  return (
    <div className="grid items-start gap-8 py-6 lg:grid-cols-2">
      <div className="order-2 hidden lg:block">
        <img
          src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1472&q=80"
          alt=""
          className="sticky top-24 h-[600px] w-full rounded-2xl object-cover"
        />
      </div>

      <div className="order-1">
        <h1 className="mb-4 text-4xl leading-none font-bold md:text-5xl">Technical Support</h1>
        <p className="text-muted-foreground mb-8 text-xl">
          Get help with your technical issues. We&apos;re here to assist you.
        </p>

        <Card>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Full Name" autoComplete="name" {...field} />
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
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Email Address"
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
                  name="issueType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issue Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Issue Type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ISSUE_TYPES.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="productModel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Model Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Product Model Number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority Level</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Priority Level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PRIORITIES.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={4}
                          placeholder="Detailed Description of the Issue"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <FormLabel htmlFor="screenshots">Upload Screenshots</FormLabel>
                    <Input id="screenshots" type="file" multiple accept="image/*" />
                  </div>
                  <div className="space-y-2">
                    <FormLabel htmlFor="documents">Upload Related Documents</FormLabel>
                    <Input id="documents" type="file" multiple accept=".pdf,.doc,.docx" />
                  </div>
                </div>

                <div className="text-right">
                  <Button type="submit" size="lg">
                    Submit Ticket
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
