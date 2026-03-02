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
| **Products** | `GET /api/products` | List/Search products | Public |
| **Products** | `POST /api/products` | Create product | Admin |
| **Cart** | `POST /api/cart/add` | Add item to cart | User/Admin |
| **Cart** | `GET /api/cart` | View cart | User/Admin |
| **Orders** | `POST /api/orders/checkout`| Checkout cart items | User/Admin |

*(Detailed endpoint payloads can be explored in the respective router files).*

## 🔒 Security Measures

- **Rate Limiters**: 
  - `Global API Limiter`: 100 requests per 15 minutes.
  - `Auth Limiter`: 10 login/register requests per hour.
  - `Checkout Limiter`: 20 checkout attempts per hour.
- **Password Hashing**: Bcrypt with auto-salting.
- **Payload Validation**: Strict structure using `express-validator` to prevent dirty data or injection.
