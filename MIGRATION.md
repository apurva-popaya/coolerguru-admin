# Migration verification

The original frontend project was only read. Local UI wrappers were left intact.
Unreachable copied buyer/supplier modules were removed after tracing imports from
all app routes and preserved UI wrappers. Upload pagination is now an admin-owned
shared type, so uploads no longer require a seller API module.

## Completed

- Root overview, login, navigation, search, links, redirects, and logout paths.
- Missing auth proxy and API bridge restored from the source and adapted.
- ADMIN portal resolution, role checks, server layout protection, and server checks
  on register/add-admin. Only login is public.
- Rotated cookies forwarded to the browser and current server render.
- Multipart uploads retained; CSV filenames forwarded; product/inquiry exports now
  use the same-origin bridge and refresh/retry, as company exports already did.
- Add-admin retries after refresh; login does not retry bad credentials.
- Admin-owned footer, public website links, metadata, port 3001 scripts, and instructions.
- One Next.js config, with existing upload image hosts retained.

## Results

- Production build and TypeScript: passed. Building needs access to Google Fonts
  for the existing DM Sans font.
- Mock tests: passed for portal isolation, protected routes, ADMIN role checks,
  login redirect, cookie rotation/forwarding, backend paths/query/body, export
  disposition, refresh/retry, admin account requests, multipart headers, logout,
  and CSV-to-Excel conversion. Run `node scripts/verify-migration.cjs`.
- Local HTTP checks: login 200; overview/users/register/add-admin redirect to login
  without a session; proxied auth/me returns 401 without a session.
- Chrome: desktop (1440x1000) and mobile (390x844) login screenshots captured;
  both rendered without horizontal overflow. Screenshots are in artifacts/screenshots.
- ESLint: 26 errors and 25 warnings remain; errors are inherited React/compiler
  findings in the copied UI: effects setting
  state, render-time ref usage, JSX in try/catch, and declaration ordering. They
  are not suppressed. The preserved carousel wrapper is among the findings.
- npm install reported 18 audit findings (4 moderate, 12 high, 2 critical).
  No broad dependency upgrades were applied during extraction.

## Remaining verification

No authenticated session or test-admin credentials were provided. Successful live
login, authenticated screen data, actual token expiry/rotation, uploads/downloads,
and persisted create/edit operations need a staging ADMIN account and backend.
Mocks verify transport behavior, not backend permissions or database writes.
Only login screenshots were possible without an authenticated session.

The source registration form has no backend integration. It remains restricted
and shows an unavailable message instead of logging passwords. Footer social
links and some contact details remain source placeholders.

Environment/hosting/backend settings are in [README.md](README.md). No database
schema changes or backend endpoint renames are required.
