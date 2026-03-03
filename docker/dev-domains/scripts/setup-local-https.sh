#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
CERT_DIR="$ROOT_DIR/certs"
CERT_FILE="$CERT_DIR/appquilar-dev.pem"
KEY_FILE="$CERT_DIR/appquilar-dev-key.pem"
HOSTS_ENTRY="127.0.0.1 dev.appquilar.com dev.api.appquilar.com"

ensure_mkcert() {
  if command -v mkcert >/dev/null 2>&1; then
    return 0
  fi

  if command -v brew >/dev/null 2>&1; then
    echo "[dev-domains] mkcert no encontrado. Instalando con Homebrew..."
    brew install mkcert nss
  fi

  if ! command -v mkcert >/dev/null 2>&1; then
    echo "mkcert no está instalado."
    echo "macOS: brew install mkcert nss"
    echo "Linux: https://github.com/FiloSottile/mkcert"
    exit 1
  fi
}

ensure_mkcert

mkdir -p "$CERT_DIR"

if [[ ! -f "$CERT_FILE" || ! -f "$KEY_FILE" ]]; then
  echo "[dev-domains] Instalando CA local de mkcert (si no existe)..."
  mkcert -install

  echo "[dev-domains] Generando certificado para dev.appquilar.com y dev.api.appquilar.com..."
  mkcert \
    -cert-file "$CERT_FILE" \
    -key-file "$KEY_FILE" \
    dev.appquilar.com dev.api.appquilar.com
else
  echo "[dev-domains] Certificados ya existentes en $CERT_DIR"
fi

if grep -q "dev.appquilar.com" /etc/hosts && grep -q "dev.api.appquilar.com" /etc/hosts; then
  echo "[dev-domains] Hosts ya configurados en /etc/hosts"
else
  echo "[dev-domains] Añadiendo hosts locales en /etc/hosts..."
  if [[ "${EUID:-$(id -u)}" -eq 0 ]]; then
    echo "$HOSTS_ENTRY" >> /etc/hosts
  elif command -v sudo >/dev/null 2>&1; then
    sudo sh -c "echo '$HOSTS_ENTRY' >> /etc/hosts"
  else
    echo "[dev-domains] No se pudo usar sudo automáticamente."
    echo "Añádelo manualmente:"
    echo "$HOSTS_ENTRY"
    exit 1
  fi
fi

echo "[dev-domains] Setup finalizado."
