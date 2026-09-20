# ReqFlow frontend

F0 establishes infrastructure only. The next milestone is **F1 Authentication & App Shell**.
There are no authentication/session requests, protected routes, business pages, or final navigation.

## Setup and commands

Use Node.js 24.15+ (24.x), 22.22.2+ (22.x), or 26+ and npm; the test stack sets this minimum. This foundation was verified with Node 24.20.0 and npm 11.0.0.

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Set the actual backend address before starting. The example is `http://localhost:3000`; it is not an application fallback.

| Command             | Purpose                                                     |
| ------------------- | ----------------------------------------------------------- |
| `npm run dev`       | Local Vite development server                               |
| `npm test`          | Vitest watch mode                                           |
| `npm run test:run`  | Non-interactive tests                                       |
| `npm run lint`      | ESLint                                                      |
| `npm run typecheck` | Strict TypeScript for source, tests, and Vite configuration |
| `npm run build`     | Typecheck and production build                              |
| `npm run preview`   | Preview the local production build                          |

Prettier and its existing configuration are preserved. Run `npm exec -- prettier --check src *.json *.ts *.js README.md` when checking formatting.
Build output, coverage, node_modules, and local environment files are ignored; `.env.example` remains tracked.

## Stack

React 19, TypeScript 6, Vite 8, React Router 7, TanStack Query 5, React Hook Form 7,
Zod 4 and its resolver, Tailwind CSS 4 with the Vite plugin, shadcn/ui Button,
Radix Slot, and Lucide React. Tests use Vitest, jsdom, React Testing Library, and jest-dom.
The required stack already existed in part; unrelated dependencies were not deliberately upgraded.

## Environment

`src/lib/env` is the only application environment boundary. Zod validates
`VITE_API_BASE_URL` as an absolute HTTP(S) backend URL, optionally including a path
prefix such as `https://example.test/api`. Credentials, query strings, and fragments
are rejected. Trailing slashes are normalized. Missing or invalid configuration fails
at startup with a configuration message. Features must not read `import.meta.env` directly.

_\*Every VITE_* value is public in the browser bundle. Never put secrets there._*
Vite reads environment files at startup/build time; restart after changes.

## Ownership and architecture

```text
src/
  app/                 providers, structural layout, route composition
  components/
    ui/                shadcn primitives, added only when consumed
    shared/            generic reusable application components
  features/            future feature-owned business code
  hooks/               future cross-feature hooks
  lib/
    api/               typed fetch transport and ApiError
    env/               configuration validation
    query/             QueryClient defaults and factory
    utils/             class-name helper
  types/               future shared API DTO types
  test/                setup and isolated provider render helper
  App.tsx
  main.tsx
```

`@/*` resolves to `src/*` in TypeScript, Vite, Vitest, and components.json.
Future business code belongs in `features/<feature>/{api,components,hooks,pages,schemas,types}`
as needed. Feature DTOs are explicit API contracts, not imports from backend/Prisma source.
Empty feature boilerplate and a global services/pages hierarchy are unnecessary.
Existing empty feature, hook, and type markers are retained.

Flow: Browser -> React Router -> feature -> TanStack Query -> API client -> backend.
Server state belongs to Query, form state to React Hook Form, validation to Zod,
router state to React Router, and local UI state to React. Session state is deferred to F1.
Feature-owned query keys should be readonly tuples beginning with the feature name,
followed by resource, identifier, and relevant filters; define them alongside feature API code.
There is no central business query-key registry or speculative global-state library.

## Providers, routing, and styling

`AppProviders` owns QueryClientProvider and accepts an injected client for tests.
`AppRouter` composes a browser data router with a minimal root route, a catch-all 404,
and an error boundary that displays a safe generic message for rendering errors.
The shell uses semantic main/section elements, a skip link, responsive spacing,
and visible keyboard focus. index.html retains English, viewport, ReqFlow title, and the local favicon.
The home screen uses one shadcn Button/link and one Lucide icon to verify composition.

Tailwind 4 uses `@tailwindcss/vite` and CSS-first configuration; no legacy config
is required. The small neutral light theme supplies the tokens consumed by Button
and the foundation screen. No final sidebar, account menus, or product shell is implemented.
Future shadcn components use the configured aliases; review CLI output before accepting
new dependencies or generated import changes.

Query defaults: 30-second stale time, no focus refetch, at most two retries for network
and server failures, no retries for 4xx or invalid-response errors, and no mutation retries.
Mount/reconnect refetches otherwise retain Query defaults. Errors create no global UI side effects.

## API and security boundary

Use `apiClient<TResponse>(path, options)` from `@/lib/api`.
Paths are relative to the configured API base: `/probe` and `probe` both append
to any base path prefix. Absolute, protocol-relative, and parent-traversal paths are rejected.
Methods, headers, AbortSignal, and other standard fetch options are forwarded.

Use `json: value` for automatic JSON serialization and Content-Type.
Use `body: FormData` for multipart data without setting Content-Type; the browser
must supply its boundary. Other native bodies are passed through unchanged.
Do not provide both json and body.
Responses are JSON; empty successes (including 204) resolve to undefined, so use
`apiClient<void>` for those endpoints. Invalid successful JSON produces INVALID_RESPONSE.
The response generic describes an expected DTO and does not validate it at runtime;
future feature schemas can validate payloads where warranted.

Every call enforces `credentials: 'include'` for backend session/cookie authentication.
No tokens are manually attached or stored in localStorage, sessionStorage, or IndexedDB.
Backend CORS must permit the frontend origin and credentials; cookies must have suitable
SameSite/Secure settings for the deployment topology. Authentication itself remains F1 work.

ApiError exposes status (0 for network failure), code, requestId, and optional unknown
details/cause for diagnostics. It reads the backend's
`{ error: { code, message, requestId } }` envelope safely. Normalized 4xx messages can
be shown to users; unexpected bodies and 5xx use generic messages. Never display arbitrary
details/cause. Abort errors are preserved for callers/Query cancellation.

Request ID precedence is X-Request-Id, X-Correlation-Id, then the error-body requestId.
Cross-origin response headers are readable only when exposed by backend CORS.
The existing backend embeds requestId in normalized errors, providing a fallback;
its CORS configuration currently does not expose X-Request-Id. F0 does not change backend files
or display correlation IDs globally.

**Backend authorization is authoritative.** Future permission-aware UI is a UX aid,
never a security boundary.

## Tests and scope

`src/test/setup.ts` enables jest-dom and RTL cleanup. `renderWithProviders` creates
an isolated QueryClient and memory data router per render, accepts route/entry overrides,
and disables retries in component tests. Infrastructure tests exercise production Query defaults.
Fetch is stubbed directly; MSW is not needed for this boundary.

Tests cover actual App rendering, root/404 navigation, route error containment,
valid/invalid environment input, credentialed JSON requests, empty responses, normalized
errors and request IDs, malformed bodies, network failure, cancellation, FormData,
path validation, retry limits, mutation defaults, cache isolation, and Zod resolver compatibility.

F0 does not add Recharts, TanStack Table, Redux, Zustand, Axios, authentication SDKs,
business DTOs, uploads, reports, notifications, or dashboard functionality.
No backend modifications, deployment, or automatic commit are part of this milestone.
