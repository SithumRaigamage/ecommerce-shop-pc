import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <section className="py-24 text-center">
      <p className="numeric text-sm font-semibold text-fg-tertiary" data-numeric>404</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-fg-primary md:text-4xl">Page not found</h1>
      <p className="text-fg-tertiary mt-3">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <Button asChild className="mt-8">
        <Link to="/">Back To Home</Link>
      </Button>
    </section>
  )
}
