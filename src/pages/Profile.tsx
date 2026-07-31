import { useState } from 'react'
import { Flame, Settings, User } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

const SECTIONS = [
  { id: 'profile', icon: User, label: 'Profile' },
  { id: 'orders', icon: Flame, label: 'Order Stories' },
  { id: 'settings', icon: Settings, label: 'Setting' },
] as const

const EMAIL_PREFERENCES = [
  { id: 'condition1', label: 'PC Shop offers and deals on really cool discounts.', defaultChecked: false },
  { id: 'condition2', label: 'I have an upcoming reservation.', defaultChecked: true },
  { id: 'condition3', label: 'PC Shop has fun company news, as well as periodic emails.', defaultChecked: false },
]

export default function Profile() {
  const [activeSection, setActiveSection] = useState<string>('settings')

  const notImplemented = (what: string) => () => {
    toast.info(`${what} is not wired to a backend yet.`)
  }

  return (
    <div className="grid gap-6 md:grid-cols-12">
      <nav aria-label="Account sections" className="md:col-span-3 lg:col-span-2">
        <Card className="overflow-hidden py-0">
          <ul className="flex md:flex-col">
            {SECTIONS.map(({ id, icon: Icon, label }) => (
              <li key={id} className="flex-1">
                <button
                  type="button"
                  onClick={() => setActiveSection(id)}
                  aria-current={activeSection === id}
                  className={cn(
                    'w-full cursor-pointer px-2 py-6 text-center transition-colors duration-300',
                    activeSection === id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-primary/10',
                  )}
                >
                  <Icon className="mx-auto size-7" aria-hidden="true" />
                  <p className="mt-2 font-bold">{label}</p>
                </button>
              </li>
            ))}
          </ul>
        </Card>
      </nav>

      <div className="md:col-span-9 lg:col-span-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-primary text-3xl md:text-4xl">Account Setting</CardTitle>
          </CardHeader>
          <CardContent className="space-y-10">
            <section>
              <h2 className="text-primary mb-4 text-lg">Change Your Password</h2>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="pEmail">Enter Email</Label>
                  <Input id="pEmail" type="email" autoComplete="email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="old-pass">Old Password</Label>
                  <Input id="old-pass" type="password" autoComplete="current-password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-pass">Enter New Password</Label>
                  <Input id="new-pass" type="password" autoComplete="new-password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="con-new-pass">Confirm New Password</Label>
                  <Input id="con-new-pass" type="password" autoComplete="new-password" />
                </div>
              </div>
              <Button className="mt-6" onClick={notImplemented('Password update')}>
                Update Password
              </Button>
            </section>

            <Separator />

            <section>
              <h2 className="text-primary mb-4 text-lg">Change Your Email</h2>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="current-email">Enter Current Email</Label>
                  <Input id="current-email" type="email" autoComplete="email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-email">New Email</Label>
                  <Input id="new-email" type="email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="con-new-email">Confirm New Email</Label>
                  <Input id="con-new-email" type="email" />
                </div>
              </div>
              <Button className="mt-6" onClick={notImplemented('Email update')}>
                Update Email
              </Button>
            </section>

            <Separator />

            <section>
              <h2 className="text-primary mb-4 font-bold">Send Me Emails When:</h2>
              <div className="space-y-3">
                {EMAIL_PREFERENCES.map((pref) => (
                  <div key={pref.id} className="flex items-center gap-3">
                    <Checkbox id={pref.id} defaultChecked={pref.defaultChecked} />
                    <Label htmlFor={pref.id} className="font-normal">
                      {pref.label}
                    </Label>
                  </div>
                ))}
              </div>
              <Button className="mt-6" onClick={notImplemented('Settings update')}>
                Update All Setting
              </Button>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
