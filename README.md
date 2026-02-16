# Full-Stack Auth Demo

A complete authentication experience built with a React + TypeScript frontend and a NestJS + MongoDB backend. Users can sign up, sign in, hit protected routes, and log out. The repo is ready for deployment on DigitalOcean App Platform using Docker, serving both frontend and backend from a single container.

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind, motion, react-hook-form
- **Backend:** NestJS 10, MongoDB (Mongoose), JWT auth, class-validator
- **Testing:** Jest (backend unit + e2e), React Testing Library (frontend), Supertest
- **Tooling:** GitHub Actions CI, Docker deployment (DigitalOcean), Swagger/OpenAPI docs

## Project Structure

```
├── README.md                 # You are here
├── Dockerfile                # Docker build config
├── .dockerignore             # Docker ignore patterns
├── .do/                      # DigitalOcean App Platform config
│   └── app.yaml              # Deployment configuration
├── src/                      # Frontend app (Vite)
├── backend/                  # NestJS API
│   ├── README.md             # Backend-specific docs
│   ├── src/                  # Auth, users, protected modules
│   └── test/                 # Unit & e2e tests
└── ...
```

## Prerequisites

- Node.js 20+
- npm 10+
- MongoDB 7+ (local or Atlas) for local runs
- DigitalOcean account (for deployment)

## Environment Variables

Create two files from the provided examples:

```bash
cp .env.example .env               # frontend
cp backend/.env.example backend/.env
```

Key values:

| Variable | Location | Description |
|----------|----------|-------------|
| `VITE_API_BASE_URL` | `.env` (root) | Base URL for API calls (default `http://localhost:3000`) |
| `MONGODB_URI` | `backend/.env` | Mongo connection string |
| `JWT_SECRET` | `backend/.env` | Secret for signing JWTs |
| `JWT_EXPIRES_IN` | `backend/.env` | Token lifetime (e.g. `7d`) |
| `BCRYPT_SALT_ROUNDS` | `backend/.env` | Salt rounds for password hashing |
| `PORT` | `backend/.env` | Backend server port |
| `FRONTEND_URL` | `backend/.env` | Allowed CORS origin(s) |
| `ENABLE_SWAGGER` | `backend/.env` | Toggle Swagger docs in production |

## Local Development

### 1. Install dependencies
```bash
npm install              # frontend deps
cd backend && npm install
```

### 2. Run MongoDB
```bash
mongod
```
(Or point `MONGODB_URI` to MongoDB Atlas.)

### 3. Start backend
```bash
cd backend
npm run start:dev
```
Backend runs on `http://localhost:3000`.

### 4. Start frontend
```bash
npm run dev
```
Frontend runs on `http://localhost:5173` and proxies API calls to the backend via `VITE_API_BASE_URL`.

## Testing

### Backend
```bash
cd backend
npm run test          # unit tests (AuthService, UsersService)
npm run test:e2e      # integration tests using MongoMemoryServer
npm run test:cov      # coverage report
```

### Frontend
```bash
npm run test -- --watch  # React Testing Library (if configured)
```

## API Documentation

- Local Swagger UI: `http://localhost:3000/api/docs`
- OpenAPI JSON auto-exported to `backend/openapi.json` on startup.
- Protected routes require a `Bearer <token>` header.

## DigitalOcean App Platform Deployment

This repo uses a `Dockerfile` and `.do/app.yaml` to deploy both frontend and backend in a single container on DigitalOcean.

### Prerequisites

1. **MongoDB Atlas** (free tier):
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Create cluster → Get connection string
   - Network Access → Allow `0.0.0.0/0`

2. **DigitalOcean Account**:
   - Sign up at [digitalocean.com](https://digitalocean.com)
   - New users get **$200 free credit** for 60 days

### Deployment Steps

#### Step 1: Create App

1. Go to [cloud.digitalocean.com/apps](https://cloud.digitalocean.com/apps)
2. Click **Create App**
3. Choose **GitHub** → Authorize DigitalOcean
4. Select repository: `DarkC0der-0/Full-Stack-Auth-Demo`
5. Select branch: `main`
6. Click **Next**

#### Step 2: Configure Resources

DigitalOcean auto-detects the Dockerfile:

- **Resource Type**: Web Service
- **Name**: `web`
- **Dockerfile Path**: `Dockerfile` (auto-detected)
- **HTTP Port**: `3000`
- **Instance Size**: Basic (512 MB RAM / 1 vCPU) - **$5/month**
- **Instance Count**: 1

Click **Next**

#### Step 3: Environment Variables

Add these in the **Environment Variables** section:

**Required (set as encrypted):**
```
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/auth-app
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
```

**Auto-configured (already in `.do/app.yaml`):**
- `PORT=3000`
- `NODE_ENV=production`
- `JWT_EXPIRES_IN=7d`
- `BCRYPT_SALT_ROUNDS=10`
- `ENABLE_SWAGGER=true`

Click **Next**

#### Step 4: App Info

- **Name**: `fullstack-auth-demo` (or your choice)
- **Region**: Choose closest to you (e.g., `nyc`, `sfo`, `fra`)

Click **Next** → **Create Resources**

#### Step 5: Update URLs

After deployment completes, you'll get a URL like:
```
https://fullstack-auth-demo-xxxxx.ondigitalocean.app
```

Go back to **Settings** → **Environment Variables** and add:
```
FRONTEND_URL=https://fullstack-auth-demo-xxxxx.ondigitalocean.app
VITE_API_BASE_URL=https://fullstack-auth-demo-xxxxx.ondigitalocean.app
```

Click **Save** → App will auto-redeploy

### Verify Deployment

1. **Frontend**: Visit `https://your-app.ondigitalocean.app/`
2. **API Docs**: Visit `https://your-app.ondigitalocean.app/api/docs`
3. **Test**: Sign up → Sign in → Access protected routes

### Using the CLI (Alternative)

Install DigitalOcean CLI:
```bash
brew install doctl  # macOS
# or download from: https://docs.digitalocean.com/reference/doctl/how-to/install/
```

Authenticate:
```bash
doctl auth init
```

Deploy:
```bash
doctl apps create --spec .do/app.yaml
```

### Cost

- **Basic plan**: $5/month (512 MB RAM, 1 vCPU)
- **Professional plan**: $12/month (1 GB RAM, 1 vCPU)
- **Free credit**: $200 for new accounts (60 days)

### Auto-Deployment

The `.do/app.yaml` config enables auto-deployment:
- Every push to `main` triggers a new deployment
- Build takes ~3-5 minutes
- Zero-downtime rolling updates

## CI/CD

- `.github/workflows/ci.yml` runs linting, backend tests, frontend tests, and builds for both apps on every push/PR.
- Uncomment the `deploy` job to automatically deploy after passing CI (requires DigitalOcean API token in GitHub secrets).

## Backend Details

See [`backend/README.md`](backend/README.md) for deeper documentation: architecture, logging, error handling, testing strategy, Swagger customization, and manual deployment notes.

## Contributing

1. Fork & clone the repo
2. Create a feature branch (`git checkout -b feature/auth-enhancements`)
3. Commit changes (`git commit -m "feat: add X"`)
4. Push and open a PR

---
Feel free to open issues or suggestions for improvements. Happy building!
