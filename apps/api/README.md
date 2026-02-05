# Brand Coach Network - Backend API

NestJS-based REST API server for The Brand Coach Network platform.

## Tech Stack

- **Framework**: NestJS 10.x
- **Language**: TypeScript 5.x
- **Database**: PostgreSQL 15
- **ORM**: TypeORM
- **Cache**: Redis 7
- **Authentication**: JWT with Passport
- **Validation**: class-validator, class-transformer
- **Testing**: Jest (unit tests) + Supertest (e2e tests)
- **Documentation**: Swagger/OpenAPI
- **Job Queue**: Bull (Redis-based)

## Prerequisites

- Node.js 18+ 
- PostgreSQL 15+ (or use Docker)
- Redis 7+ (or use Docker)
- npm or yarn

## Getting Started

### 1. Install Dependencies

From the root of the monorepo:
```bash
npm install
```

### 2. Environment Setup

Copy the example environment file and configure:
```bash
cd apps/api
cp .env.example .env
```

Edit `.env` with your configuration:
```env
NODE_ENV=development
PORT=4000
CORS_ORIGIN=http://localhost:3000

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5433
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=brandcoach
DATABASE_SYNC=true
DATABASE_LOGGING=true

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-key-at-least-32-characters-long
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
```

### 3. Start Database & Redis (Docker)

From the root of the monorepo:
```bash
docker-compose up -d
```

This starts:
- PostgreSQL on port **5433** (not 5432 to avoid conflicts)
- Redis on port **6379**

### 4. Run Database Migrations

```bash
npm run migration:run
```

### 5. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:4000`

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot-reload |
| `npm run build` | Build production bundle |
| `npm run start` | Start server (no watch) |
| `npm run start:prod` | Start production server |
| `npm run start:debug` | Start in debug mode |
| `npm test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:cov` | Generate test coverage report |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run lint` | Lint and fix code |
| `npm run format` | Format code with Prettier |
| `npm run migration:generate` | Generate new migration |
| `npm run migration:run` | Run pending migrations |
| `npm run migration:revert` | Revert last migration |

## Project Structure

```
src/
├── app.module.ts           # Root application module
├── main.ts                 # Application entry point
├── common/                 # Shared utilities
│   ├── cache/             # Cache service (Redis)
│   ├── config/            # Configuration & validation
│   ├── database/          # Database setup & migrations
│   ├── decorators/        # Custom decorators (@CurrentUser, @Public, etc.)
│   ├── dto/               # Common DTOs (pagination, etc.)
│   ├── entities/          # Base entities
│   ├── filters/           # Exception filters
│   ├── guards/            # Auth guards (JWT, roles, rate-limit)
│   ├── interceptors/      # Response transformation, logging
│   ├── middleware/        # Request middleware
│   └── pipes/             # Validation pipes
├── integrations/          # External service integrations
│   ├── aws/               # AWS S3, SES
│   ├── sendgrid/          # Email service
│   ├── twilio/            # SMS service
│   └── zoom/              # Video conferencing
├── jobs/                  # Background jobs & queues
│   ├── processors/        # Bull job processors
│   └── queues/            # Queue definitions
└── modules/               # Feature modules
    ├── analytics/         # Analytics & reporting
    ├── assessments/       # User assessments
    ├── auth/             # Authentication & authorization
    ├── coaching/         # Coaching sessions
    ├── community/        # Community features
    ├── enrollments/      # Program enrollments
    ├── events/           # Event management
    ├── messaging/        # In-app messaging
    ├── notifications/    # Push notifications
    ├── partners/         # Partner management
    ├── payments/         # Payment processing
    ├── programs/         # Program management
    └── users/            # User management
```

## API Documentation

When the server is running, access:
- **Swagger UI**: http://localhost:4000/api/docs
- **OpenAPI JSON**: http://localhost:4000/api/docs-json

## Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. **Register**: `POST /api/v1/auth/register`
2. **Login**: `POST /api/v1/auth/login` → Returns access & refresh tokens
3. **Use Access Token**: Add header `Authorization: Bearer {access_token}`
4. **Refresh**: `POST /api/v1/auth/refresh` with refresh token

## Testing

### Unit Tests
```bash
npm run test              # Run all unit tests
npm run test:watch        # Watch mode
npm run test:cov          # With coverage
```

**Current Status**: 48 passing tests

### E2E Tests
```bash
npm run test:e2e          # Run all e2e tests
```

**Current Status**: 35 passing tests, 25 todo (future features)

**Note**: E2E tests require Docker containers to be running (PostgreSQL & Redis).

## Database Management

### Auto-sync (Development Only)
Set `DATABASE_SYNC=true` in `.env` to automatically sync schema changes. 

⚠️ **Never use in production!**

### Migrations (Production)
```bash
# Generate migration from entity changes
npm run migration:generate -- -n MigrationName

# Run pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | API server port | `4000` |
| `DATABASE_HOST` | PostgreSQL host | `localhost` |
| `DATABASE_PORT` | PostgreSQL port | `5433` |
| `DATABASE_USERNAME` | Database user | `postgres` |
| `DATABASE_PASSWORD` | Database password | - |
| `DATABASE_NAME` | Database name | `brandcoach` |
| `DATABASE_SYNC` | Auto-sync schema (dev only) | `false` |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | - |
| `JWT_ACCESS_EXPIRATION` | Access token TTL | `15m` |
| `JWT_REFRESH_EXPIRATION` | Refresh token TTL | `7d` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:3000` |

## Troubleshooting

### Port 5432 Already in Use
If you have PostgreSQL running locally, the Docker container uses port **5433** instead to avoid conflicts. Update `DATABASE_PORT=5433` in your `.env`.

### Redis Connection Errors
Ensure Docker containers are running:
```bash
docker-compose ps
```

### Database Authentication Failed
Check your `.env` credentials match the `docker-compose.yml` settings.

### Module Not Found
Clean install dependencies:
```bash
rm -rf node_modules package-lock.json
npm install
```

## Performance

- **Caching**: Redis caching for frequently accessed data
- **Rate Limiting**: Throttler guard protects against abuse
- **Compression**: gzip compression enabled
- **Database Indexing**: Optimized queries with proper indexes
- **Connection Pooling**: PostgreSQL connection pool configured

## Security

- **Helmet**: Security headers
- **CORS**: Configured origins only
- **Validation**: Input validation on all endpoints
- **Password Hashing**: bcrypt with salt rounds
- **JWT**: Secure token-based authentication
- **Rate Limiting**: Per-endpoint throttling

## Development Tips

### Debug Mode
```bash
npm run start:debug
```
Then attach your debugger to `localhost:9229`

### Watch Tests
```bash
npm run test:watch
```

### Database GUI
Use your preferred PostgreSQL client:
- **Host**: localhost
- **Port**: 5433
- **Database**: brandcoach
- **User**: postgres
- **Password**: postgres

## API Versioning

All routes are prefixed with `/api/v1/`:
```
http://localhost:4000/api/v1/auth/login
http://localhost:4000/api/v1/users
http://localhost:4000/api/v1/programs
```

## Contributing

1. Create feature branch from `main`
2. Write tests for new features
3. Ensure all tests pass: `npm test && npm run test:e2e`
4. Follow code style: `npm run lint && npm run format`
5. Submit pull request

## License

Proprietary - The Brand Coach Network © 2026
