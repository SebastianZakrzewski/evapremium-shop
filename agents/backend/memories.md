=== CORE MEMORY ===

## Tech Stack

Frontend: Next.js 14 (TypeScript) + Tailwind CSS + shadcn/ui  
Backend: Next.js API Routes + Supabase Edge Functions (Deno)  
Database: Supabase (PostgreSQL + Row Level Security)  
AI / Automation: FastAPI (Python) + LangChain + Qdrant + OpenAI API

Hosting:  
- Frontend → Vercel  
- Backend + DB → Supabase Cloud  
- AI → Railway / Render / AWS Lambda

CI/CD: GitHub Actions + Docker Compose

Integrations:  
Bitrix24 API, Shopify API, WhatsApp Cloud API, SendGrid / Resend API, OpenAI API, Supabase API, Qdrant API, GitHub Actions API

---

## Conventions

- Components use PascalCase  
- Hooks live in `/hooks`  
- API routes in `/app/api`  
- Folder structure: `frontend` / `backend` / `db`  
- Language for technical communication: English, clear and structured

---

## Philosophy

- Prioritize simplicity and fast MVP delivery.  
- Prefer modular, clean, scalable solutions.  
- Communicate clearly and directly.  
- Avoid unnecessary complexity.  
- Focus on delivering business value quickly.

---

## Brand / Organization Context

- Company: SellGenius  
- Focus: AI agents, e-commerce automation, marketing automation  
- Target Markets: SaaS, e-commerce, service businesses  
- Tone: professional, approachable, pragmatic  
- Communication Style: structured, benefit-oriented, no fluff

---

## Communication Standards

- Default language: English (technical), Polish (user-facing when needed)  
- Output formats:  
  - Markdown → documentation  
  - JSON → structured data  
  - Plaintext → quick answers
- Style: clear, concise, structured (headings, bullet points, code blocks when relevant)

---

## Internal Workflows

- For new projects: always define core KPIs, MVP scope, and architecture before implementation.  
- Use sprint planning (1–4 weeks) for execution.  
- Documentation should be created alongside development, not after.

---

=== BACKEND PROJECT MEMORY ===

## Actual Tech Stack (from package.json)

**Frontend Framework:**
- Next.js 15.3.4 (App Router)
- React 18 + React DOM 18
- TypeScript 5 (strict mode)

**Backend & API:**
- Next.js API Routes (w `/app/api/`)
- Supabase 2.38.4 (baza danych + auth + storage)
- PostgreSQL (przez Supabase)

**Database & ORM:**
- Prisma 5.7.1 (ORM)
- PostgreSQL (baza danych)
- Supabase (hosting bazy danych)

**State Management & Data Fetching:**
- TanStack React Query 5.8.4 (server state)
- React Hook Form 7.48.2 (formularze)
- Zod 3.22.4 (walidacja)

**Authentication & Sessions:**
- cookies-next 5.1.0 (zarządzanie sesjami)
- Supabase Auth (uwierzytelnianie)

**Styling & UI:**
- Tailwind CSS 4.1.10 (najnowsza wersja)
- shadcn/ui (komponenty UI)
- Radix UI (prymitywy UI - 20+ komponentów)

**Testing:**
- Vitest 1.0.4 (test runner)
- React Testing Library 14.1.2 (testowanie komponentów)
- Jest DOM 6.1.5 (matchers)

**Development Tools:**
- ESLint 8 + Next.js config
- Prettier (przez ESLint)
- PostCSS 8.5.6 + Autoprefixer
- Vite 5.0.8 (dla testów)

### Backend Architecture

**Hybrid Approach:**
- Prisma ORM + Supabase PostgreSQL (database operations)
- Supabase Client (auth, storage, real-time features)
- Next.js API Routes (REST endpoints)

**File Structure:**
- API routes: `/app/api/[feature]/route.ts`
- Database client: `/src/lib/database/supabase.ts`
- Prisma schema: `/prisma/schema.prisma`
- Generated Prisma client: `/src/generated/prisma`

### Special Rules

- Use `/app/api` routes for backend endpoints
- Prisma Client is generated to `/src/generated/prisma`
- Follow RESTful conventions for routes: `/api/[feature]/route.ts`
- Use Zod for validating request bodies and parameters
- Handle authentication using cookies-next sessions + Supabase Auth
- Use Supabase client for auth, storage, real-time features
- Use Prisma for database operations (CRUD)
- Do not suggest external frameworks (e.g., Express, Nest) unless explicitly stated
- If new dependencies are required, explain why and how to install them