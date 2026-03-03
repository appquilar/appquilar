# Appquilar Frontend

This is the frontend for **Appquilar**, built with **React + Vite** and designed following **DDD (Domain-Driven Design)**, **Clean Architecture**, **CQS**, and a shared **Ubiquitous Language** with the backend (Symfony/PHP).

The project supports:

- **Local development with Vite + hot reload (HMR)**
- **Docker development environment**
- **Production builds served via Nginx**
- A modular, scalable architecture structured around **domain modules**


---

## 🧩 Architecture Principles

### 🟦 Domain Layer (`src/domain`)
Pure business logic:
- Domain models (`User`, `AuthSession`, `Address`, `Location`, `UserRole`)
- Value Objects
- Enums
- **Repository interfaces**

✔ No dependencies on React, infrastructure, or browser APIs.

---

### 🟧 Application Layer (`src/application`)
Implements **use cases**:
- AuthService: login, logout, registration, password management
- UserService: load profile, update user, update address
- Hooks exposing use cases to the UI (e.g. `useCurrentUser`)

✔ Depends ONLY on:
- domain models
- domain repositories

🚫 **No HTTP calls here**  
🚫 **No UI references**

---

### 🟩 Infrastructure Layer (`src/infrastructure`)
Implements real integrations:
- **ApiClient** (HTTP wrapper)
- **ApiAuthRepository**, **ApiUserRepository**
- DTO ↔ Domain mappers
- AuthSessionStorage (localStorage + JWT decoding)

✔ Depends on backend  
✔ Implements domain repository interfaces

🚫 Never imported by UI directly.

---

### 🟪 UI Layer (`src/components`, `src/pages`, `src/context`)
React components, pages, and contexts:
- Consumes **application services** through hooks or React Context
- Never touches infrastructure or HTTP
- Never decodes JWT directly

---

## 🚀 Development Workflow

### ▶️ Start in Docker (Hot Reload with Vite)

### Landing-only mode

If you want to show only the landing and hide the full platform:

```bash
make landing-build-sync
make dev-landing
```

Environment flags:

```bash
VITE_LANDING_ONLY_MODE=true
VITE_LANDING_ENTRY=/landing/index.html
```

When `VITE_LANDING_ONLY_MODE=true`, the platform app shell is not mounted and platform API endpoints are not called.

### Local domains with HTTPS

```bash
make up
```

Domains:

- `https://dev.appquilar.com` (frontend)
- `https://dev.api.appquilar.com` (backend API)

See `docs/local-dev-domains-https.md` for full setup details.

## Dashboard E2E (Seeded)

Run seeded dashboard E2E suite:

```bash
make test-e2e-dashboard
```

Run one shard:

```bash
make test-e2e-dashboard-shard SHARD=1 TOTAL=4
```

Generate E2E coverage report:

```bash
make coverage-e2e
```

Coverage outputs:

- Scoped (targeted for E2E gate): `coverage-e2e/`
- Full (all instrumented FE files): `coverage-e2e-full/`
- Scope metadata (included/excluded files): `coverage-e2e/scope.json`

Generate tests from manual CSV matrix:

```bash
make e2e-dashboard-generate CSV="/Users/victor/Downloads/Testing manual Appquilar - Dashboard.csv"
```

You can run the suite without CSV. The generated tests are committed in code.

For full setup and CI details:

- `README.appquilar-frontend.md`
- `docs/e2e-dashboard-playwright.md`
