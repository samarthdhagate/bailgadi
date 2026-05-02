# Graph Report - C:\\1\_PROGRAMMING\\0\_Projects\\Zilla\\Zilla  (2026-05-02)

## Corpus Check
- Corpus is ~17,098 words - fits in a single context window. You may not need a graph.

## Summary
- 307 nodes · 657 edges · 69 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Structure Signals
- Entity graph basis: 248 non-file, non-concept node(s)
- Weakly connected components: 38
- Singleton components: 31
- Isolated nodes: 31
- Largest component: 113 node(s) (46% of the entity graph basis)
- Low-cohesion communities: 0
- Largest low-cohesion community: none on the entity graph basis

## Workspace Bridges
1. `App\(\)` - connects `Frontend App — Admin`, `Frontend App — Dashboard`, `Frontend App — Layout`, `Frontend App — Layout \(2\)`, `Frontend Appointment Editor`, `Frontend Auth Context`, `Frontend Auth Context — Auth`, `Frontend Auth Layout`, `Frontend Booking Wizard`, `Frontend My Bookings`; home: `Frontend App`; degree 19; score 7182.98
  source files: `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/App.jsx`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/context/AuthContext.jsx`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/admin/AdminDashboard.jsx`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/admin/UserManagement.jsx`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/auth/AuthLayout.jsx`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/auth/LoginPage.jsx`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/auth/SignupPage.jsx`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/customer/BookingConfirmation.jsx`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/customer/BookingWizard.jsx`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/customer/CustomerDashboard.jsx`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/customer/MyBookings.jsx`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/organiser/AppointmentEditor.jsx`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/organiser/AppointmentList.jsx`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/routes/ProtectedRoute.jsx`
2. `app` - connects `Zilla Backend Auth Routes`, `Zilla Backend Availability Routes`, `Zilla Backend Booking Routes`, `Zilla Backend Payment Routes`, `Zilla Backend Service Routes`; home: `Zilla Backend App`; degree 48; score 4958.44
  source files: `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/zilla-backend/src/app.js`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/zilla-backend/src/routes/auth.routes.js`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/zilla-backend/src/routes/availability.routes.js`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/zilla-backend/src/routes/booking.routes.js`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/zilla-backend/src/routes/payment.routes.js`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/zilla-backend/src/routes/service.routes.js`, `C:\\1\_PROGRAMMING\\0\_Projects\\Zilla\\Zilla\\zilla-backend\\src\\routes\\auth.routes.js`, `C:\\1\_PROGRAMMING\\0\_Projects\\Zilla\\Zilla\\zilla-backend\\src\\routes\\availability.routes.js`, `C:\\1\_PROGRAMMING\\0\_Projects\\Zilla\\Zilla\\zilla-backend\\src\\routes\\booking.routes.js`, `C:\\1\_PROGRAMMING\\0\_Projects\\Zilla\\Zilla\\zilla-backend\\src\\routes\\payment.routes.js`, `C:\\1\_PROGRAMMING\\0\_Projects\\Zilla\\Zilla\\zilla-backend\\src\\routes\\service.routes.js`
