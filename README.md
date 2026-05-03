# 🦖 ZILLA — The Premium Appointment OS

**ZILLA** is a state-of-the-art appointment booking and service management platform designed for the modern creator economy. Built with a high-fidelity glassmorphism aesthetic and a rock-solid PostgreSQL/Redis backend, ZILLA handles the entire reservation lifecycle—from availability selection to secure payment processing—with clinical precision.

![ZILLA Logo](./frontend/public/zilla_logo.png)

## 🚀 Key Features

- **💎 Premium Booking UX**: A multi-step, cinematic booking wizard with real-time capacity locking.
- **💳 Razorpay Integration**: Secure, branded checkout flow with instant signature verification and automated booking confirmation.
- **🔐 Enterprise-Grade Auth**: Hybrid authentication system supporting both traditional Email/OTP flows and seamless Google OAuth2.0 integration.
- **⚡ Real-time Capacity Management**: Uses Redis-backed distributed locking to prevent overbooking and "phantom" reservations.
- **🎨 State-of-the-Art UI**: Pure Vanilla CSS / Tailwind architecture featuring glassmorphic overlays, dynamic loaders, and responsive layouts.
- **📱 Dashboard Suite**: Dedicated views for Customers to manage bookings and Organisers to track revenue and schedules.

## 🛠️ Tech Stack

- **Frontend**: React 19, Tailwind CSS 4, Lucide Icons, Vite.
- **Backend**: Node.js, Express, PostgreSQL (node-postgres), Redis.
- **Security**: JWT (Access/Refresh), bcryptjs, Razorpay HMAC-SHA256 Verification.
- **Date/Time**: date-fns for high-precision schedule parsing.

## 🏃 Quick Start

### 1. Database Setup
Ensure PostgreSQL is running and create the database:
```bash
cd zilla-backend
# Import the schema
psql -U your_user -d zilla_db < db/schema.sql
# Seed the data
node scripts/seed_pro.js
```

### 2. Environment Configuration
Create `.env` files in both `frontend` and `zilla-backend` folders.

**Backend (.env):**
```env
PORT=5000
DATABASE_URL=postgres://user:pass@localhost:5432/zilla_db
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
FRONTEND_URL=http://localhost:5173
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=rzp_test_...
VITE_GOOGLE_CLIENT_ID=...
```

### 3. Install & Run
```bash
# Terminal 1: Backend
cd zilla-backend
npm install
npm run dev

# Terminal 2: Frontend
cd frontend
npm install
npm run dev
```

## 📐 Architecture

ZILLA follows a strict **Route-Controller-Service** architecture:
- **Services**: Pure business logic (e.g., `booking.service.js` handles transactions).
- **Controllers**: Thin orchestration layer (e.g., `auth.controller.js` handles requests/cookies).
- **Triggers**: Heavy lifting for data integrity (e.g., auto-expiring reservations) is handled directly by PostgreSQL triggers for 100% reliability.

---

Built with ❤️ for the Hackathon by the ZILLA Team.
