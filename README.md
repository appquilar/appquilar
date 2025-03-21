
# appquilar - Plataforma de Alquiler de Herramientas y Equipamiento

Appquilar es una aplicación web que conecta a usuarios con empresas locales para el alquiler de herramientas y equipamiento para construcción, jardinería y eventos.

## 📋 Requisitos

- Node.js 18 o superior
- npm o yarn

## 🚀 Instalación y uso local

### Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/appquilar.git
cd appquilar
```

### Instalar dependencias

```bash
npm install
```

o con yarn:

```bash
yarn install
```

### Iniciar el servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:8080`

### Ejecutar tests

```bash
npm run test
```

## 🏗️ Construir para producción

Para generar una versión optimizada para producción:

```bash
npm run build
```

Los archivos generados estarán en la carpeta `dist`.

## 🐳 Despliegue con Docker

Este proyecto incluye configuración para Docker, lo que facilita su despliegue en cualquier entorno.

### Construir la imagen Docker

```bash
docker build -t appquilar .
```

### Ejecutar el contenedor

```bash
docker run -p 8080:80 appquilar
```

La aplicación estará disponible en `http://localhost:8080`

### Usando Docker Compose

También puedes usar Docker Compose para iniciar la aplicación junto con servicios adicionales:

```bash
docker-compose up -d
```

## 📁 Estructura del proyecto

```
appquilar/
├── docker/              # Configuración de Docker
├── mock-api/            # API de simulación para desarrollo
├── public/              # Archivos estáticos
├── src/
│   ├── components/      # Componentes React
│   ├── context/         # Contextos de React
│   ├── core/            # Lógica de dominio
│   ├── hooks/           # Hooks personalizados
│   ├── infrastructure/  # Implementaciones de infraestructura
│   ├── lib/             # Utilidades y helpers
│   ├── pages/           # Páginas/rutas principales
│   └── main.tsx         # Punto de entrada
└── ...
```

## 🔑 Características principales

- Búsqueda de herramientas y equipamiento por categoría
- Sistema de autenticación y gestión de usuarios
- Panel de control para empresas
- Sistema de mensajería integrado
- Diseño responsive para móviles y escritorio

## 🛠️ Tecnologías utilizadas

- React + TypeScript
- React Router para la navegación
- TanStack Query para la gestión de estado y peticiones
- Tailwind CSS para estilos
- Shadcn/UI para componentes de interfaz
- Docker para contenedorización

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo LICENSE para más detalles.
