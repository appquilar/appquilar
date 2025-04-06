
# Appquilar Dashboard

Sistema de gestión para plataforma de alquiler de productos, con arquitectura hexagonal y DDD.

## Índice

- [Entorno de Desarrollo](#entorno-de-desarrollo)
- [Entorno de Producción](#entorno-de-producción)
- [Configuración del Origen de Datos](#configuración-del-origen-de-datos)
  - [Implementaciones Mock](#implementaciones-mock)
  - [Implementaciones API](#implementaciones-api)
  - [Transición Gradual](#transición-gradual)
- [Estructura del Proyecto](#estructura-del-proyecto)

## Entorno de Desarrollo

Para ejecutar el proyecto en modo desarrollo:

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El servidor de desarrollo se iniciará en `http://localhost:8080` con recarga automática al realizar cambios en el código.

Para ejecutar tests:

```bash
npm run test
```

## Entorno de Producción

Para desplegar el proyecto en producción:

### Método 1: Compilación estática

```bash
# Compilar el proyecto para producción
npm run build

# Opcionalmente, previsualizar la compilación
npm run preview
```

Los archivos estáticos generados estarán en la carpeta `dist/` y pueden ser desplegados en cualquier servidor web estático.

### Método 2: Contenedor Docker

El proyecto incluye configuración para despliegue con Docker:

```bash
# Construir la imagen
docker build -t appquilar-dashboard .

# Ejecutar el contenedor
docker run -p 8080:80 appquilar-dashboard
```

También puede utilizarse docker-compose:

```bash
# Ejecutar con docker-compose (incluye mock API)
docker-compose up -d
```

## Configuración del Origen de Datos

El sistema utiliza el patrón de repositorio para abstraer las fuentes de datos, lo que facilita el intercambio entre datos mock y API real.

### Implementaciones Mock

Por defecto, el sistema utiliza implementaciones Mock para desarrollo. Los datos mock se encuentran en:

```
src/infrastructure/repositories/mock-data/
```

### Implementaciones API

Para cambiar a implementaciones de API real:

#### 1. Desde componentes específicos

```typescript
import { useCompanyStats } from '@/application/hooks/useCompanyStats';

const Dashboard = () => {
  const { switchToApiImplementation } = useCompanyStats();
  
  // Al inicio del componente o en un efecto
  useEffect(() => {
    switchToApiImplementation('https://tu-api.com');
  }, []);
  
  // ... resto del componente
}
```

#### 2. Configuración global

Para configurar globalmente los orígenes de datos, puedes crear un componente de configuración:

```typescript
import { useEffect } from 'react';
import { useStatsConfig } from '@/application/hooks/useStatsConfig';

export const ApiConfigProvider = ({ children }) => {
  const { useApiRepository } = useStatsConfig();
  
  useEffect(() => {
    // Cambiar a implementación API
    useApiRepository('https://tu-api.com');
  }, []);
  
  return children;
}

// En tu App.tsx
<ApiConfigProvider>
  <App />
</ApiConfigProvider>
```

#### 3. Variables de entorno

Puedes configurar el origen de datos a través de variables de entorno:

```typescript
// src/config.ts
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
export const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';
```

Luego crea un archivo `.env.local` (no incluido en control de versiones):

```
VITE_API_BASE_URL=https://tu-api.com
VITE_USE_MOCK_DATA=false
```

### Transición Gradual

Para una transición gradual de mock a API real:

1. Implementa la API real siguiendo el contrato definido en las interfaces del dominio
2. Configura servicios específicos para usar la API mientras otros siguen usando mock
3. Implementa manejo de errores y fallbacks en el repositorio API para mayor robustez

Ejemplo de configuración para transición gradual:

```typescript
// En tu componente de configuración
useEffect(() => {
  // Stats con API real
  StatsService.setRepositoryFactory(new ApiStatsRepositoryFactory());
  
  // Otros servicios siguen con mock
  // ProductService, UserService, etc.
}, []);
```

## Estructura del Proyecto

El proyecto sigue una arquitectura hexagonal con DDD:

- `src/domain`: Modelos, repositorios (interfaces) y reglas de negocio
- `src/application`: Casos de uso y servicios de aplicación
- `src/infrastructure`: Implementaciones concretas de repositorios
- `src/presentation`: Componentes UI y configuración visual
- `src/components`: Componentes React reutilizables

Esta estructura facilita el cambio entre implementaciones mock y API sin afectar la lógica de negocio.
