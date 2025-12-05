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
