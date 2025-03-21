
# appquilar - Plataforma de Alquiler de Herramientas

Appquilar es una plataforma web moderna para el alquiler de herramientas y equipamiento entre particulares y empresas. El proyecto está construido con React, TypeScript, Vite y utiliza Tailwind CSS para el diseño.

![Appquilar Screenshot](https://lovable.dev/opengraph-image-p98pqg.png)

## 🚀 Características

- **Sistema de autenticación** con registro, inicio de sesión y recuperación de contraseña
- **Catálogo de productos** organizado por categorías
- **Panel de control** para usuarios y empresas
- **Gestión de herramientas** para empresas
- **Perfiles de usuario** con historiales de alquiler
- **Diseño responsive** que funciona en móviles, tablets y escritorio
- **SEO optimizado** para mejor posicionamiento

## 📋 Requisitos previos

- Node.js (v16.x o superior)
- npm, yarn o pnpm
- Git

## 🛠️ Instalación y desarrollo local

### Método 1: Desarrollo local tradicional

```bash
# Clonar el repositorio
git clone https://github.com/yourusername/appquilar.git
cd appquilar

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

### Método 2: Usando Docker

```bash
# Clonar el repositorio
git clone https://github.com/yourusername/appquilar.git
cd appquilar

# Construir y ejecutar con Docker Compose
make up

# Para detener los contenedores
make down
```

### Método 3: Usando Make

El proyecto incluye un Makefile con comandos útiles:

```bash
# Instalar dependencias
make install

# Iniciar servidor de desarrollo
make dev

# Construir para producción
make build

# Iniciar en modo producción
make start

# Ejecutar pruebas
make test

# Iniciar contenedores Docker
make up

# Detener contenedores Docker
make down
```

## 📦 Estructura del proyecto

```
appquilar/
├── public/                 # Archivos estáticos
├── src/
│   ├── components/         # Componentes React
│   │   ├── auth/           # Componentes de autenticación
│   │   ├── dashboard/      # Componentes del panel de control
│   │   ├── Home/           # Componentes de la página de inicio
│   │   ├── layout/         # Componentes de layout (Header, Footer)
│   │   ├── products/       # Componentes relacionados con productos
│   │   └── ui/             # Componentes de UI reutilizables
│   ├── context/            # Contextos React (Auth, Theme)
│   ├── core/               # Lógica de dominio central
│   │   ├── domain/         # Entidades y modelos
│   │   └── ports/          # Interfaces/puertos para repositorios
│   ├── hooks/              # Custom hooks
│   ├── infrastructure/     # Implementaciones de repositorios
│   │   ├── adapters/       # Adaptadores para servicios externos
│   │   └── services/       # Servicios internos
│   ├── lib/                # Utilidades y funciones auxiliares
│   ├── pages/              # Componentes de páginas principales
│   ├── App.tsx             # Componente principal de la aplicación
│   └── main.tsx            # Punto de entrada
├── docker/                 # Configuración de Docker
├── docker-compose.yml      # Configuración de Docker Compose
├── Dockerfile              # Definición para construir la imagen Docker
├── Makefile                # Comandos de utilidad
└── README.md               # Este archivo
```

## 🚢 Despliegue en producción

### Construir para producción

```bash
# Usando npm
npm run build

# Usando Make
make build
```

### Usando Docker

```bash
# Construir la imagen Docker
docker build -t appquilar:latest .

# Ejecutar contenedor en modo producción
docker run -p 80:80 appquilar:latest
```

### Usando Docker Compose (recomendado)

```bash
# Iniciar en modo producción
docker-compose -f docker-compose.yml up -d
```

## 🔧 Variables de entorno

El proyecto utiliza las siguientes variables de entorno:

- `VITE_API_URL`: URL base para las llamadas API
- `VITE_STORAGE_URL`: URL base para almacenamiento de archivos
- `VITE_APP_ENV`: Entorno de la aplicación (development, production)

## 📝 Convenciones de código

- Utilizamos ESLint para mantener la calidad del código
- Prettier para formateo consistente
- Commits siguiendo [Conventional Commits](https://www.conventionalcommits.org/)

## 🤝 Contribución

1. Fork el repositorio
2. Crea una rama para tu característica (`git checkout -b feature/amazing-feature`)
3. Realiza tus cambios y haz commit (`git commit -m 'feat: add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## ✨ Agradecimientos

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/)
