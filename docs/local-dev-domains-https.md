# Local dev domains with HTTPS

This setup serves:

- Frontend: `https://dev.appquilar.com`
- API: `https://dev.api.appquilar.com`

## Requirements

- Docker / docker-compose
- `mkcert`

Install mkcert on macOS:

```bash
brew install mkcert nss
```

## One-step (recommended)

From `appquilar/`:

```bash
make up
```

`make up` already runs setup automatically and then starts everything.

It will:

- installs local mkcert CA (if missing)
- tries to install `mkcert` with Homebrew when available
- creates cert/key in `docker/dev-domains/certs/`
- adds `/etc/hosts` entries automatically (asks sudo password if needed)
- starts API + FE + HTTPS proxy

## Start stack (manual)

From `appquilar/`:

```bash
make up
```

This starts:

- Backend stack (`../api/docker-compose.yml`)
- Frontend dev stack (`docker-compose.dev.yml`)
- Caddy HTTPS reverse proxy (`docker/dev-domains/docker-compose.yml`)

## Stop stack

```bash
make down
```

## Notes

- FE is still Vite dev mode behind Caddy.
- `VITE_API_BASE_URL` is forced to `https://dev.api.appquilar.com` in `make up`.
- Caddy config: `docker/dev-domains/Caddyfile`.
