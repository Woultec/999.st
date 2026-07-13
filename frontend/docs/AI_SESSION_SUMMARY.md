# 🤖 AI Session Summary — 999.st Ecommerce Project

> **Basahin ito ng AI sa simula ng bagong session para maintindihan ang current state ng project.**

---

## 📋 **Project Overview**

| Field | Value |
|-------|-------|
| **Project Name** | 999.st Ecommerce |
| **Description** | Clothing brand ecommerce |
| **Client** | Owner ng 999.st clothing brand |
| **Language** | Filipino (Tagalog) — ang user ay nag-aaral ng full-stack development |
| **Backend Path** | `C:\Users\user\LocalDesktop\experiment\999.st\backend` |
| **Frontend Path** | `C:\Users\user\LocalDesktop\experiment\999.st\frontend` (not yet created) |
| **Server** | http://localhost:5000 |
| **Database** | PostgreSQL `999st` on localhost:5432 |

---

## 🛠️ **Current Tech Stack**

| Layer | Technology | Version | Notes |
|-------|------------|---------|-------|
| **Runtime** | Node.js | v22.22.0 | Windows |
| **Backend** | Express.js | 5.x | With TypeScript |
| **ORM** | Prisma | 7.8.0 | Uses `@prisma/adapter-pg` driver adapter |
| **Database** | PostgreSQL | 17.10 | Local |
| **Auth** | JWT + bcrypt | — | `jsonwebtoken` + `bcrypt` |
| **Language** | TypeScript | ~6.x | With strict mode |
| **Dev Server** | tsx | 4.x | Watch mode (`npm run dev`) |

---

## 📁 **Backend Project Structure**

```
backend/
├── prisma/
│   ├── schema.prisma              # Database schema (User + Product)
│   └── migrations/                # SQL migrations (init, add-auth, add-user-relation)
├── prisma.config.ts               # Prisma 7 config (reads .env)
├── src/
│   ├── prisma/
│   │   └── client.ts              # PrismaClient singleton (PrismaPg adapter)
│   ├── app.ts                     # Express app (cors, json, routes, error handlers)
│   ├── server.ts                  # Entry point (port 5000)
│   ├── routes/
│   │   ├── index.ts               # Router aggregator
│   │   ├── health.routes.ts       # GET /api/health
│   │   ├── user.routes.ts         # CRUD /api/users
│   │   ├── product.routes.ts      # CRUD /api/products (admin-protected)
│   │   └── auth.routes.ts         # POST /api/auth/register, /login, GET /me
│   ├── controllers/
│   │   ├── health.controller.ts
│   │   ├── user.controller.ts
│   │   ├── product.controller.ts
│   │   └── auth.controller.ts
│   ├── services/
│   │   ├── health.service.ts
│   │   ├── user.service.ts
│   │   ├── product.service.ts
│   │   └── auth.service.ts
│   ├── middlewares/
│   │   ├── auth.middleware.ts     # authenticate() + requireAdmin()
│   │   └── error.middleware.ts    # 404 handler + global error handler
│   └── utils/
│       └── ApiError.ts           # Custom error class
├── docs/                          # Project documentation
├── .env                           # DATABASE_URL + JWT_SECRET + DB_*
└── package.json
```

---

## 🗄️ **Database Schema (Prisma)**

### User Model — `users` table
| Field | Type | Notes |
|-------|------|-------|
| `id` | Int (PK, autoincrement) | |
| `name` | String | |
| `email` | String (unique) | |
| `password` | String? | null para sa future Google OAuth buyers |
| `role` | String (default "BUYER") | "ADMIN" o "BUYER" |
| `products` | Product[] | Relation |
| `createdAt` | DateTime | |

### Product Model — `products` table
| Field | Type | Notes |
|-------|------|-------|
| `id` | Int (PK, autoincrement) | |
| `name` | String | |
| `description` | String | |
| `price` | Float | |
| `imageUrl` | String? | |
| `userId` | Int (FK → users.id) | Sino ang nag-post |
| `user` | User | Relation with select (id, name, email) |
| `createdAt` | DateTime | |

---

## 🌐 **API Endpoints — Complete List**

### Public Routes
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/health` | Health check | ❌ |
| GET | `/api/users` | Get all users | ❌ |
| GET | `/api/users/:id` | Get user by ID | ❌ |
| POST | `/api/users` | Create user | ❌ |
| PUT | `/api/users/:id` | Update user | ❌ |
| DELETE | `/api/users/:id` | Delete user | ❌ |
| GET | `/api/products` | Get all products | ❌ |
| GET | `/api/products/:id` | Get product by ID | ❌ |

### Auth Routes
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register as ADMIN | ❌ |
| POST | `/api/auth/login` | Login (returns JWT) | ❌ |
| GET | `/api/auth/me` | Get current user info | ✅ Bearer Token |

### Admin-Protected Routes
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/products` | Create product | ✅ Admin only |
| PUT | `/api/products/:id` | Update product | ✅ Admin only |
| DELETE | `/api/products/:id` | Delete product | ✅ Admin only |

