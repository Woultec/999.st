# 📮 999.st API Documentation

> **Base URL:** `http://localhost:5000/api`

---

## 📌 **Health Check**

### GET /api/health

I-check kung gumagana ang server.

**Request:**
```
GET http://localhost:5000/api/health
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2026-07-06T06:28:30.993Z",
    "uptime": 599.29,
    "environment": "development"
  }
}
```

| Field | Meaning |
|-------|---------|
| `status` | "ok" kung gumagana ang server |
| `timestamp` | Exact time ng response |
| `uptime` | Ilang seconds nang tumatakbo ang server |
| `environment` | "development" or "production" |

---

## 👤 **Users**

### POST /api/users — Gumawa ng Bagong User

**Request:**
```
POST http://localhost:5000/api/users
Content-Type: application/json

{
  "name": "Juan Dela Cruz",
  "email": "juan@example.com"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Juan Dela Cruz",
    "email": "juan@example.com",
    "createdAt": "2026-07-06T06:28:30.993Z"
  }
}
```

**Error — Missing Fields (400 Bad Request):**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Name and email are required"
}
```

---

### GET /api/users — Kunin ang Lahat ng Users

**Request:**
```
GET http://localhost:5000/api/users
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Juan Dela Cruz",
      "email": "juan@example.com",
      "createdAt": "2026-07-06T06:28:30.993Z"
    }
  ]
}
```

Kung walang laman:
```json
{
  "success": true,
  "data": []
}
```

---

### GET /api/users/:id — Kunin ang Isang User

**Request:**
```
GET http://localhost:5000/api/users/1
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Juan Dela Cruz",
    "email": "juan@example.com",
    "createdAt": "2026-07-06T06:28:30.993Z"
  }
}
```

**Error — Not Found (404):**
```json
{
  "success": false,
  "statusCode": 404,
  "message": "User with ID 999 not found"
}
```

---

### PUT /api/users/:id — I-update ang User

I-update ang name at/email ng isang user gamit ang kanyang ID.

**Request:**
```
PUT http://localhost:5000/api/users/1
Content-Type: application/json

{
  "name": "Juana Dela Cruz",
  "email": "juana@example.com"
}
```

| URL Part | Meaning |
|----------|---------|
| `/users/1` | I-update ang user na may ID = 1 |
| `/users/5` | I-update ang user na may ID = 5 |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Juana Dela Cruz",
    "email": "juana@example.com",
    "createdAt": "2026-07-06T06:28:30.993Z"
  }
}
```

**Error — User Not Found (404):**
```json
{
  "success": false,
  "statusCode": 404,
  "message": "User with ID 999 not found"
}
```

**Error — Missing Fields (400 Bad Request):**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Name and email are required"
}
```

---

### DELETE /api/users/:id — Burahin ang User

Burahin ang isang user gamit ang kanyang ID.

**Request:**
```
DELETE http://localhost:5000/api/users/1
```

> 💡 **Walang body sa DELETE** — ID lang sa URL ang kailangan!

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Juan Dela Cruz",
    "email": "juan@example.com",
    "createdAt": "2026-07-06T06:28:30.993Z"
  }
}
```

**Error — User Not Found (404):**
```json
{
  "success": false,
  "statusCode": 404,
  "message": "User with ID 999 not found"
}
```

---

## 🏷️ **Products**

### POST /api/products — Gumawa ng Bagong Product

**Request:**
```
POST http://localhost:5000/api/products
Content-Type: application/json

{
  "name": "Wireless Headphones",
  "description": "Noise-cancelling Bluetooth headphones",
  "price": 2499,
  "imageUrl": "https://example.com/headphones.jpg"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ | Pangalan ng product |
| `description` | string | ✅ | Paglalarawan ng product |
| `price` | number | ✅ | Presyo (positive number) |
| `imageUrl` | string | ❌ | Link sa larawan (opsyonal) |

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Wireless Headphones",
    "description": "Noise-cancelling Bluetooth headphones",
    "price": 2499,
    "imageUrl": "https://example.com/headphones.jpg",
    "createdAt": "2026-07-06T06:28:30.993Z"
  }
}
```

