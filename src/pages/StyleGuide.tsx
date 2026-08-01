import { useState } from 'react'
import {
  Cpu,
  Gauge,
  HardDrive,
  Monitor,
  Moon,
  PackageSearch,
  Plug,
  SearchX,
  Sun,
  SunMoon,
} from 'lucide-react'
import { toast } from 'sonner'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'

import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { FilterChip } from '@/components/FilterChip'
import { PriceDelta, PriceDisplay } from '@/components/PriceDisplay'
import { PriceSlider } from '@/components/PriceSlider'
import { SpecTable } from '@/components/SpecTable'
import { StatBadge } from '@/components/StatBadge'
import { StockIndicator, type StockState } from '@/components/StockIndicator'
import { useTheme } from '@/hooks/useTheme'
import { BETTER_DIRECTION } from '@/lib/catalogue'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ layout */

function Section({
  id,
  title,
  note,
  children,
}: {
  id: string
  title: string
  note?: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-16 border-t border-border-subtle pt-8">
      <h2 className="font-display text-2xl font-semibold text-fg-primary">{title}</h2>
      {note && <p className="mt-1 max-w-prose text-sm text-fg-tertiary">{note}</p>}
      <div className="mt-stack flex flex-col gap-stack">{children}</div>
    </section>
  )
}

