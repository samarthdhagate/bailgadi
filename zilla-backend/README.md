# 🦎 Zilla Backend

Real-time, concurrency-safe appointment booking system API.

## Tech Stack

- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **Database:** PostgreSQL (Neon serverless)
- **Cache/Locks:** Redis (Upstash REST-based)
- **Auth:** JWT (access + refresh tokens)
- **Payments:** Razorpay (UPI, cards, netbanking)
- **Email:** Nodemailer (SMTP)

## Quick Start

### 1. Install Dependencies

```bash
cd zilla-backend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your actual credentials
```

### 3. Set Up Database

Run the schema against your Neon PostgreSQL database:

```bash
psql $DATABASE_URL -f db/schema.sql
```

### 4. Start Development Server

```bash
npm run dev
```

Server runs at `http://localhost:5000`

## API Endpoints

### Auth (`/api/auth`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/signup` | Create account | Public |
| POST | `/verify-otp` | Verify email OTP | Public |
| POST | `/login` | Login → access_token + cookie | Public |
| POST | `/refresh` | Refresh access token | Cookie |
| POST | `/logout` | Clear refresh token | Bearer |
| POST | `/forgot-password` | Send password reset OTP | Public |
| POST | `/reset-password` | Reset password with OTP | Public |

### Services (`/api/services`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | List published services | Public |
| GET | `/my` | Organiser's services | Organiser |
| POST | `/` | Create service | Organiser |
| PUT | `/:id` | Update service | Organiser |
| DELETE | `/:id` | Delete service | Organiser |
| PATCH | `/:id/publish` | Toggle publish | Organiser |

### Availability (`/api/availability`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/?service_id=&date=` | Available slots | Public |
| POST | `/working-hours` | Set working hours | Organiser |
| GET | `/working-hours` | Get working hours | Organiser |

### Bookings (`/api/bookings`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/lock` | Lock slot (Redis) | Customer |
| POST | `/` | Create booking | Customer |
| GET | `/my` | Customer's bookings | Customer |
| GET | `/provider` | Provider's bookings | Organiser |
| GET | `/all` | All bookings | Admin |
| PATCH | `/:id/cancel` | Cancel booking | Customer/Organiser |
| PATCH | `/:id/reschedule` | Reschedule | Customer |
| PATCH | `/:id/confirm` | Manual confirm | Organiser |

### Payments (`/api/payments`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/create-order` | Create Razorpay order | Customer |
| POST | `/verify` | Verify payment | Customer |
| POST | `/webhook` | Razorpay webhook | Public (HMAC) |

## Architecture

```
Request → Rate Limiter → Auth Middleware → Controller → Service → DB/Redis
                                                ↓
                                          Error Handler
```

### Concurrency Model (Slot Booking)

1. **Redis Lock** (first line of defense): `SET slot:{provider}:{time} {user} NX EX 600`
2. **DB Transaction** (final truth): `SELECT FOR UPDATE` + overlap check + capacity check
3. **Never trust lock alone** — always re-validate inside transaction

### Response Format

```json
// Success
{ "success": true, "data": { ... } }

// Error
{ "success": false, "error": { "code": "SLOT_LOCKED", "message": "..." } }
```

## Environment Variables

See `.env.example` for all required variables.

## Deployment

- **Backend:** Render (Node.js service)
- **Database:** Neon (PostgreSQL)
- **Cache:** Upstash (Redis)

## License

MIT
