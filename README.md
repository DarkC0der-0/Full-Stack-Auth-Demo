# Full-Stack Auth Demo

A complete authentication experience built with a React + TypeScript frontend and a NestJS + MongoDB backend. Users can sign up, sign in, hit protected routes, and log out. The repo is ready for a single Railway deployment that serves the frontend and backend from one service.

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind, motion, react-hook-form
- **Backend:** NestJS 10, MongoDB (Mongoose), JWT auth, class-validator
- **Testing:** Jest (backend unit + e2e), React Testing Library (frontend), Supertest
- **Tooling:** GitHub Actions CI, Railway/Nixpacks deployment, Swagger/OpenAPI docs

## Project Structure

```
├── README.md                 # You are here
├── src/                      # Frontend app (Vite)
├── backend/                  # NestJS API
│   ├── README.md             # Backend-specific docs
│   ├── src/                  # Auth, users, protected modules
│   └── test/                 # Unit & e2e tests
├── railway.json              # Railway deploy config
├── nixpacks.toml             # Nixpacks build phases (frontend + backend)
└── ...
```

## Prerequisites

- Node.js 20+
- npm 10+
- MongoDB 7+ (local or Atlas) for local runs
- Railway account (for deployment)

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

## Railway Deployment (Single Service)

This repo is pre-configured with `railway.json` + `nixpacks.toml` to deploy both apps in one Railway service.

1. **Create Railway project** and connect your GitHub repo.
2. **Add MongoDB plugin** (Railway → New → Database → MongoDB). Railway sets `MONGODB_URI` automatically.
3. **Set environment variables** (Railway Settings → Variables):
   ```env
   JWT_SECRET=your-super-secret-key
   JWT_EXPIRES_IN=7d
   PORT=3000
   BCRYPT_SALT_ROUNDS=10
   FRONTEND_URL=https://<service>.up.railway.app
   NODE_ENV=production
   ENABLE_SWAGGER=true          # or false to hide docs
   VITE_API_BASE_URL=https://<service>.up.railway.app
   ```
4. **Deploy** – Railway uses Nixpacks to:
   - `npm ci` (frontend) & `cd backend && npm ci`
   - `npm run build` (frontend) → copies `dist/` to `backend/public/`
   - `cd backend && npm run build`
   - Start command: `cd backend && npm run start:prod`
5. **Verify** – Visit the Railway URL, run a signup/signin flow, and open `/api/docs` if enabled.

## CI/CD

- `.github/workflows/ci.yml` runs linting, backend tests, frontend tests, and builds for both apps on every push/PR.
- Uncomment the `deploy` job to automatically deploy after passing CI (requires Railway token in GitHub secrets).

## Backend Details

See [`backend/README.md`](backend/README.md) for deeper documentation: architecture, logging, error handling, testing strategy, Swagger customization, and manual deployment notes.

## Contributing

1. Fork & clone the repo
2. Create a feature branch (`git checkout -b feature/auth-enhancements`)
3. Commit changes (`git commit -m "feat: add X"`)
4. Push and open a PR

---
Feel free to open issues or suggestions for improvements. Happy building!
