# 📊 999.st — Database Relationships & Payment Flow Guide

> **📌 Para ito sa'yo para maintindihan mo ang buong data structure at kung paano gumagalaw ang data mula buyer → order → payment → admin.**

---

## 🧭 TABLE OF CONTENTS

1. [Database Models & Relationships](#1-database-models--relationships)
2. [ER Diagram (Entity Relationship)](#2-er-diagram)
3. [Order Status Flow](#3-order-status-flow)
4. [Payment Flow](#4-payment-flow)
5. [API Endpoints Summary](#5-api-endpoints-summary)
6. [Admin Workflow](#6-admin-workflow)
7. [Buyer Workflow](#7-buyer-workflow)

---

## 1️⃣ DATABASE MODELS & RELATIONSHIPS

```
┌─────────────────────────────────────────────────────────────────┐
│                         DATABASE SCHEMA                         │
│                                                                 │
│  ┌──────────┐       ┌──────────┐       ┌──────────────┐       │
│  │   USER   │──1:N──│ PRODUCT  │       │   ORDERITEM  │       │
│  │          │       │          │       │              │       │
│  │  Admin   │       │  Items   │       │  Junction    │       │
│  │  Buyer   │       │  posted  │       │  table       │       │
│  └────┬─────┘       │  by user │       │  (links      │       │
│       │             └────┬─────┘       │   Order &    │       │
│       │                  │             │   Product)   │       │
│       │                  │             └──────┬───────┘       │
│       │                  │                    │               │
│       └─────────┬────────┘                    │               │
│                 │                             │               │
│                 │        ┌──────────┐         │               │
│                 └──1:N───│  ORDER   │──1:N────┘               │
│                          │          │                         │
│                          │  Has     │                         │
│                          │  status  │                         │
│                          │  payment │                         │
│                          │  items   │                         │
│                          └──────────┘                         │
└─────────────────────────────────────────────────────────────────┘
```

---

### 👤 User Model

```prisma
model User {
  id        Int       @id @default(autoincrement())
  name      String
  email     String    @unique
  password  String?                    // null = Google OAuth (future)
  role      String    @default("BUYER") // "ADMIN" o "BUYER"
  products  Product[]                  // 👉 Products na na-post ng user na ito
  orders    Order[]                    // 👉 Orders na ginawa ng user na ito
  createdAt DateTime  @default(now())
}
```

| Field | Purpose |
|-------|---------|
| `id` | Unique identifier ng user |
| `name` | Pangalan (Admin o Buyer) |
| `email` | Login credential (unique) |
| `password` | Hashed password (null kung OAuth) |
| `role` | **ADMIN** = tagalagay ng products, taga-monitor ng orders |
|        | **BUYER** = bumibili ng products |

**Relationships:**
- `products` → Isang user ay **maraming products** (1:N)
- `orders` → Isang user ay **maraming orders** (1:N)

---

### 📦 Product Model

```prisma
model Product {
  id          Int      @id @default(autoincrement())
  name        String
  description String
  price       Float
  imageUrl    String?
  userId      Int                         // Sino ang nag-post
  user        User     @relation          // 👉 Back-reference sa User
  createdAt   DateTime @default(now())
  orderItems  OrderItem[]                 // 👉 Naka-link sa OrderItems
}
```

| Field | Purpose |
|-------|---------|
| `id` | Unique identifier |
| `name` | Pangalan ng product (e.g. "Classic White T-Shirt") |
| `description` | Details ng product |
| `price` | Presyo (e.g. 599.00) |
| `imageUrl` | Optional na image |
| `userId` | 🔗 **Foreign key** — kung sinong user ang nag-post |

**Relationships:**
- `user` → Ang product ay **pag-aari ng isang user** (N:1)
- `orderItems` → Ang product ay **ginagamit sa maraming orders** (1:N)

---

### 🛒 Order Model

```prisma
model Order {
  id              Int         @id @default(autoincrement())
  userId          Int                        // Sino ang bumili
  user            User        @relation      // 👉 Back-reference sa User
  status          String      @default("PENDING")
  totalPrice      Float                      // Total ng lahat ng items
  items           OrderItem[]                // 👉 Items sa order na ito

  // 💳 Payment
  paymentMethod   String?     @default("COD")   // "COD" o "GCASH"
  paymentStatus   String      @default("UNPAID") // UNPAID → PAID → VERIFIED → REFUNDED
  paymentRef      String?                       // GCash reference number

  // 📦 Shipping
  shippingAddress String?                       // Shipping address

  createdAt       DateTime    @default(now())
}
```

| Field | Purpose |
|-------|---------|
| `id` | Order number (e.g. Order #1, #2) |
| `userId` | 🔗 **Foreign key** — kung sinong buyer ang um-order |
| `status` | Status ng order: `PENDING → PROCESSING → SHIPPED → DELIVERED` o `CANCELLED` |
| `totalPrice` | Auto-computed na total price |
| `paymentMethod` | **COD** (Cash on Delivery) o **GCASH** |
| `paymentStatus` | `UNPAID` → `PAID` → `VERIFIED` → `REFUNDED` |
| `paymentRef` | GCash reference number na sine-submit ng buyer |
| `shippingAddress` | Address kung saan idi-deliver |

**Relationships:**
- `user` → Ang order ay **pag-aari ng isang user** (N:1)
- `items` → Ang order ay **may maraming items** (1:N)

---

### 🔗 OrderItem Model (Junction Table)

```prisma
model OrderItem {
  id        Int     @id @default(autoincrement())
  orderId   Int                        // 🔗 Foreign key → Order
  order     Order   @relation          // 👉 Back-reference
  productId Int                        // 🔗 Foreign key → Product
  product   Product @relation          // 👉 Back-reference
  quantity  Int     @default(1)
  price     Float                      // 📌 Presyo NUNG NA-ORDER (hindi current price)
}
```

| Field | Purpose |
|-------|---------|
| `id` | Unique identifier |
| `orderId` | 🔗 **Foreign key** — anong order ito kabilang |
| `productId` | 🔗 **Foreign key** — anong product ito |
| `quantity` | Ilang piraso ang binili |
| `price` | Presyo ng product nung na-order (kung magbago presyo later, ito ang reference) |

**Why `price` here?** Kung magbago ang presyo ng product sa future, ang OrderItem ay may sariling kopya ng presyo nung na-order — para accurate ang historical data!

---

## 2️⃣ ER DIAGRAM (Simplified)

```
┌─────────────────────┐
│        USER         │
│─────────────────────│
│ id (PK)             │
│ name                │
│ email (UNIQUE)      │
│ password            │
│ role (ADMIN/BUYER)  │
│ createdAt           │
└────────┬────────────┘
         │
         │ 1:N (isang user ay maraming orders)
         │
         ▼
┌─────────────────────────────────────┐
│              ORDER                  │
│─────────────────────────────────────│
│ id (PK)                             │
│ user_id (FK → User.id)             │
│ status (PENDING/PROCESSING/...)     │
│ total_price                         │
│ payment_method (COD/GCASH)         │
│ payment_status (UNPAID/PAID/...)   │
│ payment_ref (nullable)             │
│ shipping_address (nullable)        │
│ created_at                          │
└────────┬────────────────────────────┘
         │
         │ 1:N (isang order ay maraming items)
         │
         ▼
┌─────────────────────────────────────┐
│            ORDER_ITEM               │
│─────────────────────────────────────│
│ id (PK)                             │
│ order_id (FK → Order.id)          │
│ product_id (FK → Product.id)      │
│ quantity                            │
│ price (snapshot nung na-order)     │
└────────┬────────────────────────────┘
         │
         │ N:1 (maraming items ay iisang product)
         │
         ▼
┌─────────────────────┐
│      PRODUCT        │
│─────────────────────│
│ id (PK)             │
│ name                │
│ description         │
│ price               │
│ image_url           │
│ user_id (FK → User) │
│ created_at          │
└─────────────────────┘
```

---

## 3️⃣ ORDER STATUS FLOW

```
🏁 START ──→ PENDING ──→ PROCESSING ──→ SHIPPED ──→ DELIVERED ✅
                  │
                  └──→ CANCELLED ❌
```

| Status | Sino gumagawa | Meaning |
|--------|---------------|---------|
| **PENDING** 🟡 | **System** (auto) | Kakagawa pa lang ng order — hindi pa naaaksyunan |
| **PROCESSING** 🔵 | **Admin** | Inaayos na ni Admin ang order para i-pack |
| **SHIPPED** 🟣 | **Admin** | Na-ship na — nasa courier na |
| **DELIVERED** 🟢 | **Admin** | Na-receive na ng buyer |
| **CANCELLED** 🔴 | **Admin** | Na-cancel (out of stock, wrong order, etc.) |

### 📌 Sino ang pwedeng mag-update ng status?

| Tao | Pwede? |
|-----|--------|
| 👑 **Admin** | ✅ Pwede — sa Orders tab sa Admin Dashboard |
| 👤 **Buyer** | ❌ Hindi — buyer ay pwedeng tumingin lang |

---

## 4️⃣ PAYMENT FLOW

### 💵 COD (Cash on Delivery)

```
Buyer orders → Selects COD → Order created (UNPAID)
                                    │
                     ┌──────────────┴──────────────┐
                     │                             │
              Item delivered                 Admin marks
              Buyer pays cash               payment as VERIFIED
                     │                             │
                     ▼                             ▼
              DELIVERED ✅                    VERIFIED ✅
```

**Flow:**
1. Buyer selects **COD** → places order
2. Payment status: **UNPAID** (hindi pa bayad)
3. Admin ships item → status becomes **DELIVERED**
4. Admin can mark payment as **VERIFIED** (optional — since cash naman upon delivery)

---

### 📱 GCash

```
Buyer orders → Selects GCASH → Order created (UNPAID)
                                        │
                                 Buyer sends payment
                                 via GCash app
                                        │
                                 Buyer gets reference #
                                        │
                                 Buyer enters ref #
                                 in OrderDetail page
                                        │
                                 Status becomes PAID
                                        │
                                 Admin checks GCash account
                                        │
                         ┌──────────────┴──────────────┐
                         │                             │
                  Payment verified               Payment invalid
                         │                             │
                         ▼                             ▼
                   VERIFIED ✅                    REFUNDED 🔴
```

**Flow Step-by-Step:**

| Step | Sino | Gagawin |
|------|------|---------|
| 1️⃣ | **Buyer** | Pumili ng **GCASH** → ilagay ang shipping address → i-click **Place Order** |
| 2️⃣ | **System** | Order created — status: `PENDING`, payment: `UNPAID` |
| 3️⃣ | **Buyer** | Pumunta sa **Order Detail page** → makikita ang **GCash number** ng store |
| 4️⃣ | **Buyer** | Mag-send ng payment via GCash app → kumuha ng **reference number** |
| 5️⃣ | **Buyer** | I-type ang reference number sa Order Detail page → i-click **Submit** |
| 6️⃣ | **System** | Payment status nagiging **PAID** — may ref number na |
| 7️⃣ | **Admin** | Pumunta sa **Admin Dashboard → Orders tab** → tingnan ang order |
| 8️⃣ | **Admin** | I-verify kung tama ang ref number at amount |
| 9️⃣ | **Admin** | I-set ang payment status sa **VERIFIED** ✅ o **REFUNDED** 🔴 |

### Payment Status Meanings:

| Status | Meaning | Sino nag-set |
|--------|---------|--------------|
| **UNPAID** 🟡 | Wala pang bayad | System (auto) |
| **PAID** 🔵 | Nag-send na ng pera si buyer at nag-submit ng ref number | Buyer |
| **VERIFIED** 🟢 | Na-verify na ni Admin na tama ang payment | Admin |
| **REFUNDED** 🔴 | Na-refund na ang payment (mali ang amount, cancel order, etc.) | Admin |

---

## 5️⃣ API ENDPOINTS SUMMARY

### 🔐 Auth

| Method | Endpoint | Sino | Purpose |
|--------|----------|------|---------|
| POST | `/api/auth/register` | Everyone | Gumawa ng account |
| POST | `/api/auth/login` | Everyone | Mag-login |
| GET | `/api/auth/me` | Logged in | Kunin ang current user info |
| PUT | `/api/auth/profile` | Logged in | I-update ang profile |
| PUT | `/api/auth/password` | Logged in | Magpalit ng password |

### 📦 Products

| Method | Endpoint | Sino | Purpose |
|--------|----------|------|---------|
| GET | `/api/products` | Everyone | Tingnan lahat ng products |
| GET | `/api/products/:id` | Everyone | Tingnan ang specific product |
| POST | `/api/products` | Admin lang | Magdagdag ng product |
| PUT | `/api/products/:id` | Admin lang | I-edit ang product |
| DELETE | `/api/products/:id` | Admin lang | Burahin ang product |

### 🛒 Orders

| Method | Endpoint | Sino | Purpose |
|--------|----------|------|---------|
| POST | `/api/orders` | Buyer | Gumawa ng bagong order (with payment method + shipping) |
| GET | `/api/orders/my-orders` | Buyer | Tingnan ang sariling orders |
| GET | `/api/orders/:id` | Buyer/Admin | Tingnan ang specific order |
| GET | `/api/orders` | **Admin lang** | Tingnan lahat ng orders |
| PUT | `/api/orders/:id/status` | **Admin lang** | I-update ang order status |
| PUT | `/api/orders/:id/payment` | **Admin lang** | I-update ang payment status |
| PUT | `/api/orders/:id/payment-ref` | Buyer | I-submit ang GCash ref number |
| GET | `/api/orders/sales-summary` | **Admin lang** | Kunin ang sales stats |
| DELETE | `/api/orders/:id` | **Admin lang** | Burahin ang order |

---

## 6️⃣ ADMIN WORKFLOW

### 👑 Admin Dashboard — 3 Tabs

```
┌─────────────────────────────────────────────────────────┐
│                    ADMIN DASHBOARD                      │
├─────────────────────────────────────────────────────────┤
│  [📊 Dashboard]  [📦 Products]  [🛒 Orders]           │
└─────────────────────────────────────────────────────────┘
```

### 📊 Dashboard Tab

```
┌────────────────┬────────────────┬────────────────┬────────────────┐
│ Total Orders   │ Total Revenue  │ Pending        │ Delivered      │
│       5        │    ₱15,000     │       2        │       3        │
└────────────────┴────────────────┴────────────────┴────────────────┘
┌─────────────────────────────────────────────────────────────────┐
│ Recent Orders                                                   │
│ #5 — Juan Dela Cruz     ₱2,499                                  │
│ #4 — Maria Santos       ₱5,998     ← Clickable → Pumunta sa    │
│ #3 — Pedro Reyes        ₱1,299       OrderDetail page           │
└─────────────────────────────────────────────────────────────────┘
```

### 🛒 Orders Tab — Payment Verification

```
┌─────────────────────────────────────────────────────────────┐
│ Order #5 — by Juan Dela Cruz                                │
│                                                             │
│ Classic White T-Shirt x2, Running Shoes x1                  │
│                                                             │
│ 💵 COD  [UNPAID ▼]                   ₱4,697  Apr 15         │
│         ↑ Admin can change payment status here              │
├─────────────────────────────────────────────────────────────┤
│ Order #6 — by Maria Santos                                  │
│                                                             │
│ Wireless Earbuds x1                                         │
│                                                             │
│ 📱 GCASH  [PAID ▼]   Ref: GC234567890    ₱2,499  Apr 16    │
│            ↑ Admin verifies → changes to VERIFIED           │
└─────────────────────────────────────────────────────────────┘
```

### 🎯 Admin Tasks:

| Task | Saan gagawin | Paano |
|------|-------------|-------|
| **Magdagdag ng product** | Products tab → "Add Product" | Ilagay ang name, description, price |
| **I-update ang order status** | Orders tab → dropdown | PENDING → PROCESSING → SHIPPED → DELIVERED |
| **I-verify ang GCash payment** | Orders tab → payment dropdown | PAID → VERIFIED (kung tama) o REFUNDED (kung mali) |
| **Tingnan ang sales stats** | Dashboard tab | Total orders, revenue, pending, delivered |

---

## 7️⃣ BUYER WORKFLOW

```
┌─────────┐    ┌──────────┐    ┌──────────┐    ┌──────────────┐
│ Browse   │──→│  Select   │──→│  Checkout │──→│  Order Detail │
│ Products │   │  Product  │    │           │    │              │
└─────────┘   └──────────┘    └──────────┘    └──────────────┘
                                        │              │
                                  COD: Done!     GCASH: Submit
                                  Wait for       ref number →
                                  delivery       wait for
                                                  verification
```

### 🛍️ Step-by-step:

| Step | Screen | Gagawin |
|------|--------|---------|
| 1️⃣ | **Home Page** | Browse products |
| 2️⃣ | **Product Detail** | Pumili ng quantity → Click **Buy Now** |
| 3️⃣ | **Checkout Modal** | Pumili ng payment: **COD** o **GCASH** |
| | | Kung GCASH → maglagay ng **shipping address** |
| 4️⃣ | **Order Detail** | COD: Wait for delivery na lang |
| | | GCASH: Makikita ang **GCash number**, mag-send ng payment at i-submit ang reference number |
| 5️⃣ | **Profile** | Tingnan ang lahat ng orders — clickable to view details |

---

## 📌 KEY TAKEAWAYS

1. **Admin ≠ Buyer** — Admin ay hindi bumibili, sila ang nagma-manage ng products at nagmo-monitor ng orders
2. **OrderItems** — Ito ang nagli-link sa **Order** at **Product** — para ang isang order ay pwedeng maglaman ng maraming iba't ibang products
3. **Price snapshot** — Ang presyo ay naka-save sa OrderItem hindi sa Product — para kung magtaas ng presyo, hindi maapektuhan ang lumang orders
4. **Payment flow** — COD ay simple (bayad upon delivery), GCASH ay may verification step ng admin
5. **Status tracking** — Order status (shipping progress) vs Payment status (payment progress) ay magkaiba!

---

> 📝 **Note:** Ang **Visa Card** ay hindi pa implemented sa kasalukuyan. Ang available ay **COD** at **GCASH** lang.
> Kung gusto mo magdagdag ng Visa Card payment, kailangan natin ng payment gateway like **PayMongo** or **GCash API** (MayCheckout).
