# Full-Stack Auth Demo

A complete authentication experience built with a React + TypeScript frontend and a NestJS + MongoDB backend. Users can sign up, sign in, hit protected routes, and log out. The repo is ready for deployment on Render using Docker, serving both frontend and backend from a single container.

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind, motion, react-hook-form
- **Backend:** NestJS 10, MongoDB (Mongoose), JWT auth, class-validator
- **Testing:** Jest (backend unit + e2e), React Testing Library (frontend), Supertest
- **Tooling:** GitHub Actions CI, Docker deployment (Render), Swagger/OpenAPI docs

## Project Structure

```
├── README.md                 # You are here
├── Dockerfile                # Docker build config
├── .dockerignore             # Docker ignore patterns
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
- Render account (for deployment)

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

## Deployment Options

This repo supports multiple deployment platforms. Choose the one that best fits your needs:

- **[AWS Elastic Beanstalk](#aws-elastic-beanstalk-deployment)** - Production-grade, scalable, full AWS integration
- **[Render](#render-deployment-docker)** - Simple, Docker-based, generous free tier

---

## AWS Elastic Beanstalk Deployment

Deploy to AWS using Docker with Elastic Beanstalk for production-grade infrastructure.

**📖 Full Guide**: See [`AWS_DEPLOYMENT.md`](AWS_DEPLOYMENT.md) for detailed instructions.

### Quick Start

1. **Install AWS & EB CLI**:
   ```bash
   pip install awsebcli --upgrade --user
   aws configure
   ```

2. **Initialize & Create Environment**:
   ```bash
   eb init -p docker fullstack-auth-demo
   eb create fullstack-auth-prod
   ```

3. **Set Environment Variables**:
   ```bash
   eb setenv \
     MONGODB_URI="mongodb+srv://..." \
     JWT_SECRET="your-secret" \
     JWT_EXPIRES_IN="7d" \
     PORT="3000" \
     BCRYPT_SALT_ROUNDS="10" \
     NODE_ENV="production" \
     ENABLE_SWAGGER="true"
   ```

4. **Get URL and update CORS**:
   ```bash
   eb status  # Copy CNAME
   eb setenv \
     FRONTEND_URL="https://<your-env>.elasticbeanstalk.com" \
     VITE_API_BASE_URL="https://<your-env>.elasticbeanstalk.com"
   ```

5. **Deploy**:
   ```bash
   eb deploy
   eb open
   ```

**Cost**: ~$15-30/month (free tier available for 12 months)

---

## Render Deployment (Docker)

This repo uses a `Dockerfile` to deploy both frontend and backend in a single container on Render.

### Step 1: Create Render Web Service

1. Go to [render.com](https://render.com) and sign in with GitHub
2. Click **Dashboard** → **New +** → **Web Service**
3. Connect your GitHub repo: `DarkC0der-0/Full-Stack-Auth-Demo`

### Step 2: Configure Service

| Setting | Value |
|---------|-------|
| **Name** | `fullstack-auth-demo` |
| **Region** | Your preference |
| **Branch** | `main` |
| **Environment** | **Docker** |
| **Dockerfile Path** | `Dockerfile` |
| **Build Command** | *(leave blank)* |
| **Start Command** | *(leave blank)* |

### Step 3: Set Environment Variables

Add these in the **Environment** tab:

```env
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/auth-app
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d
PORT=3000
BCRYPT_SALT_ROUNDS=10
NODE_ENV=production
ENABLE_SWAGGER=true
FRONTEND_URL=https://<your-service>.onrender.com
VITE_API_BASE_URL=https://<your-service>.onrender.com
```

*(Replace `<your-service>` with your actual Render service name after creation)*

### Step 4: Deploy & Verify

1. Click **Create Web Service**
2. Wait for build to complete (~5-10 minutes)
3. Visit `https://<your-service>.onrender.com/` for frontend
4. Visit `https://<your-service>.onrender.com/api/docs` for Swagger UI
5. Test signup/signin flow

## CI/CD

- `.github/workflows/ci.yml` runs linting, backend tests, frontend tests, and builds for both apps on every push/PR.
- Uncomment the `deploy` job to automatically deploy after passing CI (requires Render API key in GitHub secrets).

## Backend Details

See [`backend/README.md`](backend/README.md) for deeper documentation: architecture, logging, error handling, testing strategy, Swagger customization, and manual deployment notes.

## Contributing

1. Fork & clone the repo
2. Create a feature branch (`git checkout -b feature/auth-enhancements`)
3. Commit changes (`git commit -m "feat: add X"`)
4. Push and open a PR

---
Feel free to open issues or suggestions for improvements. Happy building!