### Auth Flow
1. Register via `POST /api/auth/register` → returns `{ user, token }`
2. Store token in `localStorage` (frontend) or use directly in Postman
3. Send token as `Authorization: Bearer <token>`
4. `authenticate` middleware validates JWT
5. `requireAdmin` middleware checks `role === "ADMIN"`

**JWT Payload:**
```json
{ "id": 4, "email": "admin@email.com", "role": "ADMIN", "iat": ..., "exp": ... }
```

**Response Format (consistent):**
```json
{
  "success": true/false,
  "data": { ... },
  "statusCode": 200,
  "message": "..."
}
```

---

## ✅ **Completed Milestones**

| # | Phase | Status | Details |
|---|-------|--------|---------|
| 1 | Backend Setup | ✅ | Express + TypeScript + tsx watch mode |
| 2 | Health Check | ✅ | GET /api/health |
| 3 | Users CRUD | ✅ | GET, POST, PUT, DELETE /api/users |
| 4 | Products CRUD | ✅ | GET, POST, PUT, DELETE /api/products |
| 5 | PostgreSQL + Prisma | ✅ | Prisma 7 with @prisma/adapter-pg |
| 6 | Admin Auth (JWT) | ✅ | register, login, getMe with bcrypt hashing |
| 7 | User ↔ Product Relation | ✅ | userId FK, include user in product response |
| 8 | Role-Based Access | ✅ | authenticate + requireAdmin middleware |
| 9 | Error Handling | ✅ | Consistent JSON format, global error handler |

---

## 📝 **Unresolved/Decided Design Choices**

1. **Single Admin** — Isa lang ang admin (client/owner ng 999.st). Silang ni-client ang magpo-post ng mga clothing products.
2. **Buyers** — gagamit ng Google OAuth para sa simpleng login (not yet implemented)
3. **Product ↔ User** — required na relation, pero existing data mula sa migration reset ay wala nang userId (na-reset na lahat)
4. **.env format** — `DATABASE_URL=postgresql://postgres:bingbonter@localhost:5432/999st` (walang quotes!)
5. **Migration issues** — na-solve na: kailangan ng `npx prisma generate` pagkatapos ng migration para ma-update ang Prisma Client types

---

## 🔜 **Next Steps (Priority Order)**

| Priority | Task | Description |
|----------|------|-------------|
| **1** 🥇 | **Run migration** | `npx prisma migrate dev --name add-user-relation` (ikaw gagawa sa backend) |
| **2** 🥇 | **Frontend Setup** | React + Vite + TypeScript + Tailwind v4 |
| **3** 🥇 | **Frontend Pages** | Home (products), Admin Dashboard, Login page |
| **4** 🥈 | **Product Images** | Cloudinary or similar image hosting |
| **5** 🥉 | **Google OAuth** | Para sa buyers (simpleng Gmail login) |

---

## ⚠️ **Important Technical Details**

### Prisma 7 Specifics
- **Config file:** `prisma.config.ts` instead of `url` in `schema.prisma`
- **Driver adapter:** `@prisma/adapter-pg` with `PrismaPg({ connectionString })`
- **Preview feature:** `driverAdapters` is deprecated in 7.8.0 (removed from schema)
- **Generate after migrate:** Always run `npx prisma generate` after schema changes

### PostgreSQL Connection
- Database: `999st`
- User: `postgres`
- Password: `bingbonter`
- Connection string: `postgresql://postgres:bingbonter@localhost:5432/999st`
- Test connection via: `psql -U postgres -d 999st`

### TypeScript Config
- `verbatimModuleSyntax: true` (use `import type` for types)
- `exactOptionalPropertyTypes: true`
- `noUnusedLocals: true`, `noUnusedParameters: true`

### Auth Middleware
- Extends Express `Request` interface globally with `user?: JwtPayload`
- `JWT_SECRET` is exported from `auth.service.ts`
- Fallback key for development: `"999st-super-secret-key-change-in-production"`

---

## 💬 **User Context (Para sa AI)**

- **Language:** Filipino (Tagalog/English mix) — mag-respond sa Filipino
- **Level:** Beginner, nag-aaral ng full-stack development
- **Learning style:** Step-by-step, hands-on, maraming explanation
- **Tools used:** VS Code, Postman, Command Prompt (Windows)
- **Browser:** Chrome (available for testing)
- **CLI tool:** Codebuff (used for AI-assisted coding)
- **Notes:** Mahilig sa visual progress tracking (tables, checkmarks)
