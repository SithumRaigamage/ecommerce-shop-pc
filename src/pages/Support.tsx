import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Form, FormLabel } from '@/components/ui/form'
import { Field } from '@/components/Field'
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
          className="sticky top-24 h-150 w-full rounded-xl object-cover"
        />
      </div>

      <div className="order-1">
        <h1 className="mb-4 text-4xl leading-none font-bold md:text-5xl">Technical Support</h1>
        <p className="text-fg-tertiary mb-8 text-xl">
          Get help with your technical issues. We&apos;re here to assist you.
        </p>

        <Card>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-stack">
                <Field control={form.control} name="name" label="Full Name" required>
                  {(field) => <Input placeholder="Full Name" autoComplete="name" {...field} />}
                </Field>

                <Field control={form.control} name="email" label="Email Address" required>
                  {(field) => (
                    <Input
                      type="email"
                      placeholder="Email Address"
                      autoComplete="email"
                      {...field}
                    />
                  )}
                </Field>

                <Field control={form.control} name="issueType" label="Issue Type" required>
                  {(field, control) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger {...control} className="w-full">
                        <SelectValue placeholder="Select Issue Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {ISSUE_TYPES.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </Field>

                <Field
                  control={form.control}
                  name="productModel"
                  label="Product Model Number"
                  description="Printed on the label underneath the unit."
                  required
                >
                  {(field) => <Input placeholder="Product Model Number" {...field} />}
                </Field>

                <Field control={form.control} name="priority" label="Priority Level" required>
                  {(field, control) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger {...control} className="w-full">
                        <SelectValue placeholder="Select Priority Level" />
                      </SelectTrigger>
                      <SelectContent>
                        {PRIORITIES.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </Field>

                <Field control={form.control} name="description" label="Description" required>
                  {(field) => (
                    <Textarea
                      rows={4}
                      placeholder="Detailed Description of the Issue"
                      {...field}
                    />
                  )}
                </Field>

                {/* Not registered with react-hook-form and absent from the schema:
                    these uploads are not captured on submit. Tracked as a known gap. */}
                <div className="grid gap-stack sm:grid-cols-2">
                  <div className="flex flex-col gap-stack-tight">
                    <FormLabel htmlFor="screenshots">Upload Screenshots</FormLabel>
                    <Input id="screenshots" type="file" multiple accept="image/*" />
                  </div>
                  <div className="flex flex-col gap-stack-tight">
                    <FormLabel htmlFor="documents">Upload Related Documents</FormLabel>
                    <Input id="documents" type="file" multiple accept=".pdf,.doc,.docx" />
                  </div>
                </div>

                <div className="text-right">
                  <Button type="submit" size="lg" loading={form.formState.isSubmitting}>
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
