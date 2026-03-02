# E-commerce Node.js API

A robust RESTful API for an E-commerce platform built with Node.js, Express, Sequelize (PostgreSQL), and Redis.

## 🚀 Architecture

This application strictly follows a **Service Layer Architecture**:
- **Controllers**: Thin layers responsible only for handling HTTP requests/responses and delegating business logic to services.
- **Services**: Contain all the core business logic, database transactions, and data manipulation. 
- **Models**: Sequelize models handling database schema and associations.
- **Middleware**: Features custom error handling, input validation, and JWT-based authentication/authorization.

## ✨ Features

- **User Authentication & Authorization**: JWT-based login/register with role-based access control (Admin/User).
- **Product Management**: Full CRUD operations with filtering, searching, and pagination capabilities.
- **Shopping Cart**: Advanced cart management with real-time stock verification.
- **Order Processing**: Secure checkout process wrapped in database transactions to ensure data integrity (atomic stock decrements and cart clearing).
- **Rate Limiting (Redis)**: Distributed rate-limiting powered by Redis to protect API endpoints against abuse and brute-force attacks.
- **Security**: Hardened with Helmet, CORS, and robust validation pipelines.
- **Custom Error Handling**: Centralized operational error management (e.g., `NotFoundError`, `BadRequestError`).
- **REST Best Practices**: Proper use of HTTP methods, status codes, and endpoint structuring.

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **Cache / Rate Limiting**: Redis
- **Security**: bcryptjs, jsonwebtoken, helmet, cors
- **Validation**: express-validator

## 📋 Prerequisites

- Node.js (v18+ recommended)
- PostgreSQL
- Redis Server

## ⚙️ Installation & Setup

### Option 1: Docker (Recommended)
This project includes a `docker-compose.yml` that seamlessly spins up the Node.js API, a PostgreSQL database, and a Redis cache without needing to install them locally.

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd ecommerce-node
   ```
2. **Start the containers:**
   ```bash
   docker-compose up -d
   ```
   *The API will be available at `http://localhost:3000`.*
   *(To view logs, you can run `docker-compose logs -f app`)*

### Option 2: Local Setup
1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd ecommerce-node
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables:**
   Create a `.env` file in the root directory and configure the following:
   ```env
   PORT=3000
   NODE_ENV=development
   
   # Database Configuration
   DB_NAME=ecommerce_db
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_HOST=localhost
   
   # JWT Configuration
   JWT_SECRET=your_super_secret_key_here
   JWT_EXPIRES_IN=24h
   
   # Redis Configuration
   REDIS_URL=redis://localhost:6379

   # Stripe Configuration
   STRIPE_SECRET_KEY=sk_test_your_secret_key...
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret...
   ```

4. **Start the Application:**
   ```bash
   npm run dev
   ```
   *Note: In development mode, the server will automatically sync the database schemas and optionally create a default admin user (`admin@example.com` / `admin123`).*

## 🧪 Testing

This project uses **Jest** for executing isolated unit tests against the service layer.
Tests mock out the database layer (Sequelize) to ensure rapid, CI-ready testing of pure business rules.

To run the test suite:
```bash
npm test
```
To run tests in watch mode during development:
```bash
npm run test:watch
```

## 📚 API Endpoints Overview

