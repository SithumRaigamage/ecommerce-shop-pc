import type { ReactNode } from 'react'
import type { Control, FieldPath, FieldValues, ControllerRenderProps } from 'react-hook-form'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
} from '@/components/ui/form'
import { cn } from '@/lib/utils'

interface FieldProps<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>> {
  control: Control<TFieldValues>
  name: TName
  label: string
  /** Helper text, rendered above the error so layout does not jump. */
  description?: string
  /** Marks the label and sets aria-required on the control. */
  required?: boolean
  /** Visually hide the label but keep it for assistive tech. */
  hideLabel?: boolean
  className?: string
  /**
   * `control` carries the id and aria wiring. Simple controls (`Input`,
   * `Textarea`) get it applied automatically by `FormControl`, so spreading
   * `field` alone is enough. Composite Radix controls (`Select`, `RadioGroup`)
   * render their focusable element several layers down, where `FormControl`
   * cannot reach it — those must spread `control` onto the trigger themselves,
   * or the `<label for>` points at nothing and the control is unlabelled.
   */
  children: (
    field: ControllerRenderProps<TFieldValues, TName>,
    control: { id: string; 'aria-required'?: true },
  ) => ReactNode
}

/**
 * Form row layout, defined once: label, control, description, error.
 *
 * Before this, Billing, Support and SignIn each assembled FormItem / FormLabel /
 * FormControl / FormMessage by hand — 14 near-identical blocks that had already
 * drifted (two of them omitted FormDescription entirely, and the required
 * asterisk was hand-written markup in one file and absent in another).
 *
 * The render-prop passes react-hook-form's `field` straight through, so any
 * control works without Field needing to know about it.
 */
export function Field<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>({
  control,
  name,
  label,
  description,
  required = false,
  hideLabel = false,
  className,
  children,
}: FieldProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel className={cn(hideLabel && 'sr-only')}>
            {label}
            {required && (
              <>
                <span aria-hidden="true" className="text-danger-fg">
                  *
                </span>
                <span className="sr-only">(required)</span>
              </>
            )}
          </FormLabel>

          {/*
            `required` is deliberately NOT spread onto the control. Setting the
            native HTML `required` attribute makes the browser block submission
            before react-hook-form runs, so zod never validates and no message is
            ever shown. Requiredness is communicated by the label marker and
            aria-required, and enforced by the schema.
          */}
          <FieldControl field={field} required={required}>
            {children}
          </FieldControl>

          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

/**
 * Sits inside FormItem so it can read the generated control id, and hands it to
 * the render prop. Must be a component rather than inline code: `useFormField`
 * needs the FormItem context, which only exists below this point in the tree.
 */
function FieldControl<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>({
  field,
  required,
  children,
}: {
  field: ControllerRenderProps<TFieldValues, TName>
  required: boolean
  children: (
    field: ControllerRenderProps<TFieldValues, TName>,
    control: { id: string; 'aria-required'?: true },
  ) => ReactNode
}) {
  const { formItemId } = useFormField()
  const control = { id: formItemId, ...(required ? { 'aria-required': true as const } : {}) }

  return <FormControl aria-required={required || undefined}>{children(field, control)}</FormControl>
}