3. `verifyToken\(\)` - connects `Zilla Backend Auth Routes`, `Zilla Backend Availability Routes`, `Zilla Backend Booking Routes`, `Zilla Backend Payment Routes`, `Zilla Backend Service Routes`; home: `Zilla Backend App`; degree 36; score 3042.19
  source files: `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/zilla-backend/src/middleware/auth.middleware.js`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/zilla-backend/src/routes/auth.routes.js`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/zilla-backend/src/routes/availability.routes.js`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/zilla-backend/src/routes/booking.routes.js`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/zilla-backend/src/routes/payment.routes.js`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/zilla-backend/src/routes/service.routes.js`, `C:\\1\_PROGRAMMING\\0\_Projects\\Zilla\\Zilla\\zilla-backend\\src\\routes\\auth.routes.js`, `C:\\1\_PROGRAMMING\\0\_Projects\\Zilla\\Zilla\\zilla-backend\\src\\routes\\availability.routes.js`, `C:\\1\_PROGRAMMING\\0\_Projects\\Zilla\\Zilla\\zilla-backend\\src\\routes\\booking.routes.js`, `C:\\1\_PROGRAMMING\\0\_Projects\\Zilla\\Zilla\\zilla-backend\\src\\routes\\payment.routes.js`, `C:\\1\_PROGRAMMING\\0\_Projects\\Zilla\\Zilla\\zilla-backend\\src\\routes\\service.routes.js`
4. `/ \(layout\)` - connects `Frontend App`, `Frontend App — Booking`, `Frontend App — Bookings`, `Frontend App — Confirmation`, `Frontend App — Layout \(2\)`; home: `Frontend App — Dashboard`; degree 6; score 2043
  source files: `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/App.jsx`, `C:\\1\_PROGRAMMING\\0\_Projects\\Zilla\\Zilla\\frontend\\src\\routes\\ProtectedRoute.jsx`
5. `validateRequest\(\)` - connects `Zilla Backend Auth Routes`, `Zilla Backend Booking Routes`, `Zilla Backend Payment Routes`, `Zilla Backend Service Routes`; home: `Zilla Backend App`; degree 32; score 2274.47
  source files: `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/zilla-backend/src/routes/auth.routes.js`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/zilla-backend/src/routes/booking.routes.js`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/zilla-backend/src/routes/helpers/validation.js`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/zilla-backend/src/routes/payment.routes.js`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/zilla-backend/src/routes/service.routes.js`, `C:\\1\_PROGRAMMING\\0\_Projects\\Zilla\\Zilla\\zilla-backend\\src\\routes\\auth.routes.js`, `C:\\1\_PROGRAMMING\\0\_Projects\\Zilla\\Zilla\\zilla-backend\\src\\routes\\booking.routes.js`, `C:\\1\_PROGRAMMING\\0\_Projects\\Zilla\\Zilla\\zilla-backend\\src\\routes\\payment.routes.js`, `C:\\1\_PROGRAMMING\\0\_Projects\\Zilla\\Zilla\\zilla-backend\\src\\routes\\service.routes.js`
6. `BookingWizard\(\)` - connects `Frontend App`, `Frontend Appointment Editor`, `Frontend Booking Wizard — Booking`, `Frontend Booking Wizard — Booking \(2\)`; home: `Frontend Booking Wizard`; degree 13; score 2096.21
  source files: `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/App.jsx`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/components/Button.jsx`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/components/Card.jsx`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/components/ErrorMessage.jsx`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/components/Input.jsx`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/components/Loader.jsx`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/customer/BookingWizard.jsx`, `C:\\1\_PROGRAMMING\\0\_Projects\\Zilla\\Zilla\\frontend\\src\\pages\\customer\\BookingWizard.jsx`

## God Nodes
1. `app` - 49 edges
2. `verifyToken\(\)` - 37 edges
3. `validateRequest\(\)` - 33 edges
4. `App\(\)` - 21 edges
5. `Button\(\)` - 17 edges
6. `Card\(\)` - 17 edges
7. `BookingWizard\(\)` - 15 edges
8. `DashboardLayout\(\)` - 14 edges
9. `Loader\(\)` - 14 edges
10. `ErrorMessage\(\)` - 11 edges

## Surprising Connections
- `page /admin/AdminDashboard` --renders--> `AdminDashboard\(\)`  [EXTRACTED]
  C:\\1\_PROGRAMMING\\0\_Projects\\Zilla\\Zilla\\frontend\\src\\pages\\admin\\AdminDashboard.jsx → C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/admin/AdminDashboard.jsx  _connects across different repos/directories; bridges separate communities; peripheral node \`page /admin/AdminDashboard\` unexpectedly reaches hub \`AdminDashboard\(\)\`_
- `page /admin/UserManagement` --renders--> `UserManagement\(\)`  [EXTRACTED]
  C:\\1\_PROGRAMMING\\0\_Projects\\Zilla\\Zilla\\frontend\\src\\pages\\admin\\UserManagement.jsx → C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/admin/UserManagement.jsx  _connects across different repos/directories; bridges separate communities; peripheral node \`page /admin/UserManagement\` unexpectedly reaches hub \`UserManagement\(\)\`_
- `page /auth/LoginPage` --renders--> `LoginPage\(\)`  [EXTRACTED]
  C:\\1\_PROGRAMMING\\0\_Projects\\Zilla\\Zilla\\frontend\\src\\pages\\auth\\LoginPage.jsx → C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/auth/LoginPage.jsx  _connects across different repos/directories; bridges separate communities; peripheral node \`page /auth/LoginPage\` unexpectedly reaches hub \`LoginPage\(\)\`_
- `page /auth/SignupPage` --renders--> `SignupPage\(\)`  [EXTRACTED]
  C:\\1\_PROGRAMMING\\0\_Projects\\Zilla\\Zilla\\frontend\\src\\pages\\auth\\SignupPage.jsx → C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/auth/SignupPage.jsx  _connects across different repos/directories; bridges separate communities; peripheral node \`page /auth/SignupPage\` unexpectedly reaches hub \`SignupPage\(\)\`_
- `page /customer/BookingConfirmation` --renders--> `BookingConfirmation\(\)`  [EXTRACTED]
  C:\\1\_PROGRAMMING\\0\_Projects\\Zilla\\Zilla\\frontend\\src\\pages\\customer\\BookingConfirmation.jsx → C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/customer/BookingConfirmation.jsx  _connects across different repos/directories; bridges separate communities; peripheral node \`page /customer/BookingConfirmation\` unexpectedly reaches hub \`BookingConfirmation\(\)\`_

## Semantic Anomalies
- **[HIGH] Bridge node** - App\(\) bridges Frontend App and Zilla Backend App, Frontend Auth Context — Auth, Frontend Auth Layout, Frontend Appointment Editor, Frontend Auth Context, Frontend My Bookings, Frontend Booking Wizard, Frontend App — Layout, Frontend App — Dashboard, Frontend App — Layout \(2\), Frontend App — Admin.
  _High betweenness centrality \(7063.979\) across 12 communities makes this node a likely dependency chokepoint._
- **[HIGH] Bridge node** - app bridges Zilla Backend App and Zilla Backend Auth Routes, Zilla Backend Service Routes, Zilla Backend Availability Routes, Zilla Backend Booking Routes, Zilla Backend Payment Routes.
  _High betweenness centrality \(4860.435\) across 6 communities makes this node a likely dependency chokepoint._
- **[HIGH] Bridge node** - verifyToken\(\) bridges Zilla Backend App and Zilla Backend Auth Middleware, Zilla Backend Auth Routes, Zilla Backend Availability Routes, Zilla Backend Booking Routes, Zilla Backend Payment Routes, Zilla Backend Service Routes.
  _High betweenness centrality \(2956.186\) across 7 communities makes this node a likely dependency chokepoint._
- **[HIGH] Cross-boundary edge** - / \(layout\) → ProtectedRoute\(\) crosses graph boundaries in an unexpected way.
  _connects across different repos/directories; bridges separate communities_
- **[HIGH] Cross-boundary edge** - page /admin/AdminDashboard → AdminDashboard\(\) crosses graph boundaries in an unexpected way.
  _connects across different repos/directories; bridges separate communities; peripheral node \`page /admin/AdminDashboard\` unexpectedly reaches hub \`AdminDashboard\(\)\`_

## Communities

### Community 0 - "Zilla Backend App"
Cohesion (entity basis within full-graph community): 0.07
Nodes (49): verifyToken\(\), app, GET /health, DELETE /api/services/:id, GET /api/availability, GET /api/availability/working-hours, GET /api/bookings/all, GET /api/bookings/my (+41 more)

### Community 1 - "Frontend Appointment Editor"
Cohesion (entity basis within full-graph community): 0.14
Nodes (23): AdminDashboard\(\), fetch\(\), AppointmentEditor\(\), handleSave\(\), renderTabContent\(\), reducer\(\), AppointmentList\(\), fetch\(\) (+15 more)

### Community 2 - "Zilla Backend Auth Routes"
Cohesion (entity basis within full-graph community): 0.22
Nodes (9): router, POST /forgot-password, POST /login, POST /logout, POST /refresh, POST /reset-password, POST /signup, POST /verify-otp (+1 more)

### Community 3 - "Zilla Backend Booking Routes"
Cohesion (entity basis within full-graph community): 0.22
Nodes (9): router, GET /all, GET /my, GET /provider, PATCH /:id/cancel, PATCH /:id/confirm, PATCH /:id/reschedule, POST / (+1 more)

### Community 4 - "Zilla Backend Booking Controller"
Cohesion (entity basis within full-graph community): 0
Nodes (8): cancelBooking\(\), confirmBooking\(\), createBooking\(\), getAllBookings\(\), getMyBookings\(\), getProviderBookings\(\), lockSlot\(\), rescheduleBooking\(\)

### Community 5 - "Zilla Backend Auth Controller"
Cohesion (entity basis within full-graph community): 0
Nodes (7): forgotPassword\(\), login\(\), logout\(\), refresh\(\), resetPassword\(\), signup\(\), verifyOTP\(\)

### Community 6 - "Zilla Backend Booking Service"
Cohesion (entity basis within full-graph community): 0
Nodes (7): cancelBooking\(\), confirmBooking\(\), getAllBookings\(\), getMyBookings\(\), getProviderBookings\(\), lockSlot\(\), rescheduleBooking\(\)

### Community 7 - "Zilla Backend Service Routes"
Cohesion (entity basis within full-graph community): 0.29
Nodes (7): DELETE /:id, router, GET /, GET /my, PATCH /:id/publish, POST /, PUT /:id

### Community 8 - "Zilla Backend Service Controller"
Cohesion (entity basis within full-graph community): 0
Nodes (6): create\(\), listMine\(\), listPublished\(\), remove\(\), togglePublish\(\), update\(\)

### Community 9 - "Frontend App"
Cohesion (entity basis within full-graph community): 0.67
Nodes (4): App\(\), Navigate, /, /\*

### Community 10 - "Zilla Backend Availability Routes"
Cohesion (entity basis within full-graph community): 0.5
Nodes (4): router, GET /, GET /working-hours, POST /working-hours

### Community 11 - "Frontend Booking Wizard"
Cohesion (entity basis within full-graph community): 0.4
Nodes (5): BookingWizard\(\), fetchSlots\(\), handleBack\(\), init\(\), renderStep\(\)

### Community 12 - "Zilla Backend Payment Routes"
Cohesion (entity basis within full-graph community): 0.5
Nodes (4): router, POST /create-order, POST /verify, POST /webhook

### Community 13 - "Zilla Backend Mailer"
Cohesion (entity basis within full-graph community): 0.5
Nodes (4): sendBookingConfirmation\(\), sendCancellationNotice\(\), sendEmail\(\), sendOTPEmail\(\)

### Community 14 - "Zilla Backend Redis"
Cohesion (entity basis within full-graph community): 0
Nodes (4): redisDel\(\), redisExists\(\), redisGet\(\), redisSetNX\(\)

### Community 15 - "Zilla Backend Auth Service"
Cohesion (entity basis within full-graph community): 0
Nodes (3): logout\(\), resetPassword\(\), verifyOTP\(\)

### Community 16 - "Frontend Auth Context"
Cohesion (entity basis within full-graph community): 1
Nodes (2): useAuth\(\), ProtectedRoute\(\)

### Community 17 - "Zilla Backend Availability Controller"
Cohesion (entity basis within full-graph community): 0
Nodes (3): getSlots\(\), getWorkingHours\(\), setWorkingHours\(\)

### Community 18 - "Zilla Backend Availability Service"
Cohesion (entity basis within full-graph community): 0
Nodes (3): getAvailableSlots\(\), getWorkingHours\(\), setWorkingHours\(\)

### Community 19 - "Frontend My Bookings"
Cohesion (entity basis within full-graph community): 0.5
Nodes (4): MyBookings\(\), fetchBookings\(\), getStatusIcon\(\), getStatusStyle\(\)

### Community 20 - "Zilla Backend Notification Service"
Cohesion (entity basis within full-graph community): 0
Nodes (3): sendBookingConfirmation\(\), sendCancellationNotice\(\), sendOTP\(\)

### Community 21 - "Zilla Backend Overlap"
Cohesion (entity basis within full-graph community): 0
Nodes (3): countOverlapping\(\), hasOverlap\(\), intervalsOverlap\(\)

### Community 22 - "Zilla Backend Payment Controller"
Cohesion (entity basis within full-graph community): 0
Nodes (3): createOrder\(\), verifyPayment\(\), webhook\(\)

### Community 23 - "Zilla Backend Payment Service"
Cohesion (entity basis within full-graph community): 0
Nodes (3): createOrder\(\), handleWebhook\(\), verifyPayment\(\)

### Community 24 - "Zilla Backend Auth Service — Forgot"
Cohesion (entity basis within full-graph community): 0.67
Nodes (3): forgotPassword\(\), generateOTP\(\), signup\(\)

### Community 25 - "Frontend Auth Context — Auth"
Cohesion (entity basis within full-graph community): 0.67
Nodes (3): AuthProvider\(\), login\(\), logout\(\)

### Community 26 - "Frontend App — Dashboard"
Cohesion (entity basis within full-graph community): 0.67
Nodes (3): CustomerDashboard, / \(layout\), /dashboard

### Community 27 - "Frontend App — Admin"
Cohesion (entity basis within full-graph community): 0.67
Nodes (3): / \(layout\), /admin, AdminDashboard\(\)

### Community 28 - "Zilla Backend Error Middleware"
Cohesion (entity basis within full-graph community): 0.67
Nodes (3): AppError, .constructor\(\), Error

### Community 29 - "Zilla Backend Auth Middleware"
Cohesion (entity basis within full-graph community): 1
Nodes (1): requireRole\(\)

### Community 30 - "Zilla Backend Auth Service — Access"
Cohesion (entity basis within full-graph community): 1
Nodes (2): generateAccessToken\(\), refresh\(\)

### Community 31 - "Zilla Backend Auth Service — Generate"
Cohesion (entity basis within full-graph community): 1
Nodes (2): generateRefreshToken\(\), login\(\)

### Community 32 - "Frontend Auth Layout"
Cohesion (entity basis within full-graph community): 1
Nodes (1): AuthLayout\(\)

### Community 33 - "Zilla Backend Booking Service — Booking"
Cohesion (entity basis within full-graph community): 1
Nodes (2): createBooking\(\), generateConfirmationCode\(\)

### Community 34 - "Frontend Booking Wizard — Booking"
Cohesion (entity basis within full-graph community): 1
Nodes (2): handleNext\(\), submitBooking\(\)

### Community 35 - "Frontend App — Layout"
Cohesion (entity basis within full-graph community): 1
Nodes (2): / \(layout\), AuthLayout\(\)

### Community 36 - "Frontend App — Layout \(2\)"
Cohesion (entity basis within full-graph community): 1
Nodes (2): / \(layout\), ProtectedRoute\(\)

### Community 37 - "Frontend App — Admin \(2\)"
Cohesion (entity basis within full-graph community): 1
Nodes (2): /admin/users, UserManagement\(\)

### Community 38 - "Frontend App — Booking"
Cohesion (entity basis within full-graph community): 1
Nodes (2): /booking/:serviceId, BookingWizard\(\)

### Community 39 - "Frontend App — Bookings"
Cohesion (entity basis within full-graph community): 1
Nodes (2): /bookings, MyBookings\(\)

### Community 40 - "Frontend App — Confirmation"
Cohesion (entity basis within full-graph community): 1
Nodes (2): /confirmation, BookingConfirmation\(\)

### Community 41 - "Frontend App — Login"
Cohesion (entity basis within full-graph community): 1
Nodes (2): /login, LoginPage\(\)

### Community 42 - "Frontend App — Appointment"
Cohesion (entity basis within full-graph community): 1
Nodes (2): /organiser, AppointmentList\(\)

### Community 43 - "Frontend App — Editor"
Cohesion (entity basis within full-graph community): 1
Nodes (2): /organiser/editor/:id, AppointmentEditor\(\)

### Community 44 - "Frontend App — Signup"
Cohesion (entity basis within full-graph community): 1
Nodes (2): /signup, SignupPage\(\)

### Community 45 - "Frontend Admin Dashboard"
Cohesion (entity basis within full-graph community): 1
Nodes (2): page /admin/AdminDashboard, /admin/AdminDashboard

### Community 46 - "Frontend User Management"
Cohesion (entity basis within full-graph community): 1
Nodes (2): page /admin/UserManagement, /admin/UserManagement

### Community 47 - "Frontend Auth Layout — Auth"
Cohesion (entity basis within full-graph community): 1
Nodes (2): page /auth/AuthLayout, /auth/AuthLayout

### Community 48 - "Frontend Login Page"
Cohesion (entity basis within full-graph community): 1
Nodes (2): page /auth/LoginPage, /auth/LoginPage

### Community 49 - "Frontend Signup Page"
Cohesion (entity basis within full-graph community): 1
Nodes (2): page /auth/SignupPage, /auth/SignupPage

### Community 50 - "Frontend Booking Confirmation"
Cohesion (entity basis within full-graph community): 1
Nodes (2): page /customer/BookingConfirmation, /customer/BookingConfirmation

### Community 51 - "Frontend Booking Wizard — Booking \(2\)"
Cohesion (entity basis within full-graph community): 1
Nodes (2): page /customer/BookingWizard, /customer/BookingWizard

### Community 52 - "Frontend Customer Dashboard"
Cohesion (entity basis within full-graph community): 1
Nodes (2): page /customer/CustomerDashboard, /customer/CustomerDashboard

### Community 53 - "Frontend My Bookings — Bookings"
Cohesion (entity basis within full-graph community): 1
Nodes (2): page /customer/MyBookings, /customer/MyBookings

### Community 54 - "Frontend Appointment Editor — Appointment"
Cohesion (entity basis within full-graph community): 1
Nodes (2): page /organiser/AppointmentEditor, /organiser/AppointmentEditor

### Community 55 - "Frontend Appointment List"
Cohesion (entity basis within full-graph community): 1
Nodes (2): page /organiser/AppointmentList, /organiser/AppointmentList

### Community 56 - "Zilla Backend Db"
Cohesion (entity basis within full-graph community): 1
Nodes (1): query\(\)

### Community 57 - "Zilla Backend Error Middleware — Error"
Cohesion (entity basis within full-graph community): 1
Nodes (1): errorHandler\(\)

### Community 58 - "Zilla Backend Server"
Cohesion (entity basis within full-graph community): 1
Nodes (1): shutdown\(\)

### Community 59 - "Zilla Backend Slot Generator"
Cohesion (entity basis within full-graph community): 1
Nodes (1): generateSlots\(\)

### Community 60 - "Env Js"
Cohesion (entity basis within full-graph community): n/a
Nodes (0): 

### Community 61 - "Eslint Config Js"
Cohesion (entity basis within full-graph community): n/a
Nodes (0): 

### Community 62 - "Favicon SVG"
Cohesion (entity basis within full-graph community): n/a
Nodes (0): 

### Community 63 - "Hero Png"
Cohesion (entity basis within full-graph community): n/a
Nodes (0): 

### Community 64 - "Icons SVG"
Cohesion (entity basis within full-graph community): n/a
Nodes (0): 

### Community 65 - "Postcss Config Js"
Cohesion (entity basis within full-graph community): n/a
Nodes (0): 

### Community 66 - "Rate Limit Middleware Js"
Cohesion (entity basis within full-graph community): n/a
Nodes (0): 

### Community 67 - "Tailwind Config Js"
Cohesion (entity basis within full-graph community): n/a
Nodes (0): 

### Community 68 - "Vite SVG"
Cohesion (entity basis within full-graph community): n/a
Nodes (0): 

## Knowledge Gaps
- **97 weakly connected node(s):** `AuthLayout\(\)`, `LoginPage\(\)`, `SignupPage\(\)`, `CustomerDashboard`, `MyBookings\(\)` (+92 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Zilla Backend Auth Middleware`** (2 nodes): `auth.middleware.js`, `requireRole\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Zilla Backend Auth Service — Access`** (2 nodes): `generateAccessToken\(\)`, `refresh\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Zilla Backend Auth Service — Generate`** (2 nodes): `generateRefreshToken\(\)`, `login\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend Auth Layout`** (2 nodes): `AuthLayout.jsx`, `AuthLayout\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Zilla Backend Booking Service — Booking`** (2 nodes): `createBooking\(\)`, `generateConfirmationCode\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend Booking Wizard — Booking`** (2 nodes): `handleNext\(\)`, `submitBooking\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend App — Layout`** (2 nodes): `/ \(layout\)`, `AuthLayout\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend App — Layout \(2\)`** (2 nodes): `/ \(layout\)`, `ProtectedRoute\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend App — Admin \(2\)`** (2 nodes): `/admin/users`, `UserManagement\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend App — Booking`** (2 nodes): `/booking/:serviceId`, `BookingWizard\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend App — Bookings`** (2 nodes): `/bookings`, `MyBookings\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend App — Confirmation`** (2 nodes): `/confirmation`, `BookingConfirmation\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend App — Login`** (2 nodes): `/login`, `LoginPage\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend App — Appointment`** (2 nodes): `/organiser`, `AppointmentList\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend App — Editor`** (2 nodes): `/organiser/editor/:id`, `AppointmentEditor\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend App — Signup`** (2 nodes): `/signup`, `SignupPage\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend Admin Dashboard`** (2 nodes): `page /admin/AdminDashboard`, `/admin/AdminDashboard`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend User Management`** (2 nodes): `page /admin/UserManagement`, `/admin/UserManagement`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend Auth Layout — Auth`** (2 nodes): `page /auth/AuthLayout`, `/auth/AuthLayout`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend Login Page`** (2 nodes): `page /auth/LoginPage`, `/auth/LoginPage`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend Signup Page`** (2 nodes): `page /auth/SignupPage`, `/auth/SignupPage`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend Booking Confirmation`** (2 nodes): `page /customer/BookingConfirmation`, `/customer/BookingConfirmation`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend Booking Wizard — Booking \(2\)`** (2 nodes): `page /customer/BookingWizard`, `/customer/BookingWizard`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend Customer Dashboard`** (2 nodes): `page /customer/CustomerDashboard`, `/customer/CustomerDashboard`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend My Bookings — Bookings`** (2 nodes): `page /customer/MyBookings`, `/customer/MyBookings`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend Appointment Editor — Appointment`** (2 nodes): `page /organiser/AppointmentEditor`, `/organiser/AppointmentEditor`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend Appointment List`** (2 nodes): `page /organiser/AppointmentList`, `/organiser/AppointmentList`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Zilla Backend Db`** (2 nodes): `db.js`, `query\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Zilla Backend Error Middleware — Error`** (2 nodes): `error.middleware.js`, `errorHandler\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Zilla Backend Server`** (2 nodes): `server.js`, `shutdown\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Zilla Backend Slot Generator`** (2 nodes): `slotGenerator.js`, `generateSlots\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Env Js`** (1 nodes): `env.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Eslint Config Js`** (1 nodes): `eslint.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Favicon SVG`** (1 nodes): `favicon.svg`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Hero Png`** (1 nodes): `hero.png`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Icons SVG`** (1 nodes): `icons.svg`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Postcss Config Js`** (1 nodes): `postcss.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Rate Limit Middleware Js`** (1 nodes): `rateLimit.middleware.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Tailwind Config Js`** (1 nodes): `tailwind.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Vite SVG`** (1 nodes): `vite.svg`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does \`App\(\)\` connect \`Frontend App\` to \`Zilla Backend App\`, \`Frontend Auth Context — Auth\`, \`Frontend Auth Layout\`, \`Frontend Appointment Editor\`, \`Frontend Auth Context\`, \`Frontend My Bookings\`, \`Frontend Booking Wizard\`, \`Frontend App — Layout\`, \`Frontend App — Dashboard\`, \`Frontend App — Layout \(2\)\`, \`Frontend App — Admin\`?**
  _High betweenness centrality \(7063.979\) - this node is a cross-community bridge._
- **Why does \`app\` connect \`Zilla Backend App\` to \`Zilla Backend Auth Routes\`, \`Zilla Backend Service Routes\`, \`Zilla Backend Availability Routes\`, \`Zilla Backend Booking Routes\`, \`Zilla Backend Payment Routes\`?**
  _High betweenness centrality \(4860.435\) - this node is a cross-community bridge._
- **Why does \`verifyToken\(\)\` connect \`Zilla Backend App\` to \`Zilla Backend Auth Middleware\`, \`Zilla Backend Auth Routes\`, \`Zilla Backend Availability Routes\`, \`Zilla Backend Booking Routes\`, \`Zilla Backend Payment Routes\`, \`Zilla Backend Service Routes\`?**
  _High betweenness centrality \(2956.186\) - this node is a cross-community bridge._
- **What connects \`AuthLayout\(\)\`, \`LoginPage\(\)\`, \`SignupPage\(\)\` to the rest of the system?**
  _97 weakly-connected nodes found - possible documentation gaps or missing edges._