| Resource | Endpoint | Description | Access |
|---|---|---|---|
| **Auth** | `POST /api/users/register` | Register new user | Public |
| **Auth** | `POST /api/users/login` | Login user | Public |
| **Users** | `GET /api/users/profile` | Get current user profile | User/Admin |
| **Users** | `GET /api/users` | List users (paginated) | Admin |
| **Users** | `GET /api/users/:id` | Get user by id | Admin |
| **Users** | `PUT /api/users/:id` | Update user (self or admin) | User/Admin |
| **Users** | `DELETE /api/users/:id` | Deactivate user (self or admin) | User/Admin |
| **Users** | `PATCH /api/users/:id/role` | Change user role | Admin |
| **Products** | `GET /api/products` | List/Search products | Public |
| **Products** | `GET /api/products/:id` | Get product by id | Public |
| **Products** | `POST /api/products` | Create product | Admin |
| **Products** | `PUT /api/products/:id` | Update product | Admin |
| **Products** | `DELETE /api/products/:id` | Delete product | Admin |
| **Cart** | `GET /api/cart` | View cart | User/Admin |
| **Cart** | `POST /api/cart/items` | Add item to cart | User/Admin |
| **Cart** | `PUT /api/cart/items/:itemId` | Update cart item quantity | User/Admin |
| **Cart** | `DELETE /api/cart/items/:itemId` | Remove item from cart | User/Admin |
| **Cart** | `DELETE /api/cart` | Clear cart | User/Admin |
| **Cart** | `GET /api/cart` | View cart | User/Admin |
| **Orders** | `POST /api/orders/checkout`| Checkout cart items | User/Admin |
| **Orders** | `GET /api/orders/my-orders` | List current user's orders (paginated) | User/Admin |
| **Orders** | `GET /api/orders/my-orders/:id` | Get one of current user's orders | User/Admin |
| **Orders** | `GET /api/orders` | List all orders (paginated) | Admin |
| **Orders** | `GET /api/orders/delayed` | List delayed orders | Admin |
| **Orders** | `PUT /api/orders/:id/status` | Update order status | Admin |
| **Reports** | `GET /api/orders/reports/sales` | Sales report for date range | User/Admin |
| **Reports** | `GET /api/orders/reports/export/overdue-last-month` | Export overdue orders from last month | User/Admin |
| **Reports** | `GET /api/orders/reports/export/last-month` | Export last month's orders | User/Admin |
| **Payments** | `POST /api/payments/webhook` | Stripe webhook receiver | Stripe only |
| **Health** | `GET /health` | Health check | Public |

## 📚 API Endpoints (Detailed)

### Base URL

- Local development: `http://localhost:3000`

### Authentication

- **Header**: `Authorization: Bearer <JWT>`
- **How to get a JWT**: call `POST /api/users/login` (or `POST /api/users/register`) and use the returned `token`.

### Error response shapes (common)

- **Auth required (401)**:
  - `{ "error": "Please authenticate" }`
- **Operational errors (varies, e.g. 400/403/404/409)**:
  - `{ "error": "<message>" }`
- **Validation errors (400)** (from `express-validator`):
  - `{ "errors": [ { "type": "...", "msg": "...", "path": "...", "location": "body" } ] }`

---

### Auth & Users

#### `POST /api/users/register` (Public)

- **Body**:
  - `name` (string, 2-50)
  - `email` (string, email)
  - `password` (string, min 6)
  - `shippingAddress` (string, optional)
- **201 Response**:
  - `{ "user": { "id", "name", "email", "role", "shippingAddress" }, "token": "<jwt>" }`

#### `POST /api/users/login` (Public)

- **Body**:
  - `email` (string)
  - `password` (string)
- **200 Response**:
  - `{ "user": { "id", "name", "email", "role", "shippingAddress" }, "token": "<jwt>" }`

#### `GET /api/users/profile` (User/Admin)

- **Headers**: `Authorization: Bearer <JWT>`
- **200 Response**:
  - `{ "id", "name", "email", "role", "shippingAddress", "registrationDate" }`

#### `PUT /api/users/:id` (User/Admin)

- **Headers**: `Authorization: Bearer <JWT>`
- **Path params**: `id` (UUID)
- **Body** (fields you want to update):
  - `name` (string, optional)
  - `password` (string, optional)
  - `shippingAddress` (string, optional)
  - `role` is ignored unless the caller is admin
  - `email` cannot be updated (ignored)
- **200 Response**:
  - `{ "id", "name", "email", "role", "shippingAddress" }`

