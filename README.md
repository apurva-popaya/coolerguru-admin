# CoolerGuru Admin

Standalone extraction of the CoolerGuru admin portal. Existing UI wrappers,
styles, features, and backend contracts are preserved.

Production: https://admin.coolerguru.com. Local: http://localhost:3001.

```sh
npm install
npm run dev
```

For production run `npm run build` and `npm start`. A Next.js Node server is
required; static export is unsupported. Dev/start default to port 3001.
Route the production hostname to this server and enable HTTPS.

Overview is `/`; login is `/login`. Screens use root paths such as `/companies`,
`/products`, `/users`, and `/content-management`. Register/add-admin require an
authenticated ADMIN role. Registration is an existing placeholder; use `/add-admin`
to create administrators through `/admin/accounts`.

## Environment and deployment

- `NEXT_PUBLIC_API_BASE_URL`: existing backend API base including `/api/v1`.
  Local default is `http://localhost:8000/api/v1`. The Next.js server must reach it.
  This is public configuration; never include credentials.
- `IMAGE_REMOTE_HOSTS`: comma-separated HTTPS upload/CDN hostnames if files are
  outside `*.coolerguru.com`. The single `next.config.mjs` preserves existing hosts.

Browser auth, data, uploads, and exports use `/api/admin-backend`. The bridge
forwards only admin cookies, forces `X-Auth-Portal: ADMIN`, and preserves backend
`/admin` paths. Rotated cookies belong to the admin frontend host and `/` path.
Proxy refreshes also update incoming cookies for Server Components.

Keep the existing backend/database. Auth must support ADMIN sessions and roles,
`/auth/me` rotation, `/auth/refresh`, `/auth/logout`, `/auth/admin/login`, and
authorized `/admin/accounts` creation. If backend origin, CSRF, redirect, or host
allowlists exist, include `https://admin.coolerguru.com` and `http://localhost:3001`.
Browser API CORS is avoided by the same-origin bridge; server connectivity is required.

Preserve `Set-Cookie` headers through hosting/reverse proxies. Allow multipart
uploads and CSV responses through `/api/admin-backend`. Configure request limits
for the existing 10 MB per-file and up-to-10-files batch contract. Sessions on the
old frontend host may require login again. No database credentials belong here.
Public footer links and “Back to website” point to `https://coolerguru.com`.

## Validation

```sh
npm run build
npm run check
npm run lint
node scripts/verify-migration.cjs
node scripts/http-smoke.cjs
node scripts/browser-smoke.cjs
```

HTTP/browser scripts need the app running on port 3001. Browser verification
uses local Chrome and captures desktop/mobile login screenshots. Mock tests
do not perform live database writes. See [MIGRATION.md](MIGRATION.md) for results
and remaining verification.