/** One labelled specimen. The label is what makes this a reference, not a demo. */
function Specimen({
  label,
  className,
  children,
}: {
  label: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium tracking-wide text-fg-tertiary uppercase">{label}</span>
      <div className={cn('flex flex-wrap items-center gap-3', className)}>{children}</div>
    </div>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-stack">{children}</div>
}

/* ------------------------------------------------------------------ data */

const SPEC_ROWS = [
  { key: 'socket', label: 'Socket' },
  { key: 'cores', label: 'Cores' },
  { key: 'threads', label: 'Threads' },
  { key: 'tdp', label: 'TDP', unit: 'W' },
  { key: 'boost', label: 'Boost clock', unit: 'GHz' },
]

const COLUMN_A = {
  id: 'a',
  title: 'Ryzen 7 9800X3D',
  values: { socket: 'AM5', cores: 8, threads: 16, tdp: 120, boost: 5.2 },
}
const COLUMN_B = {
  id: 'b',
  title: 'Core i7-14700K',
  values: { socket: 'LGA1700', cores: 20, threads: 28, tdp: 125, boost: 5.6 },
}
const COLUMN_C = {
  id: 'c',
  title: 'Ryzen 5 7600',
  values: { socket: 'AM5', cores: 6, threads: 12, tdp: 65, boost: 5.1 },
}

/** Boost clock is styleguide-only, so its direction is declared here. */
const SG_DIRECTION = { ...BETTER_DIRECTION, boost: 'higher' } as const

const STOCK_STATES: StockState[] = ['in-stock', 'low-stock', 'out-of-stock', 'discontinued']

/* ------------------------------------------------------------------ page */

export default function StyleGuide() {
  const { theme, preference, setPreference } = useTheme()
  const [width, setWidth] = useState<'sm' | 'md' | 'full'>('full')
  const [price, setPrice] = useState(240000)
  const [checked, setChecked] = useState<boolean | 'indeterminate'>(true)
  const [chips, setChips] = useState(['AM5', 'ASUS', 'Under LKR 200,000'])
  const [diffOnly, setDiffOnly] = useState(false)
  // The signature moment is the one thing on the site worth watching twice.
  const [reveal, setReveal] = useState(0)

  const widthClass =
    width === 'sm' ? 'max-w-sm' : width === 'md' ? 'max-w-2xl' : 'max-w-none'

  return (
    <div className="flex flex-col gap-stack pb-section">
      {/* ------------------------------------------------------------ toolbar */}
      <div className="sticky top-16 z-20 flex flex-wrap items-center justify-between gap-stack border-b border-border-subtle bg-bg py-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-fg-primary">Style guide</h1>
          <p className="text-sm text-fg-tertiary">
            Every component, every state. Theme:{' '}
            <span className="numeric" data-numeric>
              {theme}
            </span>{' '}
            (preference: {preference})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-stack-tight">
          <div className="flex items-center gap-1 rounded-md border border-border-subtle bg-surface-2 p-0.5">
            <Button
              size="sm"
              variant={preference === 'light' ? 'secondary' : 'ghost'}
              onClick={() => setPreference('light')}
            >
              <Sun /> Light
            </Button>
            <Button
              size="sm"
              variant={preference === 'dark' ? 'secondary' : 'ghost'}
              onClick={() => setPreference('dark')}
            >
              <Moon /> Dark
            </Button>
            <Button
              size="sm"
              variant={preference === 'system' ? 'secondary' : 'ghost'}
              onClick={() => setPreference('system')}
            >
              <SunMoon /> System
            </Button>
          </div>

          <div className="flex items-center gap-1 rounded-md border border-border-subtle bg-surface-2 p-0.5">
            {(['sm', 'md', 'full'] as const).map((w) => (
              <Button
                key={w}
                size="sm"
                variant={width === w ? 'secondary' : 'ghost'}
                onClick={() => setWidth(w)}
              >
                {w === 'sm' ? '384px' : w === 'md' ? '672px' : 'Full'}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className={cn('flex flex-col gap-section', widthClass)}>
        {/* ---------------------------------------------------------- colour */}
        <Section
          id="tokens"
          title="Tokens"
          note="Semantic layer only. Components never reference a ramp step."
        >
          <Specimen label="Surfaces">
            {(['bg', 'surface-1', 'surface-2', 'surface-3'] as const).map((s) => (
              <div key={s} className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    'size-16 rounded-md border border-border-default',
                    s === 'bg' && 'bg-bg',
                    s === 'surface-1' && 'bg-surface-1',
                    s === 'surface-2' && 'bg-surface-2',
                    s === 'surface-3' && 'bg-surface-3',
                  )}
                />
                <span className="text-xs text-fg-tertiary">{s}</span>
              </div>
            ))}
          </Specimen>

          <Specimen label="Foreground">
            <span className="text-fg-primary">fg-primary</span>
            <span className="text-fg-secondary">fg-secondary</span>
            <span className="text-fg-tertiary">fg-tertiary</span>
            <span className="text-fg-disabled">fg-disabled</span>
          </Specimen>

          <Specimen label="Accent + status">
            <span className="text-accent-default">accent-default</span>
            <span className="text-success-fg">success-fg</span>
            <span className="text-warning-fg">warning-fg</span>
            <span className="text-danger-fg">danger-fg</span>
          </Specimen>

          <Specimen label="Elevation">
            {([1, 2, 3] as const).map((level) => (
              <div
                key={level}
                className={cn(
                  'flex size-24 items-center justify-center rounded-lg border text-xs text-fg-tertiary',
                  level === 1 && 'elevation-1',
                  level === 2 && 'elevation-2',
                  level === 3 && 'elevation-3',
                )}
              >
                elevation-{level}
              </div>
            ))}
          </Specimen>

          <Specimen label="Type scale">
            <div className="flex w-full flex-col gap-1">
              {(
                [
                  ['text-5xl', 'Display 48'],
                  ['text-4xl', 'Page title 36'],
                  ['text-3xl', 'Section head 28'],
                  ['text-2xl', 'Subhead 22'],
                  ['text-xl', 'Card title 18'],
                  ['text-lg', 'Body long-form 16'],
                  ['text-base', 'UI default 14'],
                  ['text-sm', 'Secondary 12'],
                  ['text-xs', 'Micro 11'],
                ] as const
              ).map(([cls, name]) => (
                <div key={cls} className="flex items-baseline gap-4">
                  <span className="w-24 shrink-0 text-xs text-fg-tertiary">{cls}</span>
                  <span
                    className={cn(
                      'truncate font-display text-fg-primary',
                      cls === 'text-5xl' && 'text-5xl',
                      cls === 'text-4xl' && 'text-4xl',
                      cls === 'text-3xl' && 'text-3xl',
                      cls === 'text-2xl' && 'text-2xl',
                      cls === 'text-xl' && 'text-xl',
                      cls === 'text-lg' && 'text-lg',
                      cls === 'text-base' && 'text-base',
                      cls === 'text-sm' && 'text-sm',
                      cls === 'text-xs' && 'text-xs',
                    )}
                  >
                    {name}
                  </span>
                </div>
              ))}
            </div>
          </Specimen>
        </Section>

        {/* ---------------------------------------------------------- button */}
        <Section
          id="button"
          title="Button"
          note="Six states per variant: default, hover, active, focus-visible, disabled, loading. Tab through to see the focus ring."
        >
          {(['default', 'secondary', 'outline', 'ghost', 'destructive', 'link'] as const).map(
            (variant) => (
              <Specimen key={variant} label={variant}>
                <Button variant={variant}>Default</Button>
                <Button variant={variant} disabled>
                  Disabled
                </Button>
                <Button variant={variant} loading>
                  Loading
                </Button>
                <Button variant={variant} size="sm">
                  Small
                </Button>
                <Button variant={variant} size="lg">
                  Large
                </Button>
              </Specimen>
            ),
          )}

          <Specimen label="icon / icon-sm">
            <Button size="icon" aria-label="Cooling">
              <Gauge />
            </Button>
            <Button size="icon" variant="outline" aria-label="Processor">
              <Cpu />
            </Button>
            <Button size="icon-sm" variant="ghost" aria-label="Storage">
              <HardDrive />
            </Button>
            <Button size="icon" variant="secondary" disabled aria-label="Disabled">
              <Plug />
            </Button>
          </Specimen>
        </Section>

        {/* ------------------------------------------------------------ card */}
        <Section id="card" title="Card" note="Elevation is a prop, never ad-hoc classes.">
          <div className="grid gap-stack sm:grid-cols-2 lg:grid-cols-3">
            {([1, 2, 3] as const).map((level) => (
              <Card key={level} elevation={level}>
                <CardHeader>
                  <CardTitle>Elevation {level}</CardTitle>
                  <CardDescription>Surface + border + top highlight</CardDescription>
                  <CardAction>
                    <StatBadge label="TDP" value={120} unit="W" />
                  </CardAction>
                </CardHeader>
                <CardContent className="text-sm text-fg-secondary">
                  Dark UI gets depth from surface lightness, not drop shadows.
                </CardContent>
              </Card>
            ))}
            <Card interactive>
              <CardHeader>
                <CardTitle>Interactive</CardTitle>
                <CardDescription>Hover and focus states</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </Section>

        {/* ----------------------------------------------------------- forms */}
        <Section
          id="forms"
          title="Form controls"
          note="Every control shows default, hover, focus, disabled and loading. Invalid is driven by aria-invalid."
        >
          <div className="grid gap-stack sm:grid-cols-2">
            <Row>
              <Specimen label="Input" className="flex-col items-stretch">
                <Input placeholder="Default" />
                <Input placeholder="Invalid" aria-invalid />
                <Input placeholder="Disabled" disabled />
                <Input placeholder="Loading" loading />
              </Specimen>

              <Specimen label="Textarea" className="flex-col items-stretch">
                <Textarea placeholder="Default" rows={2} />
                <Textarea placeholder="Disabled" rows={2} disabled />
                <Textarea placeholder="Loading" rows={2} loading />
              </Specimen>
            </Row>

            <Row>
              <Specimen label="Select" className="flex-col items-start">
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a socket" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="am5">AM5</SelectItem>
                    <SelectItem value="lga1700">LGA1700</SelectItem>
                    <SelectItem value="am4">AM4</SelectItem>
                  </SelectContent>
                </Select>
                <Select disabled>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Disabled" />
                  </SelectTrigger>
                  <SelectContent />
                </Select>
                <Select>
                  <SelectTrigger loading className="w-full">
                    <SelectValue placeholder="Loading" />
                  </SelectTrigger>
                  <SelectContent />
                </Select>
              </Specimen>

              <Specimen label="Checkbox">
                <span className="flex items-center gap-2">
                  <Checkbox
                    id="sg-cb1"
                    checked={checked}
                    onCheckedChange={(v) => setChecked(v)}
                  />
                  <Label htmlFor="sg-cb1">Interactive</Label>
                </span>
                <span className="flex items-center gap-2">
                  <Checkbox id="sg-cb2" checked="indeterminate" />
                  <Label htmlFor="sg-cb2">Indeterminate</Label>
                </span>
                <span className="flex items-center gap-2">
                  <Checkbox id="sg-cb3" disabled />
                  <Label htmlFor="sg-cb3">Disabled</Label>
                </span>
                <span className="flex items-center gap-2">
                  <Skeleton className="size-4 rounded-xs" />
                  <span className="text-sm text-fg-tertiary">Loading</span>
                </span>
              </Specimen>

              <Specimen label="RadioGroup" className="flex-col items-start">
                <RadioGroup defaultValue="a">
                  <span className="flex items-center gap-2">
                    <RadioGroupItem value="a" id="sg-r1" />
                    <Label htmlFor="sg-r1">Selected</Label>
                  </span>
                  <span className="flex items-center gap-2">
                    <RadioGroupItem value="b" id="sg-r2" />
                    <Label htmlFor="sg-r2">Unselected</Label>
                  </span>
                  <span className="flex items-center gap-2">
                    <RadioGroupItem value="c" id="sg-r3" disabled />
                    <Label htmlFor="sg-r3">Disabled</Label>
                  </span>
                </RadioGroup>
              </Specimen>
            </Row>
          </div>

          <Specimen label="PriceSlider" className="flex-col items-stretch">
            <PriceSlider
              min={0}
              max={500000}
              step={5000}
              value={price}
              onValueChange={setPrice}
              label="Maximum price"
              valueText={`LKR ${price.toLocaleString()}`}
            />
            <PriceSlider
              min={0}
              max={500000}
              value={200000}
              onValueChange={() => {}}
              label="Disabled slider"
              disabled
            />
            <Skeleton className="h-1.5 w-full rounded-full" />
          </Specimen>
        </Section>

        {/* -------------------------------------------------------- overlays */}
        <Section id="overlays" title="Overlays and navigation">
          <Specimen label="Tabs — solid / underline" className="flex-col items-stretch">
            <Tabs defaultValue="specs">
              <TabsList>
                <TabsTrigger value="specs">Specifications</TabsTrigger>
                <TabsTrigger value="compat">Compatibility</TabsTrigger>
                <TabsTrigger value="none" disabled>
                  Disabled
                </TabsTrigger>
              </TabsList>
              <TabsContent value="specs" className="text-sm text-fg-secondary">
                Solid variant — a segmented control.
              </TabsContent>
              <TabsContent value="compat" className="text-sm text-fg-secondary">
                Second panel.
              </TabsContent>
            </Tabs>

            <Tabs defaultValue="a">
              <TabsList variant="underline">
                <TabsTrigger value="a">Overview</TabsTrigger>
                <TabsTrigger value="b">Reviews</TabsTrigger>
                <TabsTrigger value="c" disabled>
                  Disabled
                </TabsTrigger>
              </TabsList>
              <TabsContent value="a" className="text-sm text-fg-secondary">
                Underline variant — page-level tabs.
              </TabsContent>
              <TabsContent value="b" className="text-sm text-fg-secondary">
                Second panel.
              </TabsContent>
            </Tabs>
          </Specimen>

          <Specimen label="Accordion" className="flex-col items-stretch">
            <Accordion type="single" collapsible>
              <AccordionItem value="1">
                <AccordionTrigger>Does this board support DDR5?</AccordionTrigger>
                <AccordionContent>
                  Yes — all AM5 boards are DDR5 only. DDR4 kits are not compatible.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="2">
                <AccordionTrigger>What is the warranty period?</AccordionTrigger>
                <AccordionContent>Three years, handled by the manufacturer.</AccordionContent>
              </AccordionItem>
            </Accordion>
          </Specimen>

          <Specimen label="DropdownMenu / Sheet / Toast">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Open menu</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                <DropdownMenuItem>
                  Price, low to high <DropdownMenuShortcut>⌘1</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Price, high to low <DropdownMenuShortcut>⌘2</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>Relevance (unavailable)</DropdownMenuItem>
                <DropdownMenuItem variant="destructive">Clear all filters</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">Open sheet</Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="px-card-padding">
                  <p className="text-sm text-fg-secondary">Sheet uses elevation 3.</p>
                </div>
              </SheetContent>
            </Sheet>

            <Button variant="outline" onClick={() => toast.success('Added to cart')}>
              Success toast
            </Button>
            <Button variant="outline" onClick={() => toast.error('Out of stock')}>
              Error toast
            </Button>
          </Specimen>

          <Specimen label="Separator / Spinner / Skeleton" className="flex-col items-stretch">
            <Separator />
            <div className="flex items-center gap-4">
              <Spinner />
              <Spinner className="size-6 text-accent-default" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="size-8 rounded-full" />
            </div>
          </Specimen>
        </Section>

        {/* ---------------------------------------------------------- domain */}
        <Section
          id="price"
          title="PriceDisplay"
          note="Monospace, tabular figures. Price is information, not an affordance — never accent-coloured."
        >
          <Specimen label="Sizes" className="flex-col items-start">
            <PriceDisplay value={1499000} size="xl" />
            <PriceDisplay value={197000} size="lg" />
            <PriceDisplay value={85000} />
            <PriceDisplay value={12000} size="sm" />
          </Specimen>

          <Specimen label="Compare-at and delta" className="flex-col items-start">
            <PriceDisplay value={52000} compareAt={58000} />
            <PriceDisplay value={52000} compareAt={58000} showDelta />
            <span className="flex items-center gap-4">
              <PriceDelta value={-6000} />
              <PriceDelta value={12500} />
              <PriceDelta value={0} />
            </span>
          </Specimen>

          <Specimen label="Column alignment" className="flex-col items-stretch">
            <div className="flex w-48 flex-col gap-1 rounded-md border border-border-subtle bg-surface-1 p-3">
              {[1499000, 197000, 85000, 12000].map((v) => (
                <PriceDisplay key={v} value={v} size="sm" className="justify-end" />
              ))}
            </div>
          </Specimen>
        </Section>

        <Section
          id="statbadge"
          title="StatBadge"
          note="One spec, compactly. Always label + value — a bare “16GB” is ambiguous on a card listing both VRAM and system memory."
        >
          <Specimen label="Default / small">
            <StatBadge label="VRAM" value={32} unit="GB" icon={Monitor} />
            <StatBadge label="Socket" value="AM5" icon={Cpu} />
            <StatBadge label="TDP" value={575} unit="W" icon={Plug} />
            <StatBadge label="Length" value={358} unit="mm" size="sm" />
            <StatBadge label="Read" value={7450} unit="MB/s" size="sm" icon={HardDrive} />
          </Specimen>
        </Section>

        <Section
          id="stock"
          title="StockIndicator"
          note="Stock is an enum with one rendering per state. Icon carries the state as well as colour."
        >
          <Specimen label="Text variant">
            {STOCK_STATES.map((s) => (
              <StockIndicator key={s} state={s} quantity={3} />
            ))}
          </Specimen>
          <Specimen label="Pill variant">
            {STOCK_STATES.map((s) => (
              <StockIndicator key={s} state={s} variant="pill" quantity={3} />
            ))}
          </Specimen>
          <Specimen label="Small">
            {STOCK_STATES.map((s) => (
              <StockIndicator key={s} state={s} size="sm" variant="pill" quantity={2} />
            ))}
          </Specimen>
        </Section>

        <Section
          id="spectable"
          title="SpecTable"
          note="The core component. Values are monospace with units in their own aligned column, so a column of figures scans vertically. In diff mode it carries the site's one piece of signature motion: rows resolve 25ms apart, agreeing rows recede to muted, and the better value is marked once its row is readable."
        >
          <Specimen label="Single product" className="flex-col items-stretch">
            <SpecTable rows={SPEC_ROWS} columns={[COLUMN_A]} caption="Specifications" />
          </Specimen>

          <Specimen label="Comparison with diff" className="flex-col items-stretch">
            <div className="flex items-center gap-2">
              <Checkbox
                id="sg-diffonly"
                checked={diffOnly}
                onCheckedChange={(v) => setDiffOnly(v === true)}
              />
              <Label htmlFor="sg-diffonly">Show differences only</Label>
              <Button variant="outline" size="sm" onClick={() => setReveal((n) => n + 1)}>
                Replay reveal
              </Button>
            </div>
            <SpecTable
              rows={SPEC_ROWS}
              columns={[COLUMN_A, COLUMN_B, COLUMN_C]}
              diff
              diffOnly={diffOnly}
              betterDirection={SG_DIRECTION}
              revealKey={`sg-${reveal}-${diffOnly}`}
              caption="Processor comparison"
            />
          </Specimen>
        </Section>

        <Section id="filterchip" title="FilterChip">
          <Specimen label="Removable">
            {chips.map((c) => (
              <FilterChip
                key={c}
                label="Filter"
                value={c}
                onRemove={() => setChips((prev) => prev.filter((x) => x !== c))}
              />
            ))}
            {chips.length === 0 && (
              <Button variant="outline" size="sm" onClick={() => setChips(['AM5', 'ASUS'])}>
                Reset chips
              </Button>
            )}
          </Specimen>
          <Specimen label="Disabled / loading">
            <FilterChip value="Disabled" onRemove={() => {}} disabled />
            <FilterChip value="Removing" onRemove={() => {}} loading />
            <FilterChip value="No label" onRemove={() => {}} />
          </Specimen>
        </Section>

        <Section
          id="states"
          title="EmptyState and ErrorState"
          note="Same shape, different semantics: ErrorState is role=alert because it reports a failure the user did not ask for."
        >
          <div className="grid gap-stack lg:grid-cols-2">
            <Card>
              <EmptyState
                icon={SearchX}
                title="No products match these filters"
                description="Try widening the price range or clearing a facet."
                action={<Button size="sm">Clear filters</Button>}
                secondaryAction={
                  <Button size="sm" variant="ghost">
                    Browse all
                  </Button>
                }
              />
            </Card>
            <Card>
              <ErrorState
                description="Products could not be loaded. The catalogue service did not respond."
                onRetry={() => toast.info('Retrying…')}
              />
            </Card>
            <Card>
              <EmptyState
                icon={PackageSearch}
                size="sm"
                title="Your cart is empty"
                description="Small variant, for panels and sheets."
              />
            </Card>
            <Card>
              <ErrorState size="sm" description="Retry in flight." onRetry={() => {}} retrying />
            </Card>
          </div>
        </Section>
      </div>
    </div>
  )
}
