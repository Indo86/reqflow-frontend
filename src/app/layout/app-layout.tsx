import { Outlet } from 'react-router-dom'
export function AppLayout() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-background"
      >
        Skip to content
      </a>
      <main id="main-content" tabIndex={-1} className="min-h-svh">
        <Outlet />
      </main>
    </div>
  )
}
