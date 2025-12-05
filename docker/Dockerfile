
# Etapa de construcción
FROM node:20-alpine as build

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm ci

# Copiar código fuente
COPY .. .

# Construir la aplicación
RUN npm run build

# Etapa de producción
FROM nginx:alpine

# Copiar archivos de construcción a nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Configuración para SPA (Single Page Application)
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto
EXPOSE 80

# Comando para iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