**Error — Missing Fields (400 Bad Request):**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Name, description, and price are required"
}
```

**Error — Invalid Price (400 Bad Request):**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Price must be a positive number"
}
```

---

### GET /api/products — Kunin ang Lahat ng Products

**Request:**
```
GET http://localhost:5000/api/products
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Wireless Headphones",
      "description": "Noise-cancelling Bluetooth headphones",
      "price": 2499,
      "imageUrl": "https://example.com/headphones.jpg",
      "createdAt": "2026-07-06T06:28:30.993Z"
    }
  ]
}
```

---

### GET /api/products/:id — Kunin ang Isang Product

**Request:**
```
GET http://localhost:5000/api/products/1
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Wireless Headphones",
    "description": "Noise-cancelling Bluetooth headphones",
    "price": 2499,
    "imageUrl": "https://example.com/headphones.jpg",
    "createdAt": "2026-07-06T06:28:30.993Z"
  }
}
```

**Error — Not Found (404):**
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Product with ID 999 not found"
}
```

---

### PUT /api/products/:id — I-update ang Product

**Request:**
```
PUT http://localhost:5000/api/products/1
Content-Type: application/json

{
  "name": "Wireless Headphones Pro",
  "description": "Premium noise-cancelling Bluetooth headphones",
  "price": 3499,
  "imageUrl": "https://example.com/headphones-pro.jpg"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Wireless Headphones Pro",
    "description": "Premium noise-cancelling Bluetooth headphones",
    "price": 3499,
    "imageUrl": "https://example.com/headphones-pro.jpg",
    "createdAt": "2026-07-06T06:28:30.993Z"
  }
}
```

---

### DELETE /api/products/:id — Burahin ang Product

**Request:**
```
DELETE http://localhost:5000/api/products/1
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Wireless Headphones",
    "description": "Noise-cancelling Bluetooth headphones",
    "price": 2499,
    "createdAt": "2026-07-06T06:28:30.993Z"
  }
}
```

---

## ⚠️ **Error Responses**

### 404 — Route Not Found
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Route not found"
}
```

### 500 — Internal Server Error
```json
{
  "success": false,
  "statusCode": 500,
  "message": "Error message details here",
  "stack": "Error stack trace (development only)"
}
```

---

## 📊 **HTTP Status Codes na Ginagamit Natin**

| Code | Meaning | Kailan |
|------|---------|--------|
| **200** | OK | Matagumpay na GET request |
| **201** | Created | Matagumpay na POST request (bagong record) |
| **400** | Bad Request | Mali ang ipinadala (kulang ang fields) |
| **404** | Not Found | Walang route na tumutugma sa URL |
| **500** | Internal Server Error | May error sa server code |

---

## 🧪 **Pagsubok sa Postman**

### Collection Setup (Save para hindi na ulit i-set up)

| Request Name | Method | URL | Body |
|-------------|--------|-----|------|
| Health Check | GET | `/api/health` | — |
| Get All Users | GET | `/api/users` | — |
| Create User | POST | `/api/users` | Raw JSON |
| Update User | PUT | `/api/users/1` | Raw JSON |
| Delete User | DELETE | `/api/users/1` | — |
| Create Product | POST | `/api/products` | Raw JSON |
| Get All Products | GET | `/api/products` | — |
| Get Product By ID | GET | `/api/products/1` | — |
| Update Product | PUT | `/api/products/1` | Raw JSON |
| Delete Product | DELETE | `/api/products/1` | — |

**Para ma-save sa Postman Collection:**
1. Click **Save** → New Collection → "999.st API"
2. I-save ang bawat request sa collection na ito
3. Next time, click lang at Send na agad!

---

*Last updated: July 7, 2026*
