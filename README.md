# ReqFlow frontend

F0 established infrastructure only. F0.5 translated the static design into React pages using
mock data. Since then, four milestones have replaced static mock content with real backend
integration, one vertical slice at a time:

- **F1 Authentication & App Shell** — real login, session, logout, protected/guest routes, and
  role-aware navigation. See "Authentication & session (F1)" below.
- **F2 Requests** — real request CRUD (create/edit/submit/cancel/delete) and list/detail views.
  See "Requests (F2)" below.
- **F3 Approvals** — real approval inbox and decisions (approve/reject/request revision), with a
  strict authority model: an approval action is never granted by role alone, only by being the
  backend-assigned approver for that specific pending step. See "Approvals (F3)" below.
- **F4 Collaboration** — real Comments and Attachments on a request, for both its owner and its
  assigned approver. See "Collaboration: Comments & Attachments (F4)" below.

**Notifications and Dashboard/Reports data remain static mock content** (F5/F6, not yet started).

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
  features/
    auth/              real login/session/logout (F1) — api, hooks, schemas, types, components, pages
    requests/          real request CRUD + detail (F2) — api, components, hooks, lib, pages, schemas, types
    approvals/         real inbox + decisions (F3) — api, components, hooks, pages, schemas, types
    collaboration/     real comments/attachments (F4) — comments/ and attachments/, each with
                       api, components, hooks, schemas, types
    dashboard/         static F0.5 pages (mock data)
    notifications/     static F0.5 pages (mock data)
    reports/           static F0.5 pages (mock data)
  hooks/               future cross-feature hooks
  lib/
    api/               typed fetch transport and ApiError
    env/               configuration validation
    query/             QueryClient defaults and factory
    mock/              F0.5 mock data + navigation config (preview vs production)
    utils/             class-name helper
  types/               shared domain types (Role, RequestStatus, ...)
  test/                setup, isolated provider render helper, fetch stubbing, fixtures
  App.tsx
  main.tsx