#### `DELETE /api/users/:id` (User/Admin)

- **Headers**: `Authorization: Bearer <JWT>`
- **Path params**: `id` (UUID)
- **204 Response**: empty body (user is deactivated via `isActive=false`)

#### `GET /api/users` (Admin)

- **Headers**: `Authorization: Bearer <JWT>`
- **Query** (optional):
  - `page` (number, default 1)
  - `limit` (number, default 10)
  - `role` (`admin` | `user`)
- **200 Response**:
  - `{ "total", "page", "totalPages", "data": [ { "id", "name", "email", "role", "shippingAddress", "registrationDate" } ] }`

#### `GET /api/users/:id` (Admin)

- **Headers**: `Authorization: Bearer <JWT>`
- **Path params**: `id` (UUID)
- **200 Response**:
  - `{ "id", "name", "email", "role", "shippingAddress", "registrationDate", "isActive" }`

#### `PATCH /api/users/:id/role` (Admin)

- **Headers**: `Authorization: Bearer <JWT>`
- **Path params**: `id` (UUID)
- **Body**:
  - `role` (`admin` | `user`)
- **200 Response**:
  - `{ "message": "User role updated successfully", "user": { "id", "name", "email", "role" } }`

---

### Products

#### `GET /api/products` (Public)

- **Query** (optional):
  - `page` (number, default 1)
  - `limit` (number, default 10)
  - `category` (string)
  - `minPrice` (number)
  - `maxPrice` (number)
  - `search` (string; searches name/description)
- **200 Response**:
  - `{ "total", "page", "totalPages", "data": [ { "id", "name", "description", "price", "sku", "quantity", "category", "isActive", "createdAt", "updatedAt" } ] }`

#### `GET /api/products/:id` (Public)

- **Path params**: `id` (UUID)
- **200 Response**:
  - `{ "id", "name", "description", "price", "sku", "quantity", "category", "isActive", "createdAt", "updatedAt" }`

#### `POST /api/products` (Admin)

- **Headers**: `Authorization: Bearer <JWT>`
- **Body**:
  - `name` (string, 2-100)
  - `price` (number, >= 0)
  - `sku` (string, 3-20, alphanumeric)
  - `quantity` (int, >= 0)
  - `category` (string)
  - `description` (string, optional)
- **201 Response**:
  - Product object (same shape as `GET /api/products/:id`)

#### `PUT /api/products/:id` (Admin)

- **Headers**: `Authorization: Bearer <JWT>`
- **Path params**: `id` (UUID)
- **Body**: same as create (you can send the fields you want to change, but validation expects the product schema)
- **200 Response**:
  - Product object

#### `DELETE /api/products/:id` (Admin)

- **Headers**: `Authorization: Bearer <JWT>`
- **Path params**: `id` (UUID)
- **204 Response**: empty body

---

### Cart (all Cart routes require auth)

#### `GET /api/cart`

- **Headers**: `Authorization: Bearer <JWT>`
- **200 Response**:
  - `{ "items": [ { "id", "userId", "productId", "quantity", "priceAtTime", "Product": { "id", "name", "sku", "price", "quantity" } } ], "subtotal": 0, "itemCount": 0 }`

#### `POST /api/cart/items`

- **Headers**: `Authorization: Bearer <JWT>`
- **Body**:
  - `productId` (UUID)
  - `quantity` (int, min 1)
- **201 Response**:
  - Cart item, including `{ Product: { name, sku, price } }`

#### `PUT /api/cart/items/:itemId`

- **Headers**: `Authorization: Bearer <JWT>`
- **Path params**: `itemId` (UUID)
- **Body** (note: request validation expects both fields):
  - `productId` (UUID)
  - `quantity` (int, min 1)
- **200 Response**:
  - Updated cart item

#### `DELETE /api/cart/items/:itemId`

- **Headers**: `Authorization: Bearer <JWT>`
- **Path params**: `itemId` (UUID)
- **204 Response**: empty body

