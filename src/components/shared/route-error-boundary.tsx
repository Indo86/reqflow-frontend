import { Button } from '@/components/ui/button'
export function RouteErrorBoundary() {
  return (
    <main className="mx-auto max-w-3xl space-y-4 px-6 py-12" role="alert">
      <h1 className="text-3xl font-semibold">Something went wrong</h1>
      <p className="text-muted-foreground">Please reload the page and try again.</p>
      <Button onClick={() => window.location.reload()}>Reload page</Button>
    </main>
  )
}
