# 🎨 999.st Frontend — Project Setup Guide

> **React + Vite + TypeScript + Tailwind CSS v4**
> Ito ang frontend para sa 999.st clothing brand ecommerce.

---

## 📦 **Tech Stack**

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.x | UI Library |
| **Vite** | 6.x | Build tool / Dev server |
| **TypeScript** | ~5.7+ | Type safety |
| **Tailwind CSS v4** | 4.x | Utility-first CSS |
| **React Router** | 7.x | Client-side routing |
| **Axios** | ^1.7 | HTTP client for API calls |

---

## 🚀 **Step 1 — Gumawa ng React + Vite Project**

Buksan ang **Command Prompt** sa `C:\Users\user\LocalDesktop\experiment\999.st\` at patakbuhin ito:

```cmd
npm create vite@latest frontend -- --template react-ts
```

**Explanation:**
- `frontend` = pangalan ng folder (pwede mong palitan)
- `--template react-ts` = React + TypeScript template

✅ **Dapat makita mo:**
```
✔ Project created!
  > cd frontend
  > npm install
  > npm run dev
```

---

## 📥 **Step 2 — I-install ang Dependencies**

```cmd
cd frontend
npm install
```

✅ Dapat: `added X packages`

**I-install ang mga additional packages na kailangan:**

```cmd
npm install axios react-router-dom
```

✅ Dapat: `added X packages`

---

## 🎨 **Step 3 — I-setup ang Tailwind CSS v4**

### 3.1 — I-install ang Tailwind

```cmd
npm install tailwindcss @tailwindcss/vite
```

### 3.2 — I-configure ang Vite (`vite.config.ts`)

Buksan ang `frontend/vite.config.ts` at palitan ng ganito:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

### 3.3 — I-import ang Tailwind sa CSS

Buksan ang `frontend/src/index.css` at **palitan ang laman** ng:

```css
@import "tailwindcss";
```

> ⚠️ **Tandaan:** Sa Tailwind v4, `@import "tailwindcss"` lang — hindi na kailangan ng `@tailwind base/components/utilities`

---

## 🏗️ **Step 4 — Folder Structure**

Gawin ang folder structure para sa components:

```cmd
mkdir src\components
mkdir src\pages
mkdir src\layouts
mkdir src\services
mkdir src\types
```

**Final structure:**
```
frontend/
├── public/
├── src/
│   ├── components/       # Reusable UI components (Navbar, Card, Button, etc.)
│   ├── pages/            # Page components (Home, Products, Admin, etc.)
│   ├── layouts/          # Layout components (MainLayout, AdminLayout)
│   ├── services/         # API calls (api.ts — Axios instance)
│   ├── types/            # TypeScript interfaces/ types
│   ├── App.tsx           # Root component with routes
│   ├── main.tsx          # Entry point
│   └── index.css         # Tailwind import
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🌐 **Step 5 — I-connect sa Backend API**

Gawin ang `src/services/api.ts`:

```typescript
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Auto-attach JWT token sa bawat request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

---

## 🧪 **Step 6 — I-test kung gumagana**

```cmd
npm run dev
```

✅ Dapat makita mo:
```
  VITE v6.x.x  ready in 300ms
  ➜  Local:   http://localhost:5173
```

Buksan ang `http://localhost:5173` sa browser — dapat may React logo! 🎉

---

## 🔗 **Connecting to Backend: Quick Reference**

| Frontend Feature | API Endpoint | Method |
|-----------------|--------------|--------|
| Get all products | `/api/products` | GET |
| Get product by ID | `/api/products/:id` | GET |
| Login (Admin) | `/api/auth/login` | POST |
| Register (Admin) | `/api/auth/register` | POST |
| Get current user | `/api/auth/me` | GET |
| Create product (Admin) | `/api/products` | POST |
| Update product (Admin) | `/api/products/:id` | PUT |
| Delete product (Admin) | `/api/products/:id` | DELETE |

---

## 📌 **Important Notes**

- **Port:** Frontend runs on `:5173`, Backend on `:5000`
- **CORS:** Backend already has `cors()` enabled — no issues
- **Auth:** Store JWT token in `localStorage` key `"token"`
- **Product images:** `imageUrl` field is optional (null if not provided)
- **Routes:** Admin routes require `Authorization: Bearer <token>` header

---

## 🧭 **Next Steps (Ikaw na bahala)**

Pagkatapos ng setup, magde-design na tayo ng pages:

```
1. Home Page (product listings)
2. Product Detail Page
3. Admin Dashboard (product CRUD)
4. Login Page
5. Navigation / Layout
```

Sabihin mo lang kung gusto mo nang magsimula sa pagbuo ng frontend! 🚀