#### `DELETE /api/cart`

- **Headers**: `Authorization: Bearer <JWT>`
- **204 Response**: empty body

---

### Orders (all Order routes require auth)

#### `POST /api/orders/checkout`

- **Headers**: `Authorization: Bearer <JWT>`
- **Body**:
  - `shippingAddress` (string, optional; falls back to the user profile shipping address)
- **201 Response**:
  - `{ "order": { "id", "orderNumber", "totalAmount", "status" }, "clientSecret": "<stripe_payment_intent_client_secret>" }`

#### `GET /api/orders/my-orders`

- **Headers**: `Authorization: Bearer <JWT>`
- **Query** (optional):
  - `page` (number, default 1)
  - `limit` (number, default 10)
  - `status` (`pending` | `processing` | `completed` | `cancelled`)
- **200 Response**:
  - `{ "total", "page", "totalPages", "data": [ /* orders with OrderItems + Products */ ] }`

#### `GET /api/orders/my-orders/:id`

- **Headers**: `Authorization: Bearer <JWT>`
- **Path params**: `id` (UUID)
- **200 Response**:
  - Order object including `OrderItems` and each item’s `Product`

#### `GET /api/orders` (Admin)

- **Headers**: `Authorization: Bearer <JWT>`
- **Query** (optional):
  - `page`, `limit`
  - `status`
  - `startDate`, `endDate` (ISO date strings; filter by `createdAt`)
  - `userId` (UUID; filter orders by user)
- **200 Response**:
  - `{ "total", "page", "totalPages", "data": [ /* orders including User */ ] }`

#### `GET /api/orders/delayed` (Admin)

- **Headers**: `Authorization: Bearer <JWT>`
- **200 Response**:
  - Array of delayed orders including user `{ id, name, email }`

#### `PUT /api/orders/:id/status` (Admin)

- **Headers**: `Authorization: Bearer <JWT>`
- **Path params**: `id` (UUID)
- **Body**:
  - `status` (`pending` | `processing` | `completed` | `cancelled`)
- **200 Response**:
  - Updated order object

---

### Reports (authenticated)

#### `GET /api/orders/reports/sales`

- **Headers**: `Authorization: Bearer <JWT>`
- **Query**:
  - `startDate` (ISO date string, required)
  - `endDate` (ISO date string, required)
- **200 Response**:
  - `{ "period": { "startDate", "endDate" }, "summary": { "totalRevenue", "totalOrders", "averageOrderValue" }, "topProducts": [ { "name", "quantity", "revenue" } ] }`

#### `GET /api/orders/reports/export/overdue-last-month`
#### `GET /api/orders/reports/export/last-month`

- **Headers**: `Authorization: Bearer <JWT>`
- **Query** (optional):
  - `format` = `json` (default) | `csv` | `excel`
- **200 Response**:
  - `format=json`: JSON array of orders
  - `format=csv`: downloads `*.csv`
  - `format=excel`: downloads `*.xlsx`

---

### Payments (Stripe webhook)

#### `POST /api/payments/webhook`

- **Purpose**: Stripe calls this endpoint to confirm events (e.g. `payment_intent.succeeded`).
- **Headers**: `stripe-signature: <value from Stripe>`
- **Body**: raw `application/json` (do not JSON-parse on the Stripe side; the server verifies the signature using the raw body)
- **200 Response**: empty body

---

### Health

#### `GET /health` (Public)

- **200 Response**:
  - `{ "status": "OK", "timestamp": "<date>" }`

## 🔒 Security Measures

- **Rate Limiters**: 
  - `Global API Limiter`: 100 requests per 15 minutes.
  - `Auth Limiter`: 10 login/register requests per hour.
  - `Checkout Limiter`: 20 checkout attempts per hour.
- **Password Hashing**: Bcrypt with auto-salting.
- **Payload Validation**: Strict structure using `express-validator` to prevent dirty data or injection.
