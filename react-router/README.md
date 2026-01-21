# Full-Stack E-Commerce (FastAPI + React + TypeScript)

A small but functional full-stack e-commerce platform built as an academic project.

- **Backend:** REST API built with **FastAPI** and **SQLModel**
- **Frontend:** Single Page Application built with **React + TypeScript**
- **Database:** **PostgreSQL (Supabase)**
- **Deployment:** **Render** (backend) and **Vercel** (frontend)

The application allows users to browse products, view product details, manage a shopping cart, authenticate, place orders, and view their order history.  
The project follows the requirements defined in the assignment and focuses on clean architecture, API design, and correct business logic.

---

## Live URLs (Deployments)

- **Frontend (Vercel)**  
  https://156530-ecommerce.vercel.app/products  
  Public user interface where users can browse products, register/login, manage their cart, and place orders.

- **Backend (Render)**  
  https://one56530-ecommerce.onrender.com  
  Public REST API providing authentication, product data, orders, and order items.

The frontend communicates with the backend using the deployed API URL configured via environment variables.

---

## Main Features

### Product Catalog
- Public product listing page.
- Product detail view with price, description, stock, and quantity selection.
- Products are retrieved from the backend API.

### Shopping Cart (Order-based cart)
The cart is implemented as a **server-side pending order** instead of a purely client-side cart.

- A cart is represented by an `Order` with status `pending`.
- Each cart item is stored as an `OrderItem`.
- Quantities can be updated and items can be removed.
- Cart state persists across page reloads.

This approach allows server-side validation of stock and prices.

### User Authentication
- User registration.
- User login using JWT-based authentication.
- Protected endpoints require a valid Bearer token.
- Authenticated users can place orders and view their order history.

### Orders Management
- Create new orders.
- Add, update, and remove order items.
- Checkout process updates the order status to `paid`.
- Users can retrieve their own order history.

---

## Tech Stack

### Backend
- FastAPI
- SQLModel
- PostgreSQL (Supabase)
- JWT authentication
- Password hashing with Argon2
- Uvicorn ASGI server

### Frontend
- React
- TypeScript
- Vite
- React Router
- Fetch API
- LocalStorage for auth token and active order ID

---

## Project Structure

The repository is organized into two main parts: **backend** and **frontend**, clearly separating server-side logic from client-side code.

### Backend Structure

backend/
├── app/
│ ├── pycache/
│ ├── models/
│ │ ├── users1.py
│ │ ├── products1.py
│ │ ├── orders.py
│ │ └── orderItems.py
│ ├── routes/
│ │ ├── health.py
│ │ ├── users1.py
│ │ ├── products1.py
│ │ ├── orders.py
│ │ └── orderItems.py
│ ├── db.py
│ ├── dependencies.py
│ ├── main.py
│ └── database.db
├── requirements.txt
├── pyproject.toml
├── run.sh
├── seed_products.py


