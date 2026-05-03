# 🦎 Zilla — Advanced Appointment Booking Platform

Zilla is a high-performance, full-stack monorepo application designed for real-time, concurrency-safe appointment scheduling. It features a robust architecture combining **React**, **Express**, **PostgreSQL**, and **Redis**, integrated with **Google Gemini AI** for intelligent interactions.

![Zilla Header](https://raw.githubusercontent.com/lucide-react/lucide/main/icons/calendar-check.svg)

## 🚀 Overview

Zilla solves the "double-booking" problem using a two-tier locking system (Redis + SQL transactions) while providing a premium, modern user experience. Whether you are a customer booking a service, an organiser managing schedules, or an administrator overseeing the platform, Zilla provides tailored dashboards and tools for each role.

---

## ✨ Key Features

### 🛡️ Concurrency & Safety
- **Dual-Layer Locking**: Uses Redis (Upstash) for ephemeral slot locking during checkout and PostgreSQL `SELECT FOR UPDATE` for final transaction integrity.
- **Atomic Bookings**: Ensures no two users can book the same slot simultaneously, even under high traffic.

### 🤖 AI Integration
- **Gemini-Powered Chat**: An intelligent assistant capable of answering queries and helping users find available slots.
- **Smart Scheduling**: Logic to suggest optimal times based on provider availability.

### 💳 Seamless Payments
- **Razorpay Integration**: Fully integrated payment gateway supporting UPI, Cards, and Netbanking.
- **Webhook Support**: Securely handles payment confirmations and booking status updates.

### 🔐 Enterprise-Grade Auth
- **Hybrid Authentication**: Support for traditional Email/Password and Google OAuth 2.0.
- **Role-Based Access Control (RBAC)**: Distinct permissions and dashboards for `Customer`, `Organiser`, and `Admin`.
- **JWT & Cookies**: Secure session management with access and refresh tokens.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State/Routing**: React Router 7 + Context API

### Backend
- **Runtime**: Node.js (Express)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (Hosted on Neon)
- **Caching/Locking**: [Redis](https://redis.io/) (Upstash)
- **AI**: [Google Gemini Pro](https://deepmind.google/technologies/gemini/)
- **Mailing**: Nodemailer (SMTP)

---

## 📂 Project Structure

This project uses **npm workspaces** for monorepo management:

```text
zilla/
├── frontend/           # Vite + React client application
├── zilla-backend/      # Express.js API server
├── services/           # Shared business logic and modular services
├── db/                 # Database schemas and migration scripts
└── package.json        # Root workspace configuration
```

---

## 🚦 Getting Started

### Prerequisites
- Node.js (v18.0.0 or higher)
- PostgreSQL Database
- Redis Instance (Upstash recommended)
- Gemini API Key & Razorpay Credentials

### 1. Installation
Clone the repository and install dependencies for all workspaces:
```bash
npm run install:all
```

### 2. Environment Setup
Create a `.env` file in the `zilla-backend` directory:
```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=your_postgresql_url

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...

# Auth
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Payments
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...

# AI
GEMINI_API_KEY=...
```

### 3. Database Initialization
Run the schema script to set up your tables:
```bash
cd zilla-backend
npm run db:setup
```

### 4. Running the App
Start both frontend and backend concurrently from the root directory:
```bash
npm run dev
```
- **Frontend**: `http://localhost:5173`
- **Backend**: `http://localhost:5000`

---

## 🔌 API Summary

| Category | Base Path | Key Functionalities |
|----------|-----------|----------------------|
| **Auth** | `/api/auth` | Signup, Login, OAuth, OTP Verification |
| **Services** | `/api/services` | Service Management (CRUD), Publishing |
| **Bookings** | `/api/bookings` | Slot Locking, Creation, Rescheduling |
| **Payments** | `/api/payments` | Order Creation, Signature Verification |
| **AI** | `/api/ai` | Chat Assistant, Recommendation Engine |

---



---

<p align="center">Made with ❤️ by the Harsh,Adi,Samarth,Anvit as a part of 24 hours odooxvitpune hackathon </p>

