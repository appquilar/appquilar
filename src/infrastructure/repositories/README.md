
# Repository Pattern Implementation

This directory contains the repository implementations for the application. The repository pattern is used to abstract the data access layer from the application logic.

## Repository Interfaces

All repository interfaces are defined in the `src/domain/repositories` directory. For example:

- `IRentalRepository.ts` - Interface for rental data access
- `IProductRepository.ts` - Interface for product data access

## Repository Implementations

This directory contains the implementations of the repository interfaces. We have two types of implementations:

1. **Mock Repositories** - Used for development and testing
   - `MockRentalRepository.ts`
   - `MockProductRepository.ts`
   
2. **API Repositories** - Used for production
   - `ApiRentalRepository.ts`
   - Add more as needed

## Repository Factory

The `RepositoryFactory.ts` file provides a factory for creating repository instances. This allows for easy dependency injection and switching between different repository implementations.

## Usage

### In Services

```typescript
import { IRentalRepository } from '@/domain/repositories/IRentalRepository';
import { RepositoryFactory } from '@/infrastructure/repositories/RepositoryFactory';

class SomeService {
  private rentalRepository: IRentalRepository;
  
  constructor() {
    // Get repository from factory
    this.rentalRepository = RepositoryFactory.getRentalRepository();
  }
  
  async doSomething() {
    const rentals = await this.rentalRepository.getAllRentals();
    // Do something with rentals
  }
}
```

### Switching Repository Implementations

To switch between repository implementations, use the `RepositoryConfig` class:

```typescript
// In your application initialization code
import { RepositoryConfig } from '@/infrastructure/config/RepositoryConfig';

// Use mock repositories
RepositoryConfig.useMockRepositories();

// Or use API repositories
RepositoryConfig.useApiRepositories('https://api.example.com');
```

### Creating a New Repository Implementation

To create a new repository implementation:

1. Create a new class that implements the repository interface
2. Add it to the `RepositoryFactory`
3. Update the `RepositoryConfig` to use it

Example:

```typescript
// 1. Create implementation
export class NewRentalRepository implements IRentalRepository {
  // Implement all methods...
}

// 2. Add to factory (in RepositoryFactory.ts)
public static setRentalRepository(repository: IRentalRepository): void {
  this.rentalRepository = repository;
}

// 3. Update config to use it (in your app initialization)
RepositoryFactory.setRentalRepository(new NewRentalRepository());
```