#### Backend responsibilities
- **models/**  
  Defines database models using SQLModel (User, Product, Order, OrderItem).
- **routes/**  
  Contains FastAPI routers grouped by resource (auth/users, products, orders, order items, health).
- **db.py**  
  Database engine and session management.
- **dependencies.py**  
  Shared FastAPI dependencies (database session, authentication, current user).
- **main.py**  
  Application entry point, router registration, and app configuration.
- **seed_products.py**  
  Script used to populate the database with initial product data.

---

### Frontend Structure

frontend/
└── react-router/
├── public/
├── src/
│ ├── api/
│ │ ├── orderItems.ts
│ │ ├── orders.ts
│ │ ├── products1.ts
│ │ └── users1.ts
│ ├── assets/
│ ├── components/
│ │ ├── Layout.tsx
│ │ └── Layout.css
│ ├── models/
│ │ ├── orderItems.ts
│ │ ├── orders.ts
│ │ ├── products1.ts
│ │ └── users1.ts
│ ├── pages/
│ │ ├── DisplayProducts1.tsx
│ │ ├── ProductDetail.tsx
│ │ ├── Checkout.tsx
│ │ ├── CreateUsers1.tsx
│ │ ├── LoginUsers1.tsx
│ │ └── *.css
│ ├── routes.tsx
│ ├── main.tsx
│ └── index.css
├── index.html
├── package.json
└── eslint.config.js


#### Frontend responsibilities
- **api/**  
  Centralized API layer for communicating with the backend (products, users, orders, order items).
- **models/**  
  TypeScript interfaces that mirror backend schemas, ensuring strong typing and consistency.
- **pages/**  
  Application views (product list, product detail, checkout, login, register).
- **components/**  
  Shared UI components such as the main layout and navigation.
- **routes.tsx**  
  React Router configuration defining application navigation.
- **main.tsx**  
  Frontend entry point.

---

## Local Development Setup

### Backend


#### Frontend responsibilities
- **api/**  
  Centralized API layer for communicating with the backend (products, users, orders, order items).
- **models/**  
  TypeScript interfaces that mirror backend schemas, ensuring strong typing and consistency.
- **pages/**  
  Application views (product list, product detail, checkout, login, register).
- **components/**  
  Shared UI components such as the main layout and navigation.
- **routes.tsx**  
  React Router configuration defining application navigation.
- **main.tsx**  
  Frontend entry point.

---

## Local Development Setup

### Backend

1. Create and activate a virtual environment:
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
DATABASE_URL=postgresql://postgres.pngzytvvzjcvxzmeoaih:estanoesbroki34@aws-1-eu-central-1.pooler.supabase.com:6543/postgres
uvicorn app.main:app --reload

```
The backend will be available at:
http://localhost:8000
API documentation: http://localhost:8000/docs


## Frontend

### Install dependencies

```bash
cd frontend/react-router
npm install
Configure environment variables
Create a .env file inside frontend/react-router/ and add:

VITE_API_BASE_URL=http://localhost:8000
Run the development server
npm run dev
Frontend URL (local)

```
Once running, the frontend will be available at:

http://localhost:5173/products

## Design and Architecture Decisions

This section focuses on the key design decisions that directly impact correctness, data integrity, and alignment with real-world e-commerce systems.

---

### Cart Modelled as a Persistent Backend Order

The most important architectural decision in this project is modelling the shopping cart as a backend **Order** with status `pending`, instead of keeping the cart purely in frontend state.

**Why this decision matters:**
In an e-commerce application, the cart directly affects pricing, stock, and order creation. Allowing the client to fully control this logic would make the system unreliable and easy to manipulate.

By representing the cart as a database entity:
- The backend becomes the single source of truth for prices and quantities.
- Stock validation happens at the moment items are added or updated.
- The system naturally supports order history without additional transformations.

**What this achieves:**
- Prevents client-side price manipulation.
- Ensures stock consistency at checkout time.
- Aligns the project with real production e-commerce architectures.

**Trade-off:**
This approach introduces additional API calls, but correctness and data integrity were prioritized over minimizing requests.

---

### Price Snapshot at Order Item Level

Each `OrderItem` stores its own `unit_price_cents`, instead of always referencing the current product price.

**Why this decision matters:**
Product prices can change over time. If historical orders depended on the current product price, past orders would become inconsistent and incorrect.

**What this achieves:**
- Orders remain accurate and immutable over time.
- Financial data reflects the exact price accepted by the user at checkout.
- The system avoids recalculating historical totals based on updated product data.

This is a critical concept in real-world order systems and directly improves data reliability.

---

### Integer-Based Price Representation (`price_cents`)

All monetary values are stored as integers representing cents.

**Why this decision matters:**
Floating-point arithmetic introduces rounding errors, which is unacceptable in financial calculations.

**What this achieves:**
- Exact and predictable price calculations.
- Correct order totals even when summing multiple items.
- Compliance with standard financial software practices.

This decision directly impacts business logic correctness.

---

### Backend-Centric Business Logic

Key business rules (stock validation, order creation, order status changes) are implemented in the backend rather than the frontend.

**Why this decision matters:**
The frontend is inherently untrusted. Any critical logic executed there can be bypassed or altered.

**What this achieves:**
- Strong guarantees that invalid orders cannot be created.
- Consistent behavior regardless of client implementation.
- A clear boundary between presentation logic and business rules.

This aligns with the assignment requirement for correct business logic implementation.

---

### Stateless Authentication with JWT

JWT-based authentication was chosen to protect user-specific resources such as orders and checkout.

**Why this decision matters:**
JWT allows the backend to remain stateless while still enforcing authentication and authorization.

**What this achieves:**
- Scalability and simplicity in deployment.
- Clear separation between public and protected endpoints.
- Independent frontend and backend deployments without shared session storage.

This design supports real-world deployment scenarios.

---

### Frontend as a Thin Client

The frontend is designed to act primarily as a presentation layer, delegating validation and business decisions to the backend.

**Why this decision matters:**
Duplicating business logic on the client increases complexity and risks inconsistencies.

**What this achieves:**
- Simpler and more maintainable frontend code.
- Reduced risk of logic divergence between client and server.
- Clear ownership of responsibilities across the stack.

---

### Use of Managed Infrastructure (Supabase, Render, Vercel)

The project uses managed services for database, backend, and frontend hosting.

**Why this decision matters:**
The goal was to simulate a realistic production environment without unnecessary infrastructure complexity.

**What this achieves:**
- A real PostgreSQL database instead of a local-only setup.
- Independent scaling and deployment of frontend and backend.
- A setup comparable to modern full-stack applications.

---

Overall, these decisions prioritize **correctness, data integrity, and architectural realism** over simplicity, directly addressing the core challenges of building a functional e-commerce system.


## Possible Improvements

- Admin dashboard for managing products and users.
- Product images and categories.
- Pagination and advanced search filters.
- Improved authentication security (e.g. refresh tokens / httpOnly cookies).
- Automated testing for backend and frontend.
