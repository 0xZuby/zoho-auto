# Employee Onboarding Prototype

Two open testing applications: a Next.js employee/auditor UI and an Express API backed by MongoDB. Provisioning is simulated; no Zoho calls occur.

## Run

1. Copy `backend/.env.example` to `backend/.env` and set `MONGODB_URI`.
2. Run `npm install` at the repository root.
3. Run `npm run dev`.
4. Open `http://localhost:3000/onboarding` to submit a request or `http://localhost:3000/auditor` to review one.

The dashboard list exposes only request ID, status, and timestamp of submission. Full details appear only after opening a request.
