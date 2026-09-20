import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
export function NotFoundPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="text-muted-foreground">The page you requested does not exist.</p>
      <Button asChild>
        <Link to="/">Return home</Link>
      </Button>
    </section>
  )
}
