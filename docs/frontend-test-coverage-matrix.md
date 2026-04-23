# Frontend Test Coverage Matrix

This document summarizes the current frontend test coverage by feature area and by test layer.

## Suite Summary

- Unit: 16 files / 70 tests
- Integration: 16 files / 47 tests
- E2E total: 11 files / 380 scenarios
- Default E2E run: 380 scenarios
  - Public app suite: 4 scenarios
  - Seeded dashboard suite: 376 scenarios

Execution model:

- `npm run test:e2e` runs the public Playwright suite and the full seeded dashboard Playwright suite.
- `npm run test:e2e:public` runs only the public Playwright suite.
- `npm run test:e2e:dashboard` runs only the seeded dashboard suite.
- `npm run test:e2e:coverage` reruns the same public and dashboard suites with coverage instrumentation and exploratory coverage helpers enabled.

## Coverage Matrix

| Feature area | Unit | Integration | E2E always | Current depth |
| --- | --- | --- | --- | --- |
| Public shell, home, legal/info pages | `publicRoutes`, `useSeo`, `SeoService`, `AppLogo` | `usePublicSiteCategories` | `public-home.spec.ts`, generated `Header público`, `Home pública`, `Páginas informativas`, route exploration, responsive/accessibility cases | Good breadth, but most page assertions are smoke-level |
| Search, category discovery, geolocation filters | `publicRoutes` URL helpers | `CategorySelect`, `usePublicSiteCategories` | `search-flow.spec.ts`, generated `Categorías públicas`, `Búsqueda pública`, targeted geolocation success/error branches | Good public search coverage, category detail behavior is mostly smoke-level |
| Public product detail and public company profile | `ApiPublicCompanyProfileRepository` mapper, DTO defaults | `ApiPublicCompanyProfileRepository`, `usePublicCompanyProfile` | Generated `Producto público` cases, route exploration | Product/public profile flows exist, but product-detail assertions are mostly shallow |
| Authentication, session state, role helpers | `AuthService`, `AuthSession`, `AuthSessionStorage`, `UserRole`, `User` | `AuthContext`, `AuthModal`, `ApiAuthRepository` | `auth-modal.spec.ts`, `protected-route.spec.ts`, dashboard core auth and role access checks, generated `Autenticación`, auth/subscription matrix | Strongest area in the suite |
| Protected routing and dashboard entry | `publicRoutes`, role helpers | `AuthContext` | `protected-route.spec.ts`, `dashboard-core.spec.ts`, generated `Dashboard navegación`, route exploration | Strong for redirect and role-gated entry paths |
| Dashboard roles and permission boundaries | `User`, `UserRole` | `AuthContext` | `dashboard-core.spec.ts`, `dashboard-journeys.spec.ts`, generated `Permisos`, `Admin plataforma`, `Empresa`, route exploration | Strong role-gating coverage, including contaminated admin payload sanitization |
| Product management, pricing, and serialized inventory UI | No dedicated domain-unit tests yet | `useProductsHooks`, `useProductForm`, `ProductPriceFields`, `MonetaryField`, `ProductInventoryFields` | Generated `Productos` cases, overview/plan-limit branches, public `product-availability.spec.ts` | Good hook and field-level coverage; serialized inventory refresh, inline unit renaming, occupancy agenda, and public availability are covered, but full CRUD UI is still mostly smoke-level in e2e |
| Rentals lifecycle and rental filtering/state machine | `RentalFilterService`, `RentalStateMachineService` | `useRentalsHooks`, `RentalEditableCard` | `dashboard-core.spec.ts`, `dashboard-journeys.spec.ts`, generated `Alquileres`, extra rental-detail branches | Strong coverage from domain rules through end-to-end lifecycle journeys |
| Messages and proposal acceptance flow | Indirectly through rental state services | `useRentalsHooks` (lead + first message) | `dashboard-core.spec.ts`, `dashboard-journeys.spec.ts`, generated `Mensajes`, optimistic send + retry, renter-action branches | Good end-to-end depth |
| Billing, checkout/portal returns, subscription plans | `ApiBillingRepository` | `ApiBillingRepository`, `useBillingReturnSync` | Generated `Billing checkout`, `Billing portal`, `Fallo pago`, some `Resumen` plan checks, auth/subscription matrix, growth matrix | Strong frontend billing coverage |
| Company invitations and join-company flow | No dedicated unit coverage | No dedicated integration coverage | Generated `Invitación empresa` cases plus invalid link, missing email, accept, create-account error/success branches | Mostly e2e-driven coverage |
| Company user management and company admin screens | Role helper coverage only | No dedicated hook/component integration tests yet | `dashboard-core.spec.ts`, `dashboard-journeys.spec.ts`, generated `Empresa`, contributor limitation and invitation/update branches | Core flows covered, but hook/component layer is thin |
| Profile and address configuration | No dedicated unit coverage | Auth integration indirectly covers refresh/invalidation behavior | Generated `Configuración` cases plus targeted config submit flow | Basic happy-path coverage exists, but little field-level validation coverage |
| Blog and admin content management | SEO helpers only | `CategorySelect` helps category selection behavior | `dashboard-core.spec.ts`, generated `Admin plataforma`, focused create/edit/publish/draft/schedule/delete branches | Blog editor has solid e2e coverage; some admin pages remain smoke-level |
| Stats, analytics, dashboard reporting | No dedicated domain-unit tests beyond helpers | `useTrackProductView` | Generated `Resumen`, `Stats tracking`, `Stats reporte`, overview sorting/search/date-range branches | Tracking hook is covered; reporting screens are mostly smoke-level |
| Responsive and accessibility checks | None | None | Generated `Responsive`, `Accesibilidad`, route exploration | Present, but primarily smoke-level coverage |

