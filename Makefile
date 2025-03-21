
# Variables
PROJECT_NAME = appquilar
DOCKER_COMPOSE = docker-compose
NPM = npm

# Colores
GREEN = \033[0;32m
NC = \033[0m # Sin color

.PHONY: help install dev build up down restart logs clean test

# Ayuda
help:
	@echo "${GREEN}Comandos disponibles:${NC}"
	@echo "  make install - Instala dependencias"
	@echo "  make dev     - Inicia el entorno de desarrollo"
	@echo "  make build   - Construye la aplicación para producción"
	@echo "  make up      - Inicia los contenedores Docker"
	@echo "  make down    - Detiene los contenedores Docker"
	@echo "  make restart - Reinicia los contenedores Docker"
	@echo "  make logs    - Muestra los logs de los contenedores"
	@echo "  make clean   - Limpia archivos generados y caché"
	@echo "  make test    - Ejecuta los tests"

# Instalar dependencias
install:
	@echo "${GREEN}Instalando dependencias...${NC}"
	$(NPM) install

# Iniciar entorno de desarrollo
dev:
	@echo "${GREEN}Iniciando entorno de desarrollo...${NC}"
	$(NPM) run dev

# Construir para producción
build:
	@echo "${GREEN}Construyendo para producción...${NC}"
	$(NPM) run build

# Iniciar contenedores Docker
up:
	@echo "${GREEN}Iniciando contenedores Docker...${NC}"
	$(DOCKER_COMPOSE) up -d

# Detener contenedores Docker
down:
	@echo "${GREEN}Deteniendo contenedores Docker...${NC}"
	$(DOCKER_COMPOSE) down

# Reiniciar contenedores Docker
restart:
	@echo "${GREEN}Reiniciando contenedores Docker...${NC}"
	$(DOCKER_COMPOSE) restart

# Ver logs de contenedores
logs:
	@echo "${GREEN}Mostrando logs...${NC}"
	$(DOCKER_COMPOSE) logs -f

# Limpiar archivos generados
clean:
	@echo "${GREEN}Limpiando archivos generados...${NC}"
	rm -rf dist node_modules

# Ejecutar tests
test:
	@echo "${GREEN}Ejecutando tests...${NC}"
	$(NPM) test
