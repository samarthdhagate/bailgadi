# Graph Report - C:\\1\_PROGRAMMING\\0\_Projects\\Zilla\\Zilla  (2026-05-02)

## Corpus Check
- Corpus is ~22,986 words - fits in a single context window. You may not need a graph.

## Summary
- 371 nodes · 760 edges · 93 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Structure Signals
- Entity graph basis: 298 non-file, non-concept node(s)
- Weakly connected components: 47
- Singleton components: 39
- Isolated nodes: 39
- Largest component: 116 node(s) (39% of the entity graph basis)
- Low-cohesion communities: 0
- Largest low-cohesion community: none on the entity graph basis

## Workspace Bridges
1. `App\(\)` - connects `Frontend Admin Dashboard`, `Frontend App — Admin`, `Frontend App — Appointment`, `Frontend App — Booking`, `Frontend App — Layout`, `Frontend App — Navigate`, `Frontend App — Settings`, `Frontend Appointment Editor`, `Frontend Appointment List`, `Frontend Auth Context`, `Frontend Auth Layout`, `Frontend Booking Confirmation`, `Frontend Landing Page — Landing`, `Frontend My Bookings`, `Frontend Resource Editor`, `Frontend Settings Page`, `Frontend Signup Page — Handle`, `Frontend User Editor`; home: `Frontend App`; degree 24; score 12029.7
  source files: `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/App.jsx`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/context/AuthContext.jsx`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/admin/UserManagement.jsx`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/auth/AuthLayout.jsx`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/auth/LoginPage.jsx`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/auth/SignupPage.jsx`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/customer/BookingConfirmation.jsx`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/customer/CustomerDashboard.jsx`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/customer/MyBookings.jsx`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/LandingPage.jsx`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/organiser/AppointmentEditor.jsx`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/organiser/AppointmentList.jsx`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/organiser/Meetings.jsx`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/organiser/Reporting.jsx`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/organiser/ResourceEditor.jsx`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/organiser/UserEditor.jsx`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/SettingsPage.jsx`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/routes/ProtectedRoute.jsx`
2. `/ \(layout\)` - connects `Frontend App`, `Frontend App — Editor`, `Frontend App — Meetings`, `Frontend App — Reporting`, `Frontend App — Resource`, `Frontend App — Settings`, `Frontend App — User`; home: `Frontend App — Appointment`; degree 8; score 3674
  source files: `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/App.jsx`, `C:\\1\_PROGRAMMING\\0\_Projects\\Zilla\\Zilla\\frontend\\src\\routes\\ProtectedRoute.jsx`
3. `DashboardLayout\(\)` - connects `Frontend Appointment Editor`, `Frontend Appointment List`, `Frontend My Bookings`, `Frontend Resource Editor`, `Frontend Settings Page`, `Frontend User Editor`; home: `Frontend Admin Dashboard`; degree 11; score 771.53
  source files: `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/components/DashboardLayout.jsx`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/context/AuthContext.jsx`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/admin/UserManagement.jsx`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/customer/CustomerDashboard.jsx`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/customer/MyBookings.jsx`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/organiser/AppointmentEditor.jsx`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/organiser/AppointmentList.jsx`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/organiser/Meetings.jsx`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/organiser/Reporting.jsx`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/organiser/ResourceEditor.jsx`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/organiser/UserEditor.jsx`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/SettingsPage.jsx`
