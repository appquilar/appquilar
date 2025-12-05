# Appquilar Frontend

This is the frontend for Appquilar, built with React and Vite and structured using Domain-Driven Design (DDD), Clean Architecture, CQS, and a shared Ubiquitous Language with the Symfony backend.

The project supports:

- Local development with Vite (hot reload)
- Docker development environment (Vite + volumes)
- Production deployment using Nginx and a static build
- Modular architecture based on domain modules

## Project Structure

The following tree is kept narrow on purpose so it renders cleanly in most viewers:

```
frontend/
  docker/
    Dockerfile          # Production image (Nginx + static build)
    Dockerfile.dev      # Development image (Vite + HMR)
    nginx.conf          # Nginx configuration
  docker-compose.yml    # Production compose file
  docker-compose.dev.yml
  Makefile
  src/
    domain/
      models/           # User, AuthSession, Address, Location, UserRole, etc.
      repositories/     # Repository interfaces
    application/
      services/         # AuthService, UserService
      hooks/            # Application-level hooks
    infrastructure/
      http/             # ApiClient
      auth/             # AuthSessionStorage
      repositories/     # ApiAuthRepository, ApiUserRepository
    context/            # React context providers
    components/         # UI components
    pages/              # Routing and screens
  public/
  package.json
```

## Architecture Overview

### Domain Layer (`src/domain`)

Pure business and core concepts:

- Domain models
- Value objects
- Enums
- Repository interfaces

No dependencies on React, infrastructure, or browser APIs.

### Application Layer (`src/application`)

Implements use cases:

- AuthService
- UserService
- Application-level hooks

Depends only on:

- Domain models  
- Domain repository interfaces  

No HTTP calls here.

### Infrastructure Layer (`src/infrastructure`)

Implements external integrations:

- ApiClient
- ApiAuthRepository / ApiUserRepository
- DTO <-> Domain mappers
- AuthSessionStorage (localStorage + JWT decode)

Depends on backend and browser APIs, never on UI.

### UI Layer (`src/components`, `src/pages`, `src/context`)

React UI:

- Components
- Screens
- Context providers

Depends on application services and domain, never infrastructure.

## Development Workflow

### Start development in Docker (Vite + hot reload)

```
make start
```

App available at:

```
http://localhost:8080
```

### Run Vite locally without Docker

```
npm install
npm run dev
```

### Production mode (Nginx + static build)

```
make start-prod
```

Served at:

```
http://localhost:8080
```

## Makefile Commands

```
make install
make dev
make start
make start-prod
make down
make logs
make clean
make destroy
make rebuild
make shell
make check-be
```

## Environment Variables (Vite)

Create `.env.local`:

```
VITE_API_BASE_URL=http://localhost:8000
VITE_USE_MOCK_DATA=false
```

Access via:

```
import.meta.env.VITE_API_BASE_URL
```

## Feature Development Checklist

1. Domain  
   - Add or update domain models or repository interfaces.

2. Infrastructure  
   - Map backend DTOs to domain models.  
   - Implement or extend repositories.

3. Application  
   - Add or extend services.  
   - Expose functionality via hooks.

4. UI  
   - Build components or pages.  
   - Use application hooks only.  
   - Do not call fetch or use storage directly.

## Design Goals

- Clear separation of concerns  
- Domain stability  
- Replaceable infrastructure  
- Testable architecture  
- Scalable for future contexts (Products, Rentals, Companies, Messaging, etc.)  
