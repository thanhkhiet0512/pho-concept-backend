# Deployment Script

This directory contains all Docker-related files for deploying the NestJS application.

## Files

| File | Description |
|------|-------------|
| `Dockerfile` | Multi-stage production Docker image |
| `docker-compose.yml` | Service orchestration (app + postgres + redis) |
| `.dockerignore` | Files to exclude from Docker build |
| `.env.docker` | Environment variables template |
| `deploy.sh` | Automated deployment script |

## Quick Start

### Local Development

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

### Deploy to Coolify

1. Upload entire project to Coolify
2. Select "Docker Compose" deployment
3. Set environment variables in Coolify dashboard
4. Deploy

## Environment Variables

See `.env.docker` for full list. Required:
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `DATABASE_URL` (if not using included PostgreSQL)

## Notes

- Dockerfile uses Node.js 22 Alpine (lightweight)
- Non-root user for security
- Health checks enabled on all services
- Multi-stage build for smaller images
- Uses `dumb-init` for proper signal handling
