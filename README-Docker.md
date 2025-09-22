# VolumeApp - Docker Deployment Guide

## 🐳 Docker Deployment

This guide explains how to deploy the VolumeApp using Docker for production environments.

## Prerequisites

- Docker installed on your system
- Docker Compose (optional, but recommended)

## Quick Start with Docker Compose (Recommended)

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd VolumeApp
   ```

2. **Start the application:**
   ```bash
   docker-compose up -d
   ```

3. **Access the application:**
   - Open your browser and go to `http://localhost:3000`

## Manual Docker Build and Run

### Build the Docker image:
```bash
docker build -t volume-app .
```

### Run the container:
```bash
docker run -d \
  --name volume-app \
  -p 3000:3000 \
  -v $(pwd)/workout.db:/app/workout.db \
  volume-app
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `production` | Node.js environment |
| `PORT` | `3000` | Application port |

## Data Persistence

The SQLite database (`workout.db`) is persisted using Docker volumes:
- **Docker Compose**: Automatically mounted as volume
- **Manual Docker**: Use `-v $(pwd)/workout.db:/app/workout.db`

## Health Check

The application includes a health check endpoint at `/health` that:
- Verifies database connectivity
- Returns application status and uptime
- Used by Docker for container health monitoring

## Production Considerations

### Security
- The container runs as a non-root user (`nextjs:nodejs`)
- Only production dependencies are installed
- Sensitive files are excluded via `.dockerignore`

### Performance
- Uses Alpine Linux for smaller image size
- Multi-stage build optimization
- Health checks for container monitoring

### Monitoring
```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs -f volume-app

# Check health status
curl http://localhost:3000/health
```

## Stopping the Application

### Docker Compose:
```bash
docker-compose down
```

### Manual Docker:
```bash
docker stop volume-app
docker rm volume-app
```

## Troubleshooting

### Container won't start:
```bash
# Check logs
docker-compose logs volume-app

# Check if port is available
lsof -i :3000
```

### Database issues:
```bash
# Verify database file permissions
ls -la workout.db

# Check health endpoint
curl http://localhost:3000/health
```

### Reset everything:
```bash
# Stop and remove containers, networks, and volumes
docker-compose down -v

# Remove the image
docker rmi volume-app

# Rebuild and start
docker-compose up --build -d
```

## Development with Docker

For development with hot reload:
```bash
# Use nodemon in development
docker run -d \
  --name volume-app-dev \
  -p 3000:3000 \
  -v $(pwd):/app \
  -e NODE_ENV=development \
  volume-app npm run dev
```