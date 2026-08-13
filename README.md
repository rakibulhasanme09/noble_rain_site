# Noble Rain

Noble Rain is a full-stack e-commerce site for a premium leather-goods and accessories store, built on the MERN stack (MongoDB, Express, React, Node.js).

## Features

- Product catalog with categories, discounts, ratings & reviews, and multi-image galleries
- Cart, guest and logged-in checkout, coupon codes
- Order confirmation with a printable / downloadable PDF invoice
- Customer dashboard (order history) and admin dashboard (orders, products, users, coupons, categories, revenue analytics, site policies)
- Courier dispatch and status sync (Steadfast, Pathao)
- JWT authentication with role-based (admin) access control

## Tech Stack

- **Backend:** Node.js, Express, Mongoose (MongoDB), JWT, Multer (file uploads)
- **Frontend:** React (Vite), React Router, Axios, React Toastify, html2pdf.js

## Project Structure

```
noble_rain_test/
├── backend/     # Express API server
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/   # user-uploaded product images (gitignored)
│   └── server.js
└── frontend/    # React (Vite) client
    ├── src/
    │   ├── components/
    │   ├── context/
    │   └── pages/
    └── index.html
```

## Getting Started

### Prerequisites

- Node.js 18+
- A MongoDB instance (local or Atlas)

### Setup

1. Install dependencies for both apps:

   ```bash
   npm run install:all
   ```

2. Configure environment variables:

   ```bash
   cp backend/.env.example backend/.env
   ```

   Fill in `backend/.env` with your own values (MongoDB URI, JWT secret, courier API credentials, etc.). This file is gitignored and should never be committed.

3. (Optional) Seed an admin user:

   ```bash
   cd backend && node seedAdmin.js
   ```

   Creates `admin@noblerain.com` / `password123` — change this password after first login.

### Run in development

From the project root, this starts both the backend (port 5000 by default) and the frontend (Vite dev server) together:

```bash
npm run dev
```

Or run each independently:

```bash
# backend
cd backend && npm run dev

# frontend
cd frontend && npm run dev
```

### Build for production

```bash
cd frontend && npm run build
```

## Environment Variables

See [`backend/.env.example`](backend/.env.example) for the full list of variables the API expects (database connection, JWT secret, and Steadfast/Pathao courier credentials).
