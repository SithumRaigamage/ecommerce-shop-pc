import { Link } from 'react-router-dom'
import { Facebook, Instagram, Laptop, Twitter } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { navRoutes } from '@/routes'

/**
 * Generated from the route table, so a link can no longer point at a path that
 * does not exist. Every one of /about, /privacy, /terms and /sitemap used to be
 * hard-coded here and declared nowhere, and /blog and /careers were promising
 * pages this project has no intention of building.
 */
const FOOTER_SECTIONS = [
  { title: 'Shop', links: navRoutes('shop') },
  { title: 'Services', links: navRoutes('support') },
  { title: 'Support', links: navRoutes('service') },
  { title: 'Company', links: navRoutes('company') },
]

const PAYMENT_METHODS = [
  { src: '/assets/payment-methods/visa-logo-svgrepo-com.svg', alt: 'Visa' },
  { src: '/assets/payment-methods/mastercard-svgrepo-com.svg', alt: 'Mastercard' },
  { src: '/assets/payment-methods/stripe-svgrepo-com.svg', alt: 'Stripe' },
  { src: '/assets/payment-methods/paypal-svgrepo-com.svg', alt: 'PayPal' },
]

const SOCIALS = [
  { icon: Facebook, label: 'Facebook' },
  { icon: Twitter, label: 'Twitter' },
  { icon: Instagram, label: 'Instagram' },
]

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border-subtle bg-bg pt-12 lg:pt-16">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid grid-cols-12 gap-y-8 lg:gap-12">
          <div className="col-span-12 xl:order-2 xl:col-span-3">
            <Link to="/" className="flex items-center gap-2">
              <Laptop className="size-7 text-fg-primary" aria-hidden="true" />
              <span className="text-xl font-bold">PC Shop</span>
            </Link>
            <p className="text-fg-tertiary mt-4 text-sm">
              Your one-stop destination for premium PC hardware and custom builds.
            </p>
            <div className="mt-4 flex gap-4">
              {SOCIALS.map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="text-fg-tertiary hover:text-accent-default transition-colors"
                >
                  <Icon className="size-5" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          <nav aria-label="Footer" className="col-span-12 xl:order-1 xl:col-span-9">
            <ul className="grid grid-cols-12 gap-y-8 sm:gap-8 lg:gap-12">
              {FOOTER_SECTIONS.map((section) => (
                <li key={section.title} className="col-span-12 sm:col-span-6 lg:col-span-3">
                  <h4 className="mb-3 font-semibold lg:mb-5 lg:text-xl">{section.title}</h4>
                  <ul className="grid gap-2 lg:gap-3">
                    {section.links.map((link) => (
                      <li key={`${section.title}-${link.label}`}>
                        <Link
                          to={link.path}
                          className="text-fg-tertiary hover:text-fg-primary text-sm hover:underline"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <Separator className="mt-8 lg:mt-12" />

        <div className="flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:py-6">
          <div className="text-fg-tertiary flex flex-wrap gap-4 text-sm">
            <span>&copy; {new Date().getFullYear()} PC Shop. All rights reserved.</span>
            <Link to="/privacy" className="hover:text-accent-default">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-accent-default">
              Terms
            </Link>
            <Link to="/sitemap" className="hover:text-accent-default">
              Sitemap
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {PAYMENT_METHODS.map((method) => (
              <img key={method.alt} src={method.src} alt={method.alt} className="h-8" />
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
