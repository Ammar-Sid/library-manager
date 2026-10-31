# LibraryOS

A Next.js library application with credentials-based authentication, role-based
admin controls, PDF uploads, searchable/paginated book listings, and an embedded
PDF reader. Prisma uses SQLite for application data.

## Local setup

Requirements: Node.js 20.9+ and npm.

1. Install dependencies: `npm ci`
2. Copy `.env.example` to `.env.local` and set a strong `NEXTAUTH_SECRET`.
3. Create the SQLite database and apply migrations: `npm run db:deploy`
4. Start the app: `npm run dev`

The default `DATABASE_URL` stores the SQLite file at `prisma/dev.db`. Local
development can upload PDFs without a Blob token; those files are stored in the
ignored `.library-files` directory and served only to signed-in users. Set
`BLOB_READ_WRITE_TOKEN` to use Vercel Blob instead. Production requires a Blob
token; local filesystem storage is disabled in production. The Playwright
server explicitly selects local storage so its upload/read flow is isolated
from external services.

Create the initial super-admin account by setting `SUPER_ADMIN_EMAIL` and
`SUPER_ADMIN_PASSWORD`, then running `npm run db:seed`. The seed command also
accepts an optional `SUPER_ADMIN_NAME`. Registration through the app always
creates a standard user.

## Database and storage

- Prisma schema: `prisma/schema.prisma`
- Tracked migrations: `prisma/migrations`
- `npm run db:migrate -- --name <migration>` creates a development migration.
- `npm run db:deploy` applies migrations in deployment and CI environments.
- `npm run db:seed` creates or promotes the configured super-admin account.
- Uploads accept PDF MIME types only, enforce a 50 MiB limit, and validate the
  `%PDF` file signature before storage.

The SQLite database is a local file and must be placed on persistent storage
when self-hosting. Vercel's serverless filesystem is ephemeral, so a durable
SQLite-compatible remote service or persistent volume is required for
production data; do not use PostgreSQL for this project.

## Checks

- `npm test` runs Jest and React Testing Library tests.
- `npm run lint` runs ESLint.
- `npx tsc --noEmit` checks TypeScript.
- `npm run test:e2e` runs the Playwright browser tests (install a browser with
  `npx playwright install chromium` if needed).
- `npm run build` creates the production build.

Pull requests run unit/integration tests and Playwright tests in GitHub Actions.
