# Auth Backend API

A NestJS authentication backend with MongoDB, featuring user signup/signin, JWT-based authentication, and protected routes.

## Tech Stack

- **Framework:** NestJS (TypeScript)
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens) with Passport.js
- **Validation:** class-validator & class-transformer
- **Documentation:** Swagger/OpenAPI
- **Security:** Helmet, bcrypt password hashing

## Prerequisites

- Node.js >= 18.x
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## Installation

1. **Clone and navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/auth-app
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_EXPIRES_IN=7d
   PORT=3000
   BCRYPT_SALT_ROUNDS=10
   ```

4. **Start MongoDB** (if running locally):
   ```bash
   mongod
   ```

## Running the Application

```bash
# Development mode (with hot reload)
npm run start:dev

# Production mode
npm run build
npm run start:prod

# Debug mode
npm run start:debug
```

The server will start at `http://localhost:3000`

## API Documentation

Swagger documentation is available at: `http://localhost:3000/api/docs`

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/signup` | Register a new user | No |
| POST | `/auth/signin` | Sign in existing user | No |

### Protected Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/protected/welcome` | Get welcome message | Yes (JWT) |
| GET | `/protected/me` | Get current user profile | Yes (JWT) |

## Request/Response Examples

### Sign Up

**Request:**
```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "John Doe",
    "password": "Password1!"
  }'
```

**Response:**
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Sign In

**Request:**
```bash
curl -X POST http://localhost:3000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password1!"
  }'
```

**Response:**
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Protected Endpoint

**Request:**
```bash
curl -X GET http://localhost:3000/protected/welcome \
  -H "Authorization: Bearer <your_access_token>"
```

**Response:**
```json
{
  "message": "Welcome to the application",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

## Validation Rules

### Sign Up Fields

| Field | Rules |
|-------|-------|
| email | Valid email format |
| name | Minimum 3 characters |
| password | Min 8 chars, at least one letter, one number, one special character |

## Project Structure

```
backend/
├── src/
│   ├── auth/
│   │   ├── decorators/
│   │   │   └── current-user.decorator.ts
│   │   ├── dto/
│   │   │   ├── auth-response.dto.ts
│   │   │   ├── signin.dto.ts
│   │   │   ├── signup.dto.ts
│   │   │   └── index.ts
│   │   ├── guards/
│   │   │   └── jwt-auth.guard.ts
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   └── auth.service.ts
│   ├── protected/
│   │   ├── protected.controller.ts
│   │   └── protected.module.ts
│   ├── users/
│   │   ├── schemas/
│   │   │   └── user.schema.ts
│   │   ├── users.module.ts
│   │   └── users.service.ts
│   ├── app.module.ts
│   └── main.ts
├── .env.example
├── .gitignore
├── nest-cli.json
├── package.json
├── README.md
└── tsconfig.json
```

## Security Features

- **Password Hashing:** bcrypt with configurable salt rounds
- **JWT Authentication:** Secure token-based authentication
- **Helmet:** HTTP security headers
- **Input Validation:** All inputs validated using class-validator
- **CORS:** Configurable cross-origin resource sharing
- **Environment Variables:** Sensitive data stored in environment variables

## Logging

The application uses NestJS built-in Logger for:
- Startup information
- Authentication events (signup/signin attempts)
- Protected route access
- Error logging

## Testing

```bash
# Unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:cov

# End-to-end tests (uses MongoMemoryServer)
npm run test:e2e
```

### Test Coverage

- **Unit Tests:** `AuthService`, `UsersService` with mocked dependencies
- **E2E Tests:** Full integration tests for `/auth/signup`, `/auth/signin`, `/protected/welcome`, `/protected/me`
- **In-memory MongoDB:** Tests use `mongodb-memory-server` for isolated, fast testing

## CI/CD Pipeline

The project includes a GitHub Actions workflow (`.github/workflows/ci.yml`) that runs on every push and pull request:

1. **Lint & Test Backend:** Runs `npm run lint`, `npm run test`, `npm run test:e2e`
2. **Lint & Test Frontend:** Runs frontend linting and tests
3. **Build:** Builds both frontend and backend, uploads artifacts

### Enabling Deployment

To enable automatic deployment to Railway/Render:

1. Uncomment the `deploy` job in `.github/workflows/ci.yml`
2. Add `RAILWAY_TOKEN` (or equivalent) to GitHub Secrets
3. Push to `main` branch

## Deployment

### Railway Deployment (Recommended for Review)

This project is pre-configured for Railway with `railway.json` and `nixpacks.toml` at the repo root.

#### Quick Deploy Steps

1. **Create a Railway project** at [railway.app](https://railway.app)
2. **Connect your GitHub repository**
3. **Add MongoDB plugin:**
   - Click "New" → "Database" → "MongoDB"
   - Railway auto-creates `MONGODB_URI` env var
4. **Set environment variables** (Settings → Variables):
   ```env
   JWT_SECRET=your-super-secret-jwt-key-change-this
   JWT_EXPIRES_IN=7d
   PORT=3000
   BCRYPT_SALT_ROUNDS=10
   FRONTEND_URL=https://<your-service>.up.railway.app
   NODE_ENV=production
   ENABLE_SWAGGER=true
   VITE_API_BASE_URL=https://<your-service>.up.railway.app
   ```
5. **Deploy** - Railway auto-detects `nixpacks.toml` and runs:
   - Installs deps (frontend + backend)
   - Builds frontend (`npm run build`)
   - Builds backend (`cd backend && npm run build`)
   - Copies frontend `dist/` to `backend/public/`
   - Starts: `cd backend && npm run start:prod`

6. **Access your app:**
   - Frontend: `https://<your-service>.up.railway.app`
   - API docs: `https://<your-service>.up.railway.app/api/docs`

#### How It Works

- **`nixpacks.toml`** defines build phases: install deps, build both apps, copy frontend to `backend/public/`
- **`ServeStaticModule`** in `AppModule` serves static files from `backend/public/` (already configured)
- **API routes** (`/auth/*`, `/protected/*`) are excluded from static serving

### Manual Deployment (Other Hosts)

For other platforms (Render, Fly.io, etc.):

1. Build frontend: `npm run build` (at repo root)
2. Copy `dist/` to `backend/public/`
3. Build backend: `cd backend && npm run build`
4. Start: `cd backend && npm run start:prod`
5. Set all env vars as listed above

## API Documentation

- **Swagger UI:** `http://localhost:3000/api/docs`
- **OpenAPI JSON:** Auto-exported to `openapi.json` on startup
- **Production:** Swagger can be disabled by setting `ENABLE_SWAGGER=false`

## Error Handling

The application uses a global `HttpExceptionFilter` that:

- Formats all errors consistently with `statusCode`, `message`, `error`, `timestamp`, `path`, `method`
- Logs error details including stack traces for unexpected errors
- Returns user-friendly error messages

## License

MIT
