# Variables
PROJECT_NAME = appquilar
DOCKER_COMPOSE = docker-compose
NPM = npm
CONTAINER_FE = $(PROJECT_NAME)-web-dev

# Colors
GREEN = \033[0;32m
YELLOW = \033[0;33m
RED = \033[0;31m
NC = \033[0m # No color

NETWORK_NAME = appquilar

.PHONY: help install dev build up down restart logs clean test start start-prod exec destroy rebuild network check-be shell

# Help
help:
	@echo "${GREEN}Available commands:${NC}"
	@echo "  make install     - Install dependencies"
	@echo "  make dev         - Start development environment (Vite) on host"
	@echo "  make build       - Build the application for production"
	@echo "  make up          - Start Docker containers (production compose)"
	@echo "  make start       - Start the FE in Docker in DEVELOPMENT mode (Vite + hot reload)"
	@echo "  make start-prod  - Start the FE in Docker like in the BE (Nginx + built dist)"
	@echo "  make down        - Stop Docker containers"
	@echo "  make restart     - Restart Docker containers"
	@echo "  make logs        - Show container logs"
	@echo "  make clean       - Remove dist/ and node_modules/"
	@echo "  make destroy     - Remove containers, images and volumes"
	@echo "  make rebuild     - Equivalent to clean + build + up"
	@echo "  make shell       - Enter the FE container to execute npm or other commands"
	@echo "  make test        - Run tests"
	@echo "  make check-be    - Check if the FE can reach the BE inside Docker"

# Create network only if it doesn't exist
network:
	@if [ -z "$$(docker network ls --filter name=^$(NETWORK_NAME)$$ -q)" ]; then \
		echo "⛵  Creating network $(NETWORK_NAME)..."; \
		docker network create $(NETWORK_NAME); \
	else \
		echo "✔️  Network $(NETWORK_NAME) already exists"; \
	fi

# Install dependencies
install:
	@echo "${GREEN}Installing dependencies...${NC}"
	$(NPM) install

# Development mode (host)
dev:
	@echo "${GREEN}Starting development environment on host...${NC}"
	$(NPM) run dev

# Build for production
build:
	@echo "${GREEN}Building for production...${NC}"
	$(NPM) run build

# Start Docker containers (production compose)
up:
	@echo "${GREEN}Starting Docker containers (production compose)...${NC}"
	$(DOCKER_COMPOSE) up -d

# Start FE (Docker) in DEVELOPMENT mode (Vite + hot reload)
start: network
	@echo "${GREEN}Starting frontend in Docker (development mode)...${NC}"
	$(DOCKER_COMPOSE) -f docker-compose.dev.yml up -d --build
	@echo ""
	@echo "${GREEN}Frontend (dev) available at:${NC} http://localhost:8080"
	@echo ""

# Start FE (Docker) in PRODUCTION mode (Nginx + dist)
start-prod: network
	@echo "${GREEN}Starting frontend in Docker (production mode)...${NC}"
	$(DOCKER_COMPOSE) -f docker-compose.yml up -d --build
	@echo ""
	@echo "${GREEN}Frontend (prod) available at:${NC} http://localhost:8080"
	@echo ""

# Stop containers
down:
	@echo "${GREEN}Stopping Docker containers...${NC}"
	$(DOCKER_COMPOSE) down

# Restart containers
restart:
	@echo "${GREEN}Restarting Docker containers...${NC}"
	$(DOCKER_COMPOSE) restart

# Show logs
logs:
	@echo "${GREEN}Showing logs...${NC}"
	$(DOCKER_COMPOSE) logs -f

# Clean generated files
clean:
	@echo "${GREEN}Cleaning dist/ and node_modules/...${NC}"
	rm -rf dist node_modules

# Enter the FE container
shell:
	@echo "${GREEN}Entering the FE container...${NC}"
	@docker exec -it $(CONTAINER_FE) sh || echo "${RED}❌ The container cannot be found. Is it running?${NC}"

# Destroy everything: containers, images, and volumes
destroy:
	@echo "${GREEN}Destroying containers, images, and volumes for the FE...${NC}"
	$(DOCKER_COMPOSE) down --rmi all --volumes --remove-orphans
	@echo "✔️ Project cleaned completely"

# Rebuild (clean + build + up)
rebuild: clean build up
	@echo "${GREEN}Completed full rebuild${NC}"

# Run tests
test:
	@echo "${GREEN}Running tests...${NC}"
	$(NPM) test

# Check connectivity FE → BE inside Docker (production container name)
check-be:
	@echo "${GREEN}Checking Backend communication...${NC}"
	@if docker ps --format '{{.Names}}' | grep -q "$(CONTAINER_FE)"; then \
		echo "${GREEN}→${NC} ${YELLOW}Running test inside container $(CONTAINER_FE)...${NC}"; \
		docker exec -it $(CONTAINER_FE) sh -c "wget -qO- http://php/api/health || echo 'ERROR'"; \
	else \
		echo "${RED}❌ FE container is not running. Execute: make start-prod${NC}"; \
		exit 1; \
	fi