## Primary Test Files By Layer

### Unit

- `src/test/unit/application/services/AuthService.test.ts`
- `src/test/unit/domain/services/RentalFilterService.test.ts`
- `src/test/unit/domain/services/RentalStateMachineService.test.ts`
- `src/test/unit/infrastructure/http/ApiClient.test.ts`
- `src/test/unit/infrastructure/repositories/ApiBillingRepository.test.ts`
- `src/test/unit/infrastructure/repositories/ApiUserRepository.test.ts`

### Integration

- `src/test/integration/context/AuthContext.test.tsx`
- `src/test/integration/infrastructure/repositories/ApiAuthRepository.test.ts`
- `src/test/integration/infrastructure/repositories/ApiBillingRepository.test.ts`
- `src/test/integration/hooks/useProductsHooks.test.tsx`
- `src/test/integration/hooks/useRentalsHooks.test.tsx`
- `src/test/integration/hooks/useBillingReturnSync.test.tsx`

### E2E Always

- `src/test/e2e/auth-modal.spec.ts`
- `src/test/e2e/public-home.spec.ts`
- `src/test/e2e/search-flow.spec.ts`
- `src/test/e2e/protected-route.spec.ts`
- `src/test/e2e/dashboard/dashboard-core.spec.ts`
- `src/test/e2e/dashboard/dashboard-journeys.spec.ts`
- `src/test/e2e/dashboard/generated/dashboard-cases.generated.spec.ts`

### E2E Expanded Dashboard Branch Coverage

- `src/test/e2e/dashboard/dashboard-coverage-auth-subscription.spec.ts`
- `src/test/e2e/dashboard/dashboard-coverage-growth.spec.ts`
- `src/test/e2e/dashboard/dashboard-coverage-targeted.spec.ts`
- `src/test/e2e/dashboard/dashboard-coverage-routes.spec.ts`

## Main Gaps

- The generated dashboard matrix gives excellent breadth, but many generated cases only prove route load plus expected text visibility.
- Public product detail, public category detail, responsive, accessibility, and some admin/company areas still lean heavily on smoke coverage.
- Company invitation, configuration, and some company-management paths are mostly e2e-only and have limited hook/component test coverage.
- There is no automated check that frontend repository DTOs stay aligned with the backend OpenAPI spec end-to-end; current repo tests validate selected snake_case payloads and mapping behavior only.