4. `app` - connects `Zilla Backend Auth Routes`, `Zilla Backend Availability Routes`, `Zilla Backend Booking Routes`, `Zilla Backend Payment Routes`, `Zilla Backend Service Routes`; home: `Zilla Backend App`; degree 49; score 5811.99
  source files: `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/zilla-backend/src/app.js`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/zilla-backend/src/routes/auth.routes.js`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/zilla-backend/src/routes/availability.routes.js`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/zilla-backend/src/routes/booking.routes.js`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/zilla-backend/src/routes/payment.routes.js`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/zilla-backend/src/routes/service.routes.js`, `C:\\1\_PROGRAMMING\\0\_Projects\\Zilla\\Zilla\\zilla-backend\\src\\routes\\auth.routes.js`, `C:\\1\_PROGRAMMING\\0\_Projects\\Zilla\\Zilla\\zilla-backend\\src\\routes\\availability.routes.js`, `C:\\1\_PROGRAMMING\\0\_Projects\\Zilla\\Zilla\\zilla-backend\\src\\routes\\booking.routes.js`, `C:\\1\_PROGRAMMING\\0\_Projects\\Zilla\\Zilla\\zilla-backend\\src\\routes\\payment.routes.js`, `C:\\1\_PROGRAMMING\\0\_Projects\\Zilla\\Zilla\\zilla-backend\\src\\routes\\service.routes.js`
5. `/ \(layout\)` - connects `Frontend App`, `Frontend App — Bookings`, `Frontend App — Confirmation`, `Frontend App — Dashboard`, `Frontend App — Settings`; home: `Frontend App — Booking`; degree 6; score 2200
  source files: `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/App.jsx`, `C:\\1\_PROGRAMMING\\0\_Projects\\Zilla\\Zilla\\frontend\\src\\routes\\ProtectedRoute.jsx`
6. `verifyToken\(\)` - connects `Zilla Backend Availability Routes`, `Zilla Backend Booking Routes`, `Zilla Backend Payment Routes`, `Zilla Backend Service Routes`; home: `Zilla Backend App`; degree 36; score 3726.95
  source files: `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/zilla-backend/src/middleware/auth.middleware.js`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/zilla-backend/src/routes/availability.routes.js`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/zilla-backend/src/routes/booking.routes.js`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/zilla-backend/src/routes/payment.routes.js`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/zilla-backend/src/routes/service.routes.js`, `C:\\1\_PROGRAMMING\\0\_Projects\\Zilla\\Zilla\\zilla-backend\\src\\routes\\availability.routes.js`, `C:\\1\_PROGRAMMING\\0\_Projects\\Zilla\\Zilla\\zilla-backend\\src\\routes\\booking.routes.js`, `C:\\1\_PROGRAMMING\\0\_Projects\\Zilla\\Zilla\\zilla-backend\\src\\routes\\payment.routes.js`, `C:\\1\_PROGRAMMING\\0\_Projects\\Zilla\\Zilla\\zilla-backend\\src\\routes\\service.routes.js`

## God Nodes
1. `app` - 50 edges
2. `verifyToken\(\)` - 37 edges
3. `validateRequest\(\)` - 35 edges
4. `App\(\)` - 25 edges
5. `DashboardLayout\(\)` - 22 edges
6. `Card\(\)` - 18 edges
7. `Button\(\)` - 14 edges
8. `MyBookings\(\)` - 12 edges
9. `Loader\(\)` - 10 edges
10. `router` - 10 edges

## Surprising Connections
- `page /admin/AdminDashboard` --renders--> `AdminDashboard\(\)`  [EXTRACTED]
  C:\\1\_PROGRAMMING\\0\_Projects\\Zilla\\Zilla\\frontend\\src\\pages\\admin\\AdminDashboard.jsx → C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/admin/AdminDashboard.jsx  _connects across different repos/directories; bridges separate communities; peripheral node \`page /admin/AdminDashboard\` unexpectedly reaches hub \`AdminDashboard\(\)\`_
- `page /SettingsPage` --renders--> `SettingsPage\(\)`  [EXTRACTED]
  C:\\1\_PROGRAMMING\\0\_Projects\\Zilla\\Zilla\\frontend\\src\\pages\\SettingsPage.jsx → C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/SettingsPage.jsx  _connects across different repos/directories; bridges separate communities; peripheral node \`page /SettingsPage\` unexpectedly reaches hub \`SettingsPage\(\)\`_
- `page /admin/UserManagement` --renders--> `UserManagement\(\)`  [EXTRACTED]
  C:\\1\_PROGRAMMING\\0\_Projects\\Zilla\\Zilla\\frontend\\src\\pages\\admin\\UserManagement.jsx → C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/admin/UserManagement.jsx  _connects across different repos/directories; bridges separate communities; peripheral node \`page /admin/UserManagement\` unexpectedly reaches hub \`UserManagement\(\)\`_
- `page /auth/LoginPage` --renders--> `LoginPage\(\)`  [EXTRACTED]
  C:\\1\_PROGRAMMING\\0\_Projects\\Zilla\\Zilla\\frontend\\src\\pages\\auth\\LoginPage.jsx → C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/auth/LoginPage.jsx  _connects across different repos/directories; bridges separate communities; peripheral node \`page /auth/LoginPage\` unexpectedly reaches hub \`LoginPage\(\)\`_
- `page /auth/SignupPage` --renders--> `SignupPage\(\)`  [EXTRACTED]
  C:\\1\_PROGRAMMING\\0\_Projects\\Zilla\\Zilla\\frontend\\src\\pages\\auth\\SignupPage.jsx → C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/auth/SignupPage.jsx  _connects across different repos/directories; bridges separate communities; peripheral node \`page /auth/SignupPage\` unexpectedly reaches hub \`SignupPage\(\)\`_

## Semantic Anomalies
- **[HIGH] Bridge node** - App\(\) bridges Frontend App and Zilla Backend App, Frontend Auth Context, Frontend Auth Layout, Frontend Admin Dashboard, Frontend Signup Page — Handle, Frontend My Bookings, Frontend Booking Confirmation, Frontend Appointment List, Frontend Appointment Editor, Frontend Resource Editor, Frontend User Editor, Frontend Settings Page, Frontend Landing Page — Landing, Frontend App — Layout, Frontend App — Booking, Frontend App — Appointment, Frontend App — Admin, Frontend App — Settings, Frontend App — Navigate.
  _High betweenness centrality \(11825.699\) across 20 communities makes this node a likely dependency chokepoint._
- **[HIGH] Bridge node** - app bridges Zilla Backend App and Zilla Backend Auth Routes, Zilla Backend Service Routes, Zilla Backend Availability Routes, Zilla Backend Booking Routes, Zilla Backend Payment Routes.
  _High betweenness centrality \(5712.992\) across 6 communities makes this node a likely dependency chokepoint._
- **[HIGH] Bridge node** - / \(layout\) bridges Frontend App — Appointment and Frontend App, Frontend App — Settings, Frontend App — Editor, Frontend App — Meetings, Frontend App — Reporting, Frontend App — Resource, Frontend App — User.
  _High betweenness centrality \(3596.000\) across 8 communities makes this node a likely dependency chokepoint._
- **[HIGH] Cross-boundary edge** - page /admin/AdminDashboard → AdminDashboard\(\) crosses graph boundaries in an unexpected way.
  _connects across different repos/directories; bridges separate communities; peripheral node \`page /admin/AdminDashboard\` unexpectedly reaches hub \`AdminDashboard\(\)\`_
- **[HIGH] Cross-boundary edge** - page /admin/UserManagement → UserManagement\(\) crosses graph boundaries in an unexpected way.
  _connects across different repos/directories; bridges separate communities; peripheral node \`page /admin/UserManagement\` unexpectedly reaches hub \`UserManagement\(\)\`_

## Communities

### Community 0 - "Zilla Backend App"
Cohesion (entity basis within full-graph community): 0.07
Nodes (50): verifyToken\(\), app, GET /health, DELETE /api/services/:id, GET /api/availability, GET /api/availability/working-hours, GET /api/bookings/all, GET /api/bookings/my (+42 more)

### Community 1 - "Frontend Admin Dashboard"
Cohesion (entity basis within full-graph community): 0.08
Nodes (20): AdminDashboard\(\), fetch\(\), reducer\(\), getStoredUser\(\), useAuth\(\), Button\(\), Card\(\), CustomerDashboard\(\) (+12 more)

### Community 2 - "Zilla Backend Auth Routes"
Cohesion (entity basis within full-graph community): 0.22
Nodes (9): router, POST /forgot-password, POST /login, POST /logout, POST /refresh, POST /reset-password, POST /signup, POST /verify-otp (+1 more)

### Community 3 - "Zilla Backend Booking Routes"
Cohesion (entity basis within full-graph community): 0.22
Nodes (9): router, GET /all, GET /my, GET /provider, PATCH /:id/cancel, PATCH /:id/confirm, PATCH /:id/reschedule, POST / (+1 more)

### Community 4 - "Zilla Backend Booking Controller"
Cohesion (entity basis within full-graph community): 0
Nodes (8): cancelBooking\(\), confirmBooking\(\), createBooking\(\), getAllBookings\(\), getMyBookings\(\), getProviderBookings\(\), lockSlot\(\), rescheduleBooking\(\)

### Community 5 - "Zilla Backend Service Routes"
Cohesion (entity basis within full-graph community): 0.25
Nodes (8): DELETE /:id, router, GET /, GET /:id, GET /my, PATCH /:id/publish, POST /, PUT /:id

### Community 6 - "Zilla Backend Auth Controller"
Cohesion (entity basis within full-graph community): 0
Nodes (7): forgotPassword\(\), login\(\), logout\(\), refresh\(\), resetPassword\(\), signup\(\), verifyOTP\(\)

### Community 7 - "Zilla Backend Booking Service"
Cohesion (entity basis within full-graph community): 0
Nodes (7): cancelBooking\(\), confirmBooking\(\), getAllBookings\(\), getMyBookings\(\), getProviderBookings\(\), lockSlot\(\), rescheduleBooking\(\)

### Community 8 - "Zilla Backend Service Controller"
Cohesion (entity basis within full-graph community): 0
Nodes (7): create\(\), getById\(\), listMine\(\), listPublished\(\), remove\(\), togglePublish\(\), update\(\)

### Community 9 - "Frontend My Bookings"
Cohesion (entity basis within full-graph community): 0.29
Nodes (7): MyBookings\(\), fetchBookings\(\), formatDate\(\), formatTime\(\), getStatusIcon\(\), getStatusStyle\(\), handleCancel\(\)

### Community 10 - "Zilla Backend Auth Service"
Cohesion (entity basis within full-graph community): 0
Nodes (4): logout\(\), logoutByRefreshToken\(\), resetPassword\(\), verifyOTP\(\)

### Community 11 - "Zilla Backend Availability Routes"
Cohesion (entity basis within full-graph community): 0.5
Nodes (4): router, GET /, GET /working-hours, POST /working-hours

### Community 12 - "Zilla Backend Payment Routes"
Cohesion (entity basis within full-graph community): 0.5
Nodes (4): router, POST /create-order, POST /verify, POST /webhook

### Community 13 - "Zilla Backend Mailer"
Cohesion (entity basis within full-graph community): 0.5
Nodes (4): sendBookingConfirmation\(\), sendCancellationNotice\(\), sendEmail\(\), sendOTPEmail\(\)

### Community 14 - "Zilla Backend Redis"
Cohesion (entity basis within full-graph community): 0
Nodes (4): redisDel\(\), redisExists\(\), redisGet\(\), redisSetNX\(\)

### Community 15 - "Frontend App"
Cohesion (entity basis within full-graph community): 0.5
Nodes (4): App\(\), /, LandingPage\(\), ProtectedRoute\(\)

### Community 16 - "Frontend Appointment Editor"
Cohesion (entity basis within full-graph community): 0.5
Nodes (4): AppointmentEditor\(\), fetchService\(\), handleSave\(\), updateField\(\)

### Community 17 - "Zilla Backend Availability Controller"
Cohesion (entity basis within full-graph community): 0
Nodes (3): getSlots\(\), getWorkingHours\(\), setWorkingHours\(\)

### Community 18 - "Zilla Backend Availability Service"
Cohesion (entity basis within full-graph community): 0
Nodes (3): getAvailableSlots\(\), getWorkingHours\(\), setWorkingHours\(\)

### Community 19 - "Frontend Booking Wizard"
Cohesion (entity basis within full-graph community): 0.5
Nodes (4): BookingWizard\(\), fetchSlots\(\), handleBack\(\), init\(\)

### Community 20 - "Frontend App — Settings"
Cohesion (entity basis within full-graph community): 0.5
Nodes (4): / \(layout\), /settings, SettingsPage\(\), ProtectedRoute\(\)

### Community 21 - "Zilla Backend Notification Service"
Cohesion (entity basis within full-graph community): 0
Nodes (3): sendBookingConfirmation\(\), sendCancellationNotice\(\), sendOTP\(\)

### Community 22 - "Zilla Backend Overlap"
Cohesion (entity basis within full-graph community): 0
Nodes (3): countOverlapping\(\), hasOverlap\(\), intervalsOverlap\(\)

### Community 23 - "Zilla Backend Payment Controller"
Cohesion (entity basis within full-graph community): 0
Nodes (3): createOrder\(\), verifyPayment\(\), webhook\(\)

### Community 24 - "Zilla Backend Payment Service"
Cohesion (entity basis within full-graph community): 0
Nodes (3): createOrder\(\), handleWebhook\(\), verifyPayment\(\)

### Community 25 - "Frontend Question Builder"
Cohesion (entity basis within full-graph community): 0.5
Nodes (4): QuestionBuilder\(\), addQuestion\(\), removeQuestion\(\), updateQuestion\(\)

### Community 26 - "Services Axios Instance"
Cohesion (entity basis within full-graph community): 1
Nodes (1): processQueue\(\)

### Community 27 - "Frontend Appointment List"
Cohesion (entity basis within full-graph community): 0.67
Nodes (3): AppointmentList\(\), fetchAppointments\(\), handleTogglePublish\(\)

### Community 28 - "Zilla Backend Auth Service — Forgot"
Cohesion (entity basis within full-graph community): 0.67
Nodes (3): forgotPassword\(\), generateOTP\(\), signup\(\)

### Community 29 - "Frontend Auth Context"
Cohesion (entity basis within full-graph community): 0.67
Nodes (3): AuthProvider\(\), login\(\), logout\(\)

### Community 30 - "Frontend Booking Confirmation"
Cohesion (entity basis within full-graph community): 0.67
Nodes (3): BookingConfirmation\(\), page /customer/BookingConfirmation, /customer/BookingConfirmation

### Community 31 - "Frontend App — Appointment"
Cohesion (entity basis within full-graph community): 0.67
Nodes (3): / \(layout\), /organiser, AppointmentList\(\)

### Community 32 - "Frontend App — Admin"
Cohesion (entity basis within full-graph community): 0.67
Nodes (3): / \(layout\), /admin, AdminDashboard\(\)

### Community 33 - "Frontend Resource Editor"
Cohesion (entity basis within full-graph community): 0.67
Nodes (3): page /organiser/ResourceEditor, /organiser/ResourceEditor, ResourceEditor\(\)

### Community 34 - "Frontend User Editor"
Cohesion (entity basis within full-graph community): 0.67
Nodes (3): page /organiser/UserEditor, /organiser/UserEditor, UserEditor\(\)

### Community 35 - "Zilla Backend Error Middleware"
Cohesion (entity basis within full-graph community): 0.67
Nodes (3): AppError, .constructor\(\), Error

### Community 36 - "Frontend Settings Page"
Cohesion (entity basis within full-graph community): 0.67
Nodes (3): SettingsPage\(\), handlePasswordUpdate\(\), handleProfileUpdate\(\)

### Community 37 - "Zilla Backend Auth Middleware"
Cohesion (entity basis within full-graph community): 1
Nodes (1): requireRole\(\)

### Community 38 - "Zilla Backend Auth Service — Access"
Cohesion (entity basis within full-graph community): 1
Nodes (2): generateAccessToken\(\), refresh\(\)

### Community 39 - "Zilla Backend Auth Service — Generate"
Cohesion (entity basis within full-graph community): 1
Nodes (2): generateRefreshToken\(\), login\(\)

### Community 40 - "Frontend Auth Layout"
Cohesion (entity basis within full-graph community): 1
Nodes (1): AuthLayout\(\)

### Community 41 - "Zilla Backend Booking Service — Booking"
Cohesion (entity basis within full-graph community): 1
Nodes (2): createBooking\(\), generateConfirmationCode\(\)

### Community 42 - "Frontend Booking Wizard — Booking"
Cohesion (entity basis within full-graph community): 1
Nodes (2): handleNext\(\), submitBooking\(\)

### Community 43 - "Frontend Booking Wizard — Render"
Cohesion (entity basis within full-graph community): 1
Nodes (2): renderStep\(\), renderUnifiedSelection\(\)

### Community 44 - "Frontend App — Navigate"
Cohesion (entity basis within full-graph community): 1
Nodes (2): Navigate, /\*

### Community 45 - "Frontend App — Layout"
Cohesion (entity basis within full-graph community): 1
Nodes (2): / \(layout\), AuthLayout\(\)

### Community 46 - "Frontend App — Booking"
Cohesion (entity basis within full-graph community): 1
Nodes (2): / \(layout\), /booking/:serviceId

### Community 47 - "Frontend App — Admin \(2\)"
Cohesion (entity basis within full-graph community): 1
Nodes (2): /admin/users, UserManagement\(\)

### Community 48 - "Frontend App — Bookings"
Cohesion (entity basis within full-graph community): 1
Nodes (2): /bookings, MyBookings\(\)

### Community 49 - "Frontend App — Confirmation"
Cohesion (entity basis within full-graph community): 1
Nodes (2): /confirmation, BookingConfirmation\(\)

### Community 50 - "Frontend App — Dashboard"
Cohesion (entity basis within full-graph community): 1
Nodes (2): /dashboard, CustomerDashboard\(\)

### Community 51 - "Frontend App — Login"
Cohesion (entity basis within full-graph community): 1
Nodes (2): /login, LoginPage\(\)

### Community 52 - "Frontend App — Editor"
Cohesion (entity basis within full-graph community): 1
Nodes (2): /organiser/editor/:id, AppointmentEditor\(\)

### Community 53 - "Frontend App — Meetings"
Cohesion (entity basis within full-graph community): 1
Nodes (2): /organiser/meetings, Meetings\(\)

### Community 54 - "Frontend App — Reporting"
Cohesion (entity basis within full-graph community): 1
Nodes (2): /organiser/reporting, Reporting\(\)

### Community 55 - "Frontend App — Resource"
Cohesion (entity basis within full-graph community): 1
Nodes (2): /organiser/resource/:id, ResourceEditor\(\)

### Community 56 - "Frontend App — User"
Cohesion (entity basis within full-graph community): 1
Nodes (2): /organiser/user/:id, UserEditor\(\)

### Community 57 - "Frontend App — Signup"
Cohesion (entity basis within full-graph community): 1
Nodes (2): /signup, SignupPage\(\)

### Community 58 - "Frontend Admin Dashboard — Admin"
Cohesion (entity basis within full-graph community): 1
Nodes (2): page /admin/AdminDashboard, /admin/AdminDashboard

### Community 59 - "Frontend User Management"
Cohesion (entity basis within full-graph community): 1
Nodes (2): page /admin/UserManagement, /admin/UserManagement

### Community 60 - "Frontend Auth Layout — Auth"
Cohesion (entity basis within full-graph community): 1
Nodes (2): page /auth/AuthLayout, /auth/AuthLayout

### Community 61 - "Frontend Login Page"
Cohesion (entity basis within full-graph community): 1
Nodes (2): page /auth/LoginPage, /auth/LoginPage

### Community 62 - "Frontend Signup Page"
Cohesion (entity basis within full-graph community): 1
Nodes (2): page /auth/SignupPage, /auth/SignupPage

### Community 63 - "Frontend Booking Wizard — Booking \(2\)"
Cohesion (entity basis within full-graph community): 1
Nodes (2): page /customer/BookingWizard, /customer/BookingWizard

### Community 64 - "Frontend Customer Dashboard"
Cohesion (entity basis within full-graph community): 1
Nodes (2): page /customer/CustomerDashboard, /customer/CustomerDashboard

### Community 65 - "Frontend My Bookings — Bookings"
Cohesion (entity basis within full-graph community): 1
Nodes (2): page /customer/MyBookings, /customer/MyBookings

### Community 66 - "Frontend Landing Page"
Cohesion (entity basis within full-graph community): 1
Nodes (2): page /LandingPage, /LandingPage

### Community 67 - "Frontend Appointment Editor — Appointment"
Cohesion (entity basis within full-graph community): 1
Nodes (2): page /organiser/AppointmentEditor, /organiser/AppointmentEditor

### Community 68 - "Frontend Appointment List — Appointment"
Cohesion (entity basis within full-graph community): 1
Nodes (2): page /organiser/AppointmentList, /organiser/AppointmentList

### Community 69 - "Frontend Meetings"
Cohesion (entity basis within full-graph community): 1
Nodes (2): page /organiser/Meetings, /organiser/Meetings

### Community 70 - "Frontend Reporting"
Cohesion (entity basis within full-graph community): 1
Nodes (2): page /organiser/Reporting, /organiser/Reporting

### Community 71 - "Frontend Settings Page — Page"
Cohesion (entity basis within full-graph community): 1
Nodes (2): page /SettingsPage, /SettingsPage

### Community 72 - "Scratch Check Pg"
Cohesion (entity basis within full-graph community): 1
Nodes (1): checkPostgres\(\)

### Community 73 - "Zilla Backend Db"
Cohesion (entity basis within full-graph community): 1
Nodes (1): query\(\)

### Community 74 - "Zilla Backend Error Middleware — Error"
Cohesion (entity basis within full-graph community): 1
Nodes (1): errorHandler\(\)

### Community 75 - "Scratch Init Db"
Cohesion (entity basis within full-graph community): 1
Nodes (1): initDb\(\)

### Community 76 - "Frontend Landing Page — Landing"
Cohesion (entity basis within full-graph community): 1
Nodes (1): LandingPage\(\)

### Community 77 - "Zilla Backend Server"
Cohesion (entity basis within full-graph community): 1
Nodes (1): shutdown\(\)

### Community 78 - "Frontend Signup Page — Handle"
Cohesion (entity basis within full-graph community): 1
Nodes (2): SignupPage\(\), handleSubmit\(\)

### Community 79 - "Zilla Backend Slot Generator"
Cohesion (entity basis within full-graph community): 1
Nodes (1): generateSlots\(\)

### Community 80 - "12676946 3840 2160 30fps Mp4"
Cohesion (entity basis within full-graph community): n/a
Nodes (0): 

### Community 81 - "Card1 Png"
Cohesion (entity basis within full-graph community): n/a
Nodes (0): 

### Community 82 - "Card2 Png"
Cohesion (entity basis within full-graph community): n/a
Nodes (0): 

### Community 83 - "Env Js"
Cohesion (entity basis within full-graph community): n/a
Nodes (0): 

### Community 84 - "Eslint Config Js"
Cohesion (entity basis within full-graph community): n/a
Nodes (0): 

### Community 85 - "Favicon SVG"
Cohesion (entity basis within full-graph community): n/a
Nodes (0): 

### Community 86 - "Hero Png"
Cohesion (entity basis within full-graph community): n/a
Nodes (0): 

### Community 87 - "Icons SVG"
Cohesion (entity basis within full-graph community): n/a
Nodes (0): 

### Community 88 - "Postcss Config Js"
Cohesion (entity basis within full-graph community): n/a
Nodes (0): 

### Community 89 - "Rate Limit Middleware Js"
Cohesion (entity basis within full-graph community): n/a
Nodes (0): 

### Community 90 - "Tailwind Config Js"
Cohesion (entity basis within full-graph community): n/a
Nodes (0): 

### Community 91 - "Vite SVG"
Cohesion (entity basis within full-graph community): n/a
Nodes (0): 

### Community 92 - "Zilla Logo Png"
Cohesion (entity basis within full-graph community): n/a
Nodes (0): 

## Knowledge Gaps
- **128 weakly connected node(s):** `AdminDashboard\(\)`, `Button\(\)`, `ErrorMessage\(\)`, `Input\(\)`, `Loader\(\)` (+123 more)
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
- **Thin community `Frontend Booking Wizard — Render`** (2 nodes): `renderStep\(\)`, `renderUnifiedSelection\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend App — Navigate`** (2 nodes): `Navigate`, `/\*`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend App — Layout`** (2 nodes): `/ \(layout\)`, `AuthLayout\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend App — Booking`** (2 nodes): `/ \(layout\)`, `/booking/:serviceId`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend App — Admin \(2\)`** (2 nodes): `/admin/users`, `UserManagement\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend App — Bookings`** (2 nodes): `/bookings`, `MyBookings\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend App — Confirmation`** (2 nodes): `/confirmation`, `BookingConfirmation\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend App — Dashboard`** (2 nodes): `/dashboard`, `CustomerDashboard\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend App — Login`** (2 nodes): `/login`, `LoginPage\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend App — Editor`** (2 nodes): `/organiser/editor/:id`, `AppointmentEditor\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend App — Meetings`** (2 nodes): `/organiser/meetings`, `Meetings\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend App — Reporting`** (2 nodes): `/organiser/reporting`, `Reporting\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend App — Resource`** (2 nodes): `/organiser/resource/:id`, `ResourceEditor\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend App — User`** (2 nodes): `/organiser/user/:id`, `UserEditor\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend App — Signup`** (2 nodes): `/signup`, `SignupPage\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend Admin Dashboard — Admin`** (2 nodes): `page /admin/AdminDashboard`, `/admin/AdminDashboard`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend User Management`** (2 nodes): `page /admin/UserManagement`, `/admin/UserManagement`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend Auth Layout — Auth`** (2 nodes): `page /auth/AuthLayout`, `/auth/AuthLayout`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend Login Page`** (2 nodes): `page /auth/LoginPage`, `/auth/LoginPage`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend Signup Page`** (2 nodes): `page /auth/SignupPage`, `/auth/SignupPage`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend Booking Wizard — Booking \(2\)`** (2 nodes): `page /customer/BookingWizard`, `/customer/BookingWizard`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend Customer Dashboard`** (2 nodes): `page /customer/CustomerDashboard`, `/customer/CustomerDashboard`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend My Bookings — Bookings`** (2 nodes): `page /customer/MyBookings`, `/customer/MyBookings`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend Landing Page`** (2 nodes): `page /LandingPage`, `/LandingPage`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend Appointment Editor — Appointment`** (2 nodes): `page /organiser/AppointmentEditor`, `/organiser/AppointmentEditor`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend Appointment List — Appointment`** (2 nodes): `page /organiser/AppointmentList`, `/organiser/AppointmentList`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend Meetings`** (2 nodes): `page /organiser/Meetings`, `/organiser/Meetings`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend Reporting`** (2 nodes): `page /organiser/Reporting`, `/organiser/Reporting`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend Settings Page — Page`** (2 nodes): `page /SettingsPage`, `/SettingsPage`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Scratch Check Pg`** (2 nodes): `check\_pg.js`, `checkPostgres\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Zilla Backend Db`** (2 nodes): `db.js`, `query\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Zilla Backend Error Middleware — Error`** (2 nodes): `error.middleware.js`, `errorHandler\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Scratch Init Db`** (2 nodes): `init\_db.js`, `initDb\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend Landing Page — Landing`** (2 nodes): `LandingPage.jsx`, `LandingPage\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Zilla Backend Server`** (2 nodes): `server.js`, `shutdown\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend Signup Page — Handle`** (2 nodes): `SignupPage\(\)`, `handleSubmit\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Zilla Backend Slot Generator`** (2 nodes): `slotGenerator.js`, `generateSlots\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `12676946 3840 2160 30fps Mp4`** (1 nodes): `12676946\_3840\_2160\_30fps.mp4`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Card1 Png`** (1 nodes): `card1.png`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Card2 Png`** (1 nodes): `card2.png`
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
- **Thin community `Zilla Logo Png`** (1 nodes): `zilla\_logo.png`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does \`App\(\)\` connect \`Frontend App\` to \`Zilla Backend App\`, \`Frontend Auth Context\`, \`Frontend Auth Layout\`, \`Frontend Admin Dashboard\`, \`Frontend Signup Page — Handle\`, \`Frontend My Bookings\`, \`Frontend Booking Confirmation\`, \`Frontend Appointment List\`, \`Frontend Appointment Editor\`, \`Frontend Resource Editor\`, \`Frontend User Editor\`, \`Frontend Settings Page\`, \`Frontend Landing Page — Landing\`, \`Frontend App — Layout\`, \`Frontend App — Booking\`, \`Frontend App — Appointment\`, \`Frontend App — Admin\`, \`Frontend App — Settings\`, \`Frontend App — Navigate\`?**
  _High betweenness centrality \(11825.699\) - this node is a cross-community bridge._
- **Why does \`app\` connect \`Zilla Backend App\` to \`Zilla Backend Auth Routes\`, \`Zilla Backend Service Routes\`, \`Zilla Backend Availability Routes\`, \`Zilla Backend Booking Routes\`, \`Zilla Backend Payment Routes\`?**
  _High betweenness centrality \(5712.992\) - this node is a cross-community bridge._
- **Why does \`verifyToken\(\)\` connect \`Zilla Backend App\` to \`Zilla Backend Auth Middleware\`, \`Zilla Backend Availability Routes\`, \`Zilla Backend Booking Routes\`, \`Zilla Backend Payment Routes\`, \`Zilla Backend Service Routes\`?**
  _High betweenness centrality \(3650.949\) - this node is a cross-community bridge._
- **What connects \`AdminDashboard\(\)\`, \`Button\(\)\`, \`ErrorMessage\(\)\` to the rest of the system?**
  _128 weakly-connected nodes found - possible documentation gaps or missing edges._