```

`@/*` resolves to `src/*` in TypeScript, Vite, Vitest, and components.json.
Future business code belongs in `features/<feature>/{api,components,hooks,pages,schemas,types}`
as needed. Feature DTOs are explicit API contracts, not imports from backend/Prisma source.
Empty feature boilerplate and a global services/pages hierarchy are unnecessary.
Remaining empty markers (`hooks/.gitkeep`) are retained for future cross-feature hooks.

Flow: Browser -> React Router -> feature -> TanStack Query -> API client -> backend.
Server state belongs to Query, form state to React Hook Form, validation to Zod,
router state to React Router, and local UI state to React. Session state (F1) is a
TanStack Query cache entry, not a second copy in Context/Redux/Zustand/localStorage —
see "Authentication & session (F1)" below.
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
SameSite/Secure settings for the deployment topology. Authentication itself is F1 work — see
"Authentication & session (F1)" below.

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

## Authentication & session (F1)

**Backend contract used** (reqFlow-backend, unmodified):

| Endpoint       | Method | Purpose                                                                                    |
| -------------- | ------ | ------------------------------------------------------------------------------------------ |
| `/auth/login`  | POST   | `{email,password}` -> `{data:{id,name,email}}`, sets the `reqflow_session` httpOnly cookie |
| `/auth/logout` | POST   | Destroys the session, clears the cookie. Idempotent with no cookie.                        |
| `/users/me`    | GET    | `{data:{id,name,email,role,organization:{id,name,slug},department:{id,name}\|null}}`       |

`/users/me`, not `/auth/me`, is the session/current-user source of truth: `/auth/me` deliberately
returns only `{id,name,email}` (see the backend's `auth.controller.ts`), while `/users/me` is the
only endpoint that also returns `role`/`organization`/`department`, which the App Shell and
role-aware navigation need. Backend `Role` is `EMPLOYEE | MANAGER | FINANCE | DIRECTOR | ADMIN`;
the frontend's existing `Role` union (`Employee | Manager | Finance | Director | Admin`, already
shared with the F0.5 static pages) is the only place the two are mapped between
(`src/features/auth/types/session.ts`).

**Architecture** — `src/features/auth/`:

- `api/` — `login()`, `logout()`, `getSession()`: one small function per endpoint, no generic
  "auth service" class.
- `schemas/` — `loginFormSchema` (frontend login input) and `userProfileResponseSchema` (runtime
  validation of the `/users/me` response shape).
- `hooks/` — `useSession()` (the session query, normalized to
  `loading | error | unauthenticated | authenticated`), `useLoginMutation()`,
  `useLogoutMutation()`, `useLogout()` (mutation + redirect), and `invalidateSessionOn401()`.
- `components/` — `ProtectedRoute`, `GuestOnlyRoute`, and the shared bootstrap/error fallbacks.
- `pages/login-page.tsx` — the real, F0.5-designed login form wired to React Hook Form + Zod +
  `useLoginMutation`.

The session is a single TanStack Query cache entry (`['auth','session']`), not duplicated into
Context/Redux/Zustand/localStorage. `getSession()` maps a plain 401 to `data: null`
(unauthenticated) rather than throwing, so a normal "not signed in" response never renders as a
query error; any other failure (network down, 5xx) is rethrown and surfaces as a distinct
`error` state — an outage is never shown as "you were logged out."

**Login flow**: submit -> `POST /auth/login` -> on success, invalidate+refetch `['auth','session']`
(the login response itself has no `role`) -> navigate to `/dashboard` (or back to the route the
user was redirected from). Errors already carry a safe, backend-provided message via `ApiError`
(see "API and security boundary" above); the login page additionally shows the `requestId` for
unexpected failures (network/5xx) only, never for ordinary invalid-credentials/validation errors.

**Session restore**: on app start, `ProtectedRoute`/`GuestOnlyRoute` call `useSession()`, which
fires `GET /users/me` once. Protected/guest content never renders before that resolves — both
show a small, non-branded bootstrap fallback instead — so there is no flicker of protected UI
before an unauthenticated redirect, and no flash of the login form before an authenticated
redirect.

**Logout**: `useLogout()` calls `POST /auth/logout`, then (regardless of whether that call
succeeded) clears the entire TanStack Query cache and navigates to `/login`. No other query
existed to leak in F1; `queryClient.clear()` establishes the pattern F2+ business queries will
rely on.

**Protected / guest routes**: `/dashboard`, `/requests`, `/requests/:id`, `/approvals`,
`/notifications`, `/reports` are nested under `ProtectedRoute`, which redirects an unauthenticated
visitor to `/login`. `/login` is wrapped in `GuestOnlyRoute`, which redirects an already-signed-in
visitor to `/dashboard`. Neither ever loops. The `/preview/*` design-QA routes are deliberately
**outside** this boundary — they render fixed mock personas for visual inspection and never touch
real session state (see `src/app/router/preview-routes.tsx`).

**Role-aware navigation**: `/dashboard`, `/requests`, and `/approvals` resolve to a role-specific
static F0.5 page via `src/app/router/*-route.tsx` (e.g. `DashboardRoute` picks
Owner/Manager-or-Finance/Director/Admin's dashboard component), and the App Shell's `user`/
`navItems` become the real signed-in user and `productionNavigationByRole[role]`
(`src/lib/mock/navigation.ts`) instead of a hardcoded mock persona. This mirrors the F0.5
authority model — Approvals only for Manager/Finance/Director, org-wide Requests/Reports only for
Admin — and is **top-level navigation UX only**: the backend's `/approvals/*` and
`/reports|dashboard/*` routes remain the actual authority (see their own `requireAuth`/service-
level scoping), and F1 invents no resource-level permission. A role with no page built for it
(e.g. Employee hitting `/reports`) is redirected to `/dashboard` rather than shown a page with no
content for it — a content-availability decision, not a security one.

**Business pages, F1 scope**: at F1, Request/Approval/Notification/Dashboard/Report _data_ was
still the F0.5 mock dataset regardless of who was signed in — only session/user identity and the
App Shell became real. Requests, Approvals, and Collaboration became real in F2/F3/F4
respectively (see their own sections below); Notifications and Dashboard/Reports remain static
mock content pending F5/F6.

**Local frontend + backend**: `reqFlow-backend`'s default `CORS_ORIGIN` is
`http://localhost:5173` (Vite's default port) with `credentials: true`; run the frontend on that
port for local cookie-based auth to work (`npm run dev`, no `--port` override). Start the backend
per its own README (`npm run prisma:migrate && npm run db:seed && npm run dev`, requires
PostgreSQL). The backend's seed script (`prisma/seed.ts`) provisions one development-only account
per role — `admin@example.com` / `manager@example.com` / `finance@example.com` /
`director@example.com` / `employee@example.com`, all with password `Password123!` — for local QA
only; never a production credential.

## Requests (F2)

Real create/edit/submit/cancel/delete and list/detail views — `src/features/requests/`
(`api/`, `components/`, `hooks/`, `lib/`, `pages/`, `schemas/`, `types/`). Endpoints:
`GET /requests` (list, with filters), `GET /requests/:id`, `POST /requests`, `PATCH /requests/:id`,
`POST /requests/:id/submit` (or `/resubmit`, chosen by current status), `POST /requests/:id/cancel`,
`DELETE /requests/:id`.

Write access (create/edit/submit/cancel/delete) is **creator-only**, even for Admin — this
mirrors `request.service.ts`'s `createdById`-scoped queries exactly, not a frontend invention.
`GET /requests/:id` is itself owner/admin-scoped server-side: a non-owner, non-admin caller
(e.g. an assigned approver who doesn't also own the request) gets a 404 there, which is why
approvers review via a separate page backed by a different endpoint — see "Approvals (F3)" below.
`EDITABLE_STATUSES`/`CANCELLABLE_STATUSES`/`DELETABLE_STATUSES`/`TERMINAL_REQUEST_STATUSES`
(`types/request.ts`) mirror the backend's own status-gating so the UI never offers an action the
backend would reject — the backend's response remains the actual authority regardless.

## Approvals (F3)

Real approval inbox and decisions — `src/features/approvals/` (`api/`, `components/`, `hooks/`,
`pages/`, `schemas/`, `types/`). Endpoints: `GET /approvals/inbox` (the signed-in user's own
PENDING steps), `GET /approvals/:id`, `POST /approvals/:id/approve`, `POST /approvals/:id/reject`,
`POST /approvals/:id/request-revision`.

**Approval authority principle**: an Approve/Reject/Request Revision action is never shown from
`role === MANAGER | FINANCE | DIRECTOR` alone. It is shown only when the backend-returned approval
step is `PENDING` _and_ its `approver.id` is the signed-in user — a Manager who isn't this
specific step's assigned approver (a stale link, a different cycle, an already-decided step) sees
no action, exactly like the backend's own `decide()` authorization. The frontend never derives
this from role; it only reflects what the backend already returned.

Because `GET /requests/:id` is owner/admin-only (see "Requests (F2)" above), an assigned approver
reviewing someone else's request does so on a **separate page**,
`/approvals/:approvalId` (`pages/approval-review-page.tsx`), backed by `GET /approvals/:id`
instead — which explicitly authorizes the assigned approver (plus the owner and org admins, for
read). That response is intentionally a smaller shape than Request detail (`RequestSummary` plus
this one approval step, no full cycle history) — see `approval.schema.ts`.

## Collaboration: Comments & Attachments (F4)

Real comments and file attachments on a request — `src/features/collaboration/`
(`comments/` and `attachments/`, each with their own `api/`, `components/`, `hooks/`, `schemas/`,
`types/`). Rendered on both Request Detail (the owner's page) and the Approval Review page (the
assigned approver's page) via the same `CommentSection`/`AttachmentSection` components.

**Backend endpoints**:

| Endpoint                    | Method | Purpose                                                    |
| --------------------------- | ------ | ---------------------------------------------------------- |
| `/requests/:id/comments`    | GET    | List comments (paginated)                                  |
| `/requests/:id/comments`    | POST   | `{content}` -> create a comment                            |
| `/comments/:id`             | DELETE | Delete a comment (author-only)                             |
| `/requests/:id/attachments` | GET    | List attachments (paginated)                               |
| `/requests/:id/attachments` | POST   | Multipart, field name `file` -> upload an attachment       |
| `/attachments/:id`          | DELETE | Delete an attachment (uploader-only)                       |
| `/attachments/:id/download` | GET    | Binary download (always `Content-Disposition: attachment`) |

**Authorization is entirely backend-owned** (`collaboration.service.ts`), and is deliberately
_broader_ than the F2/F3 request/approval authorization above — the frontend never re-derives it:

- **View**: the request's owner, **any** user who has ever been an approver on it (any cycle,
  any step, any status — including a historical or waiting step), or an org Admin. A DRAFT request
  is the sole exception: owner-only, not even Admin.
- **Write** (post a comment / upload a file): the owner, or the **current active** approver
  (a `PENDING` step on the `ACTIVE` cycle) — not Admin, not a historical or waiting approver.
  A terminal request (APPROVED/REJECTED/CANCELLED) is frozen for new comments/attachments for
  **everyone, including the owner** (409 `REQUEST_COLLABORATION_CLOSED`).
- **Delete**: author/uploader-only, regardless of role, and blocked once terminal (403/409).
- **Download**: uses the broader view-level authorization above, and works even on a terminal
  request.

`canWrite` on both pages is computed to mirror this exactly
(`(isOwner || isCurrentApprover) && !TERMINAL_REQUEST_STATUSES.includes(status)`), but it is a UX
affordance only — every create/delete call still goes to the backend, which remains the sole
authority and can still reject with 403/409 regardless of what the UI decided to show.

**Approver collaboration — confirmed supported**: the current backend does let an assigned
approver read and (while their step is the active pending one) write comments/attachments, so
this is wired into `approval-review-page.tsx` rather than reported as unavailable.

**File handling**: uploads use `apiClient(..., { body: formData })` — never `json` — so the
browser generates the multipart boundary; Content-Type is never set manually. Downloads bypass
`apiClient` (it only parses JSON) with a dedicated `fetch` + `Blob` + temporary `<a download>`
click, since every attachment response is a forced download, never an inline preview. The
frontend never constructs or reads a server filesystem path and never treats `storageKey` as
user-controlled data — the DTO the backend returns doesn't even include it. Client-side size
(10 MB) and MIME-type checks in `types/attachment.ts` are a UX convenience mirroring the backend's
documented `.env.example` default (`MAX_ATTACHMENT_SIZE_MB=10`); the backend re-validates and
remains authoritative regardless of what a deployment's real `.env` sets. Physical file cleanup on
delete is entirely backend-owned; the frontend only ever calls `DELETE /attachments/:id`.

Original filenames are always rendered as plain text (React's default escaping) — never through
`dangerouslySetInnerHTML` — so a filename containing HTML-like characters cannot execute as markup.

## User Management (F6.5)

Admin-only organization member management — `src/features/users/` (`api/`, `components/`,
`hooks/`, `lib/`, `pages/`, `schemas/`, `types/`), mirroring the F2 Requests module's structure
exactly. Production routes: `/users`, `/users/new`, `/users/:userId`.

**Navigation**: the "Users" nav item (`src/lib/mock/navigation.ts`) is only added to
`productionNavigationByRole.Admin` — never to `previewNavigationByRole`, since there is no F0.5
mock Users screen for `/preview/*` to point at. This is UX only; `UsersRoute` /
`UserDetailRoute` / `UserFormRoute` additionally redirect a non-Admin who navigates here directly
to `/dashboard`, and the backend independently enforces `requireRole(Role.ADMIN)` on every
`/users` endpoint regardless of what the frontend shows or redirects.

**Backend endpoints** (see backend README "User Management (F6.5)" for the full authorization/
guard rationale):

| Endpoint                | Method | Purpose                                         |
| ------------------------ | ------ | ------------------------------------------------ |
| `/users`                  | GET    | List, paginated, filterable (Admin)             |
| `/users`                  | POST   | Create a user (Admin)                           |
| `/users/:id`               | GET    | Detail (Admin)                                  |
| `/users/:id`               | PATCH  | Edit name/email (Admin)                         |
| `/users/:id/status`         | PATCH  | `{isActive}` — activate/deactivate (Admin)      |
| `/users/:id/department`     | PATCH  | `{departmentId}` — assign/unassign (Admin)      |
| `/users/:id/role`           | PATCH  | `{role}` — change role (Admin)                  |

`GET /users` filters (`q`, `role`, `departmentId`, `isActive`, `page`/`pageSize`) are driven
entirely through URL search params (`?q=&role=&departmentId=&isActive=&page=`), mirroring F2's
`RequestFilters`/`parseRequestListParams` pattern exactly — never fetched unfiltered and filtered
client-side. Department options reuse Reports' existing `useDepartmentsQuery`/`GET /departments`
infrastructure rather than duplicating it.

**Tenant scope is never client-controlled**: `CreateUserInput` has no `organizationId` field at
the type level, and no request this feature sends ever includes one — organization scope is
always derived from the authenticated Admin's own session, server-side.

**User lifecycle**: `isActive` (Active/Inactive `UserStatusBadge`) is the only lifecycle action
exposed — there is no hard-delete UI, matching the backend having no hard-delete endpoint at all
(a User with any Request/Approval/Comment/Attachment history can't be hard-deleted at the
database level — see backend README). Deactivation requires confirmation via the same generic
`ConfirmDialog` (a native `<dialog>`, reused from `features/requests/components/` — it has no
Request-specific props) F2 already uses for Cancel/Delete.

**Profile vs. security-sensitive changes are visually and mechanically separate** on the detail
page: a "Profile" section (name/email, `PATCH /users/:id`) has its own Save button; "Role"
(`PATCH /users/:id/role`) and "Department" (`PATCH /users/:id/department`) are independent
controls with their own actions; "Access" (activate/deactivate) is its own section. Every action
still calls its own backend endpoint directly — this page never decides on its own whether a
change is safe, it only renders whatever the backend actually accepted or refused.

**Self-protection UX**: the Role and Deactivate controls are disabled (with an explanatory note)
when the Admin is viewing their own user record, mirroring the backend's own
`SELF_ROLE_CHANGE_NOT_ALLOWED` / `SELF_DEACTIVATION_NOT_ALLOWED` guards — a UX affordance only;
the backend remains the sole authority and is never bypassed. A backend conflict
(`409 USER_HAS_PENDING_APPROVALS`, `409 LAST_ACTIVE_ADMIN_REQUIRED`) is rendered as-is
(`ApiError.message` is already backend-sanitized, same convention as every other feature here) —
never hidden behind a generic "Something went wrong" message, and never retried automatically.

**Session interaction**: if the Admin edits their own user record (profile, role, or department —
all reachable in practice, since only self-*deactivation* and self-*role-change* are blocked, not
self profile/department edits), the mutation additionally invalidates F1's session query
(`authKeys.session()`) so the signed-in identity shown elsewhere in the app (sidebar name/role/
department) stays in sync with a single TanStack Query source of truth — never a second,
independently-updated copy of "who am I".

**What F6.5 explicitly does not build**: public registration, self-signup, forgot-password,
email invitations, SSO/OAuth/SAML/LDAP/SCIM, multiple roles per user, a custom permission builder,
impersonation, bulk CSV user import, a hard-delete UI, organization switching, or Department CRUD
(Department creation/editing has its own real backend endpoints already, but no frontend UI is
built for it here — out of scope for F6.5).

## Tests and scope

`src/test/setup.ts` enables jest-dom and RTL cleanup. `renderWithProviders` creates
an isolated QueryClient and memory data router per render, accepts route/entry overrides,
and disables retries in component tests. Infrastructure tests exercise production Query defaults.
Fetch is stubbed directly; MSW is not needed for this boundary.

Tests cover actual App rendering, root/404 navigation, route error containment,
valid/invalid environment input, credentialed JSON requests, empty responses, normalized
errors and request IDs, malformed bodies, network failure, cancellation, FormData,
path validation, retry limits, mutation defaults, cache isolation, and Zod resolver compatibility.

F1 adds (`src/test/mock-fetch.ts`, `src/test/fixtures/session.ts`): session bootstrap
(restore/unauthenticated/no-flicker/network-failure-vs-logged-out), login (validation, real
`/auth/login` call with credentials included, invalid-credentials/5xx/network error UX, redirect
on success), logout (backend call, cache clear, redirect), protected/guest routing (including no
redirect loop), and App Shell role-aware navigation (Admin sees Reports, Manager doesn't). These
stub the HTTP boundary (`global.fetch`) rather than the auth hooks themselves, consistent with
F0's existing API-layer tests.

F2 adds request CRUD API-layer and component tests, plus URL-driven list filters (search/status/
type derived from and synced to `useSearchParams`, updated via React's render-time state
adjustment rather than an effect, to avoid `react-hooks/set-state-in-effect`). F3 adds approval
inbox/decision tests, including the authority principle above (role alone never grants an action)
and duplicate-submit prevention while a decision is pending (tested with a manually-resolved
Promise, since an instantly-resolving mock can hide the transient pending state). F4 adds comment/
attachment API-layer tests (credentials, FormData field name and absence of a manual multipart
Content-Type, error normalization, Blob download + `Content-Disposition` filename parsing),
component tests (loading/empty/populated/author-only-delete/write-gated-by-`canWrite`/client-side
upload validation/security against `dangerouslySetInnerHTML`), and Request Detail + Approval
Review regression tests confirming F2/F3 behavior is unchanged alongside the new F4 sections.
`src/test/setup.ts` also polyfills `HTMLDialogElement.prototype.showModal`/`close` (jsdom does not
implement native `<dialog>` modal behavior), needed once a test actually opens the shared
`ConfirmDialog` used by request cancel/delete and comment/attachment delete confirmations.

F0-F4 do not add Recharts, TanStack Table, Redux, Zustand, Axios, or MSW. Notifications and
Dashboard/Reports still use static F0.5 mock data — that real data integration is F5/F6.
No backend modifications, deployment, or automatic commit are part of this milestone.
