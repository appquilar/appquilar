# Dashboard E2E (Playwright + deterministic seed)

This document describes the local E2E setup for the Appquilar dashboard:

1. Deterministic seed API (for automated and manual testing)
2. Playwright dashboard suite
3. CSV import pipeline to generate test specs

## 1. Seed API

The deterministic seed API is implemented in:

- `scripts/e2e/dashboard-seed.mjs`
- `scripts/e2e/seed-server.mjs`

Default URL:

- `http://127.0.0.1:18080`

Health endpoint:

- `GET /api/health`

Reset endpoint (used by tests):

- `POST /api/test/reset`

Seed metadata endpoint:

- `GET /api/test/seed`

Default seed users:

- `admin.e2e@appquilar.test` / `E2Epass!123` (admin)
- `company.admin.e2e@appquilar.test` / `E2Epass!123` (company admin)
- `user.e2e@appquilar.test` / `E2Epass!123` (regular user)

Seed includes deterministic entities for:

- site
- categories
- products
- users
- companies and company users
- rentals and rental messages
- engagement stats

## 2. Dashboard Playwright suite

Dedicated Playwright config:

- `playwright.dashboard.config.ts`

This config starts:

1. Seed API server
2. Vite FE server pointing to the seed API

Core seeded tests live in:

- `src/test/e2e/dashboard/dashboard-core.spec.ts`

Generated CSV tests live in:

- `src/test/e2e/dashboard/generated/dashboard-cases.generated.spec.ts`

### Run locally

```bash
make test-e2e-dashboard
```

Or UI mode:

```bash
make test-e2e-dashboard-ui
```

Run a single shard (console):

```bash
make test-e2e-dashboard-shard SHARD=1 TOTAL=4
```

Run a single shard (UI):

```bash
make test-e2e-dashboard-ui-shard SHARD=1 TOTAL=4
```

Run E2E coverage (app suite + dashboard suite):

```bash
make coverage-e2e
```

Coverage output:

- Scoped report (used for E2E target/gating):
  - `coverage-e2e/index.html`
  - `coverage-e2e/lcov.info`
  - `coverage-e2e/coverage-summary.json`
- Full report (all instrumented FE files):
  - `coverage-e2e-full/index.html`
  - `coverage-e2e-full/lcov.info`
  - `coverage-e2e-full/coverage-summary.json`
- Scope metadata:
  - `coverage-e2e/scope.json`

## 3. Manual testing against seed

Terminal 1:

```bash
make e2e-seed-server
```

Terminal 2:

```bash
make dev-e2e-seed
```

Then open:

- `http://127.0.0.1:4173`

Use any seed credentials listed above.

## 4. CSV -> Playwright generation

Generator script:

- `scripts/e2e/generate-dashboard-spec-from-csv.mjs`

Generate spec from CSV:

```bash
make e2e-dashboard-generate CSV=/absolute/path/to/cases.csv
```

Current dashboard matrix example:

```bash
make e2e-dashboard-generate CSV="/Users/victor/Downloads/Testing manual Appquilar - Dashboard.csv"
```

Output file:

- `src/test/e2e/dashboard/generated/dashboard-cases.generated.spec.ts`

Runtime dependency:

- The generated spec is committed in the repository.
- CI/local test runs do not depend on CSV/Excel files.
- CSV is only needed if you want to refresh the suite from an updated manual matrix.

Header auto-detection supports common names (English/Spanish):

- id / case id / test id
- title / test case / scenario / descripcion
- module / area / feature / section
- steps / pasos
- expected / expected result / resultado esperado
- preconditions / precondiciones

## 5. Notes

- The generated tests are deterministic and reproducible thanks to seed reset per case.
- CSV-generated tests use heuristics for role/path/expected text; review generated assertions after importing a new manual matrix.
- If you update manual cases, regenerate and rerun the suite.

## 6. FE Pipeline

Frontend CI workflow:

- `.github/workflows/frontend-tests.yml`

The test matrix includes:

- `Dashboard E2E Shard 1/4`
- `Dashboard E2E Shard 2/4`
- `Dashboard E2E Shard 3/4`
- `Dashboard E2E Shard 4/4`

Each shard executes:

- `npm run test:e2e:dashboard -- --shard=<n>/4`

Playwright parallelism in CI:

- CI dashboard shards run with `PLAYWRIGHT_WORKERS=2`
- CI public Playwright also runs with `PLAYWRIGHT_WORKERS=2`
- Coverage runs remain single-worker because instrumentation is enabled
