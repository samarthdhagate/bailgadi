# Graph Report - C:\\1\_PROGRAMMING\\0\_Projects\\Zilla\\Zilla  (2026-05-02)

## Corpus Check
- Corpus is ~31,387 words - fits in a single context window. You may not need a graph.

## Summary
- 472 nodes · 853 edges · 130 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Structure Signals
- Entity graph basis: 371 non-file, non-concept node(s)
- Weakly connected components: 67
- Singleton components: 51
- Isolated nodes: 51
- Largest component: 134 node(s) (36% of the entity graph basis)
- Low-cohesion communities: 2
- Largest low-cohesion community: 42 node(s) (cohesion 0.09)

## Workspace Bridges
1. `App\(\)` - connects `Frontend App`, `Frontend App — Admin`, `Frontend App — Appointment`, `Frontend App — Dashboard`, `Frontend App — Landing`, `Frontend App — Layout`, `Frontend App — Navigate`, `Frontend Appointment Editor`, `Frontend Appointment List`, `Frontend Auth Context`, `Frontend Auth Layout`, `Frontend Booking Confirmation`, `Frontend Booking Wizard`, `Frontend Chatbot Frame`, `Frontend Landing Page — Landing`, `Frontend Login Page`, `Frontend My Bookings`, `Frontend Signup Page`; home: `Frontend App — App`; degree 20; score 15389.68
  source files: `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/App.jsx`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/components/ChatWidget.jsx`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/context/AuthContext.jsx`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/auth/AuthLayout.jsx`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/auth/GoogleCallback.jsx`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/auth/LoginPage.jsx`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/auth/SignupPage.jsx`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/customer/BookingConfirmation.jsx`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/customer/BookingWizard.jsx`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/customer/CustomerDashboard.jsx`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/customer/MyBookings.jsx`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/LandingPage.jsx`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/organiser/AppointmentEditor.jsx`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/organiser/AppointmentList.jsx`
2. `app` - connects `Zilla Backend Ai Routes`, `Zilla Backend Auth Routes`, `Zilla Backend Availability Routes`, `Zilla Backend Booking Routes`, `Zilla Backend Payment Routes`, `Zilla Backend Resource Routes`, `Zilla Backend Service Routes`; home: `Zilla Backend App`; degree 57; score 9063.59
  source files: `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/zilla-backend/src/app.js`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/zilla-backend/src/routes/ai.routes.js`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/zilla-backend/src/routes/auth.routes.js`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/zilla-backend/src/routes/availability.routes.js`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/zilla-backend/src/routes/booking.routes.js`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/zilla-backend/src/routes/payment.routes.js`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/zilla-backend/src/routes/resource.routes.js`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/zilla-backend/src/routes/service.routes.js`, `C:\\1\_PROGRAMMING\\0\_Projects\\Zilla\\Zilla\\zilla-backend\\src\\routes\\ai.routes.js`, `C:\\1\_PROGRAMMING\\0\_Projects\\Zilla\\Zilla\\zilla-backend\\src\\routes\\auth.routes.js`, `C:\\1\_PROGRAMMING\\0\_Projects\\Zilla\\Zilla\\zilla-backend\\src\\routes\\availability.routes.js`, `C:\\1\_PROGRAMMING\\0\_Projects\\Zilla\\Zilla\\zilla-backend\\src\\routes\\booking.routes.js`, `C:\\1\_PROGRAMMING\\0\_Projects\\Zilla\\Zilla\\zilla-backend\\src\\routes\\payment.routes.js`, `C:\\1\_PROGRAMMING\\0\_Projects\\Zilla\\Zilla\\zilla-backend\\src\\routes\\resource.routes.js`, `C:\\1\_PROGRAMMING\\0\_Projects\\Zilla\\Zilla\\zilla-backend\\src\\routes\\service.routes.js`
3. `/ \(layout\)` - connects `Frontend App`, `Frontend App — App`, `Frontend App — Editor`, `Frontend App — Meetings`, `Frontend App — Reporting`, `Frontend App — Resource`, `Frontend App — User`; home: `Frontend App — Appointment`; degree 8; score 4359.75
  source files: `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/App.jsx`, `C:\\1\_PROGRAMMING\\0\_Projects\\Zilla\\Zilla\\frontend\\src\\routes\\ProtectedRoute.jsx`
4. `Button\(\)` - connects `Frontend Appointment Editor`, `Frontend Booking Confirmation`, `Frontend Booking Wizard`, `Frontend Login Page`, `Frontend Question Builder`, `Frontend Signup Page`; home: `Frontend Appointment List`; degree 8; score 1151.7
  source files: `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/components/Button.jsx`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/components/QuestionBuilder.jsx`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/auth/LoginPage.jsx`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/auth/SignupPage.jsx`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/customer/BookingConfirmation.jsx`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/customer/BookingWizard.jsx`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/customer/CustomerDashboard.jsx`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/organiser/AppointmentEditor.jsx`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/organiser/AppointmentList.jsx`
5. `verifyToken\(\)` - connects `Zilla Backend Ai Routes`, `Zilla Backend Availability Routes`, `Zilla Backend Booking Routes`, `Zilla Backend Payment Routes`, `Zilla Backend Service Routes`; home: `Zilla Backend App`; degree 36; score 4315.64
  source files: `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/zilla-backend/src/middleware/auth.middleware.js`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/zilla-backend/src/routes/ai.routes.js`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/zilla-backend/src/routes/availability.routes.js`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/zilla-backend/src/routes/booking.routes.js`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/zilla-backend/src/routes/payment.routes.js`, `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/zilla-backend/src/routes/service.routes.js`, `C:\\1\_PROGRAMMING\\0\_Projects\\Zilla\\Zilla\\zilla-backend\\src\\routes\\ai.routes.js`, `C:\\1\_PROGRAMMING\\0\_Projects\\Zilla\\Zilla\\zilla-backend\\src\\routes\\availability.routes.js`, `C:\\1\_PROGRAMMING\\0\_Projects\\Zilla\\Zilla\\zilla-backend\\src\\routes\\booking.routes.js`, `C:\\1\_PROGRAMMING\\0\_Projects\\Zilla\\Zilla\\zilla-backend\\src\\routes\\payment.routes.js`, `C:\\1\_PROGRAMMING\\0\_Projects\\Zilla\\Zilla\\zilla-backend\\src\\routes\\service.routes.js`
6. `/ \(layout\)` - connects `Frontend App`, `Frontend App — App`, `Frontend App — Booking`, `Frontend App — Bookings`, `Frontend App — Confirmation`; home: `Frontend App — Dashboard`; degree 6; score 2953.75
  source files: `C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/App.jsx`, `C:\\1\_PROGRAMMING\\0\_Projects\\Zilla\\Zilla\\frontend\\src\\routes\\ProtectedRoute.jsx`

## God Nodes
1. `app` - 58 edges
2. `verifyToken\(\)` - 37 edges
3. `validateRequest\(\)` - 35 edges
4. `App\(\)` - 22 edges
5. `Button\(\)` - 18 edges
6. `AppointmentEditor\(\)` - 16 edges
7. `BookingWizard\(\)` - 14 edges
8. `MyBookings\(\)` - 13 edges
9. `router` - 13 edges
10. `AppointmentList\(\)` - 12 edges

## Surprising Connections
- `page /SettingsPage` --renders--> `SettingsPage\(\)`  [EXTRACTED]
  C:\\1\_PROGRAMMING\\0\_Projects\\Zilla\\Zilla\\frontend\\src\\pages\\SettingsPage.jsx → C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/SettingsPage.jsx  _connects across different repos/directories; bridges separate communities; peripheral node \`page /SettingsPage\` unexpectedly reaches hub \`SettingsPage\(\)\`_
- `page /auth/GoogleCallback` --renders--> `GoogleCallback\(\)`  [EXTRACTED]
  C:\\1\_PROGRAMMING\\0\_Projects\\Zilla\\Zilla\\frontend\\src\\pages\\auth\\GoogleCallback.jsx → C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/auth/GoogleCallback.jsx  _connects across different repos/directories; bridges separate communities; peripheral node \`page /auth/GoogleCallback\` unexpectedly reaches hub \`GoogleCallback\(\)\`_
- `page /auth/LoginPage` --renders--> `LoginPage\(\)`  [EXTRACTED]
  C:\\1\_PROGRAMMING\\0\_Projects\\Zilla\\Zilla\\frontend\\src\\pages\\auth\\LoginPage.jsx → C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/auth/LoginPage.jsx  _connects across different repos/directories; bridges separate communities; peripheral node \`page /auth/LoginPage\` unexpectedly reaches hub \`LoginPage\(\)\`_
- `page /auth/SignupPage` --renders--> `SignupPage\(\)`  [EXTRACTED]
  C:\\1\_PROGRAMMING\\0\_Projects\\Zilla\\Zilla\\frontend\\src\\pages\\auth\\SignupPage.jsx → C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/auth/SignupPage.jsx  _connects across different repos/directories; bridges separate communities; peripheral node \`page /auth/SignupPage\` unexpectedly reaches hub \`SignupPage\(\)\`_
- `page /customer/BookingConfirmation` --renders--> `BookingConfirmation\(\)`  [EXTRACTED]
  C:\\1\_PROGRAMMING\\0\_Projects\\Zilla\\Zilla\\frontend\\src\\pages\\customer\\BookingConfirmation.jsx → C:/1\_PROGRAMMING/0\_Projects/Zilla/Zilla/frontend/src/pages/customer/BookingConfirmation.jsx  _connects across different repos/directories; bridges separate communities; peripheral node \`page /customer/BookingConfirmation\` unexpectedly reaches hub \`BookingConfirmation\(\)\`_

## Semantic Anomalies
- **[HIGH] Bridge node** - App\(\) bridges Frontend App — App and Zilla Backend App, Frontend Auth Context, Frontend Auth Layout, Frontend Login Page, Frontend Signup Page, Frontend Appointment List, Frontend My Bookings, Frontend Booking Wizard, Frontend Booking Confirmation, Frontend Appointment Editor, Frontend Landing Page — Landing, Frontend Chatbot Frame, Frontend App — Layout, Frontend App — Dashboard, Frontend App — Appointment, Frontend App — Admin, Frontend App, Frontend App — Landing, Frontend App — Navigate.
  _High betweenness centrality \(15189.682\) across 20 communities makes this node a likely dependency chokepoint._
- **[HIGH] Bridge node** - app bridges Zilla Backend App and Zilla Backend Auth Routes, Zilla Backend Service Routes, Zilla Backend Availability Routes, Zilla Backend Booking Routes, Zilla Backend Payment Routes, Zilla Backend Resource Routes, Zilla Backend Ai Routes.
  _High betweenness centrality \(8936.592\) across 8 communities makes this node a likely dependency chokepoint._
- **[HIGH] Bridge node** - / \(layout\) bridges Frontend App — Appointment and Frontend App — App, Frontend App, Frontend App — Editor, Frontend App — Meetings, Frontend App — Reporting, Frontend App — Resource, Frontend App — User.
  _High betweenness centrality \(4281.750\) across 8 communities makes this node a likely dependency chokepoint._
- **[HIGH] Low-cohesion community** - Zilla Backend App is weakly connected for its size.
  _Cohesion score 0.09 across 42 nodes suggests this community may mix unrelated responsibilities._
- **[HIGH] Cross-boundary edge** - page /auth/GoogleCallback → GoogleCallback\(\) crosses graph boundaries in an unexpected way.
  _connects across different repos/directories; bridges separate communities; peripheral node \`page /auth/GoogleCallback\` unexpectedly reaches hub \`GoogleCallback\(\)\`_

## Communities

### Community 0 - "Zilla Backend App"
Cohesion (entity basis within full-graph community): 0.06
Nodes (56): verifyToken\(\), app, GET /health, DELETE /api/services/:id, GET /api/auth/google, GET /api/auth/google/callback, GET /api/availability, GET /api/availability/working-hours (+48 more)

### Community 1 - "Frontend Appointment List"
Cohesion (entity basis within full-graph community): 0.1
Nodes (19): reducer\(\), AppointmentList\(\), fetchAppointments\(\), handleDelete\(\), handleTogglePublish\(\), getStoredUser\(\), useAuth\(\), processQueue\(\) (+11 more)

### Community 2 - "Zilla Backend Auth Routes"
Cohesion (entity basis within full-graph community): 0.17
Nodes (12): router, GET /google, GET /google/callback, POST /forgot-password, POST /google, POST /login, POST /logout, POST /refresh (+4 more)

### Community 3 - "Frontend Appointment Editor"
Cohesion (entity basis within full-graph community): 0.31
Nodes (10): AppointmentEditor\(\), addAvailabilityLine\(\), addNewUser\(\), fetchService\(\), handleImageUpload\(\), handleSave\(\), removeAvailabilityLine\(\), toggleUserSelection\(\) (+2 more)

### Community 4 - "Zilla Backend Booking Routes"
Cohesion (entity basis within full-graph community): 0.22
Nodes (9): router, GET /all, GET /my, GET /provider, PATCH /:id/cancel, PATCH /:id/confirm, PATCH /:id/reschedule, POST / (+1 more)

### Community 5 - "Zilla Backend Auth Controller"
Cohesion (entity basis within full-graph community): 0
Nodes (8): forgotPassword\(\), initGoogleAuth\(\), login\(\), logout\(\), refresh\(\), resetPassword\(\), signup\(\), verifyOTP\(\)

### Community 6 - "Zilla Backend Booking Controller"
Cohesion (entity basis within full-graph community): 0
Nodes (8): cancelBooking\(\), confirmBooking\(\), createBooking\(\), getAllBookings\(\), getMyBookings\(\), getProviderBookings\(\), lockSlot\(\), rescheduleBooking\(\)

### Community 7 - "Zilla Backend Service Routes"
Cohesion (entity basis within full-graph community): 0.25
Nodes (8): DELETE /:id, router, GET /, GET /:id, GET /my, PATCH /:id/publish, POST /, PUT /:id

### Community 8 - "Zilla Backend Service Controller"
Cohesion (entity basis within full-graph community): 0
Nodes (7): create\(\), getById\(\), listMine\(\), listPublished\(\), remove\(\), togglePublish\(\), update\(\)

### Community 9 - "Frontend Question Builder"
Cohesion (entity basis within full-graph community): 0.29
Nodes (7): QuestionBuilder\(\), addOptionField\(\), addQuestion\(\), handleOptionChange\(\), removeOptionField\(\), removeQuestion\(\), updateQuestion\(\)

### Community 10 - "Zilla Backend Redis"
Cohesion (entity basis within full-graph community): 0.33
Nodes (6): isRedisAvailable\(\), redisDel\(\), redisExists\(\), redisGet\(\), redisMGet\(\), redisSetNX\(\)

### Community 11 - "Zilla Backend Booking Service"
Cohesion (entity basis within full-graph community): 0
Nodes (5): cancelBooking\(\), confirmBooking\(\), getAllBookings\(\), getMyBookings\(\), getProviderBookings\(\)

### Community 12 - "Frontend Booking Wizard"
Cohesion (entity basis within full-graph community): 0.47
Nodes (6): BookingWizard\(\), fetchSlots\(\), init\(\), renderCalendar\(\), renderStep\(\), renderUnifiedSelection\(\)

### Community 13 - "Frontend Chatbot Frame"
Cohesion (entity basis within full-graph community): 0.5
Nodes (4): ChatbotFrame\(\), handleSend\(\), scrollToBottom\(\), ChatWidget\(\)

### Community 14 - "Zilla Backend Auth Service"
Cohesion (entity basis within full-graph community): 0
Nodes (4): logout\(\), logoutByRefreshToken\(\), resetPassword\(\), verifyOTP\(\)

### Community 15 - "Zilla Backend Availability Routes"
Cohesion (entity basis within full-graph community): 0.5
Nodes (4): router, GET /, GET /working-hours, POST /working-hours

### Community 16 - "Frontend Login Page"
Cohesion (entity basis within full-graph community): 0.4
Nodes (5): LoginPage\(\), handleDemoAccess\(\), handleGoogleLogin\(\), handleGoogleSuccess\(\), handleSubmit\(\)

### Community 17 - "Zilla Backend Mailer"
Cohesion (entity basis within full-graph community): 0.5
Nodes (4): sendBookingConfirmation\(\), sendCancellationNotice\(\), sendEmail\(\), sendOTPEmail\(\)

### Community 18 - "Frontend My Bookings"
Cohesion (entity basis within full-graph community): 0.4
Nodes (5): MyBookings\(\), formatDate\(\), formatTime\(\), getStatusIcon\(\), getStatusStyle\(\)

### Community 19 - "Zilla Backend Availability Controller"
Cohesion (entity basis within full-graph community): 0
Nodes (3): getSlots\(\), getWorkingHours\(\), setWorkingHours\(\)

### Community 20 - "Zilla Backend Availability Service"
Cohesion (entity basis within full-graph community): 0
Nodes (3): getAvailableSlots\(\), getWorkingHours\(\), setWorkingHours\(\)

### Community 21 - "Frontend App"
Cohesion (entity basis within full-graph community): 0.5
Nodes (4): / \(layout\), /settings, SettingsPage\(\), ProtectedRoute\(\)

### Community 22 - "Zilla Backend Payment Routes"
Cohesion (entity basis within full-graph community): 0.67
Nodes (3): router, POST /verify, POST /webhook

### Community 23 - "Zilla Backend Notification Service"
Cohesion (entity basis within full-graph community): 0
Nodes (3): sendBookingConfirmation\(\), sendCancellationNotice\(\), sendOTP\(\)

### Community 24 - "Zilla Backend Overlap"
Cohesion (entity basis within full-graph community): 0
Nodes (3): countOverlapping\(\), hasOverlap\(\), intervalsOverlap\(\)

### Community 25 - "Zilla Backend Payment Service"
Cohesion (entity basis within full-graph community): 0
Nodes (3): createRazorpayOrder\(\), verifyRazorpaySignature\(\), verifyWebhookSignature\(\)

### Community 26 - "Frontend Settings Page"
Cohesion (entity basis within full-graph community): 0.67
Nodes (3): SettingsPage\(\), handlePasswordUpdate\(\), handleProfileUpdate\(\)

### Community 27 - "Frontend Signup Page"
Cohesion (entity basis within full-graph community): 0.5
Nodes (4): SignupPage\(\), handleGoogleLogin\(\), handleGoogleSuccess\(\), handleSubmit\(\)

### Community 28 - "Frontend Admin Dashboard"
Cohesion (entity basis within full-graph community): 1
Nodes (2): AdminDashboard\(\), fetch\(\)

### Community 29 - "Zilla Backend Ai Routes"
Cohesion (entity basis within full-graph community): 1
Nodes (2): router, POST /chat

### Community 30 - "Zilla Backend Auth Service — Forgot"
Cohesion (entity basis within full-graph community): 0.67
Nodes (3): forgotPassword\(\), generateOTP\(\), signup\(\)

### Community 31 - "Zilla Backend Auth Service — Access"
Cohesion (entity basis within full-graph community): 0.67
Nodes (3): generateAccessToken\(\), googleLogin\(\), refresh\(\)

### Community 32 - "Frontend Auth Context"
Cohesion (entity basis within full-graph community): 0.67
Nodes (3): AuthProvider\(\), login\(\), logout\(\)

### Community 33 - "Zilla Backend Booking Service — Booking"
Cohesion (entity basis within full-graph community): 0.67
Nodes (3): confirmBookingByOrderId\(\), generateConfirmationCode\(\), verifyAndConfirmBooking\(\)

### Community 34 - "Zilla Backend Booking Service — Booking \(2\)"
Cohesion (entity basis within full-graph community): 0.67
Nodes (3): createBooking\(\), lockSlot\(\), rescheduleBooking\(\)

### Community 35 - "Frontend Booking Confirmation"
Cohesion (entity basis within full-graph community): 0.67
Nodes (3): BookingConfirmation\(\), generateGoogleCalendarUrl\(\), formatForGoogle\(\)

### Community 36 - "Frontend App — Dashboard"
Cohesion (entity basis within full-graph community): 0.67
Nodes (3): / \(layout\), /dashboard, CustomerDashboard\(\)

### Community 37 - "Frontend App — Appointment"
Cohesion (entity basis within full-graph community): 0.67
Nodes (3): / \(layout\), /organiser, AppointmentList\(\)

### Community 38 - "Frontend App — Admin"
Cohesion (entity basis within full-graph community): 0.67
Nodes (3): / \(layout\), /admin, AdminDashboard\(\)

### Community 39 - "Frontend Meetings"
Cohesion (entity basis within full-graph community): 0.67
Nodes (3): page /organiser/Meetings, /organiser/Meetings, Meetings\(\)

### Community 40 - "Zilla Backend Resource Routes"
Cohesion (entity basis within full-graph community): 1
Nodes (2): router, GET /:facility\_id

### Community 41 - "Zilla Backend Error Middleware"
Cohesion (entity basis within full-graph community): 0.67
Nodes (3): AppError, .constructor\(\), Error

### Community 42 - "Zilla Backend Google Auth Service"
Cohesion (entity basis within full-graph community): 0
Nodes (2): getGoogleAuthUrl\(\), getGoogleUserInfo\(\)

### Community 43 - "Zilla Backend Maintenance Service"
Cohesion (entity basis within full-graph community): 1
Nodes (2): runReconciliation\(\), startMaintenanceJobs\(\)

### Community 44 - "Zilla Backend Payment Controller"
Cohesion (entity basis within full-graph community): 0
Nodes (2): handleWebhook\(\), verifyPaymentAndConfirm\(\)

### Community 45 - "Frontend Top Calendar"
Cohesion (entity basis within full-graph community): 1
Nodes (2): TopCalendar\(\), scroll\(\)

### Community 46 - "Frontend Admin"
Cohesion (entity basis within full-graph community): n/a
Nodes (0): 

### Community 47 - "Zilla Backend Ai Controller"
Cohesion (entity basis within full-graph community): 1
Nodes (1): chat\(\)

### Community 48 - "Frontend App — App"
Cohesion (entity basis within full-graph community): 1
Nodes (1): App\(\)

### Community 49 - "Zilla Backend Auth Controller — Google"
Cohesion (entity basis within full-graph community): 1
Nodes (2): googleCallback\(\), googleLogin\(\)

### Community 50 - "Zilla Backend Auth Middleware"
Cohesion (entity basis within full-graph community): 1
Nodes (1): requireRole\(\)

### Community 51 - "Zilla Backend Auth Service — Generate"
Cohesion (entity basis within full-graph community): 1
Nodes (2): generateRefreshToken\(\), login\(\)

### Community 52 - "Frontend Auth Layout"
Cohesion (entity basis within full-graph community): 1
Nodes (1): AuthLayout\(\)

### Community 53 - "Frontend Booking Wizard — Booking"
Cohesion (entity basis within full-graph community): 1
Nodes (2): handleNext\(\), submitBooking\(\)

### Community 54 - "Frontend App — Navigate"
Cohesion (entity basis within full-graph community): 1
Nodes (2): Navigate, /\*

### Community 55 - "Frontend App — Layout"
Cohesion (entity basis within full-graph community): 1
Nodes (2): / \(layout\), AuthLayout\(\)

### Community 56 - "Frontend App — Landing"
Cohesion (entity basis within full-graph community): 1
Nodes (2): /, LandingPage\(\)

### Community 57 - "Frontend App — Admin \(2\)"
Cohesion (entity basis within full-graph community): 1
Nodes (2): /admin/users, UserManagement\(\)

### Community 58 - "Frontend App — Callback"
Cohesion (entity basis within full-graph community): 1
Nodes (2): /auth/callback, GoogleCallback\(\)

### Community 59 - "Frontend App — Booking"
Cohesion (entity basis within full-graph community): 1
Nodes (2): /booking/:serviceId, BookingWizard\(\)

### Community 60 - "Frontend App — Bookings"
Cohesion (entity basis within full-graph community): 1
Nodes (2): /bookings, MyBookings\(\)

### Community 61 - "Frontend App — Confirmation"
Cohesion (entity basis within full-graph community): 1
Nodes (2): /confirmation, BookingConfirmation\(\)

### Community 62 - "Frontend App — Login"
Cohesion (entity basis within full-graph community): 1
Nodes (2): /login, LoginPage\(\)

### Community 63 - "Frontend App — Editor"
Cohesion (entity basis within full-graph community): 1
Nodes (2): /organiser/editor/:id, AppointmentEditor\(\)

### Community 64 - "Frontend App — Meetings"
Cohesion (entity basis within full-graph community): 1
Nodes (2): /organiser/meetings, Meetings\(\)

### Community 65 - "Frontend App — Reporting"
Cohesion (entity basis within full-graph community): 1
Nodes (2): /organiser/reporting, Reporting\(\)

### Community 66 - "Frontend App — Resource"
Cohesion (entity basis within full-graph community): 1
Nodes (2): /organiser/resource/:id, ResourceEditor\(\)

### Community 67 - "Frontend App — User"
Cohesion (entity basis within full-graph community): 1
Nodes (2): /organiser/user/:id, UserEditor\(\)

### Community 68 - "Frontend App — Signup"
Cohesion (entity basis within full-graph community): 1
Nodes (2): /signup, SignupPage\(\)

### Community 69 - "Frontend Admin Dashboard — Admin"
Cohesion (entity basis within full-graph community): 1
Nodes (2): page /admin/AdminDashboard, /admin/AdminDashboard

### Community 70 - "Frontend User Management"
Cohesion (entity basis within full-graph community): 1
Nodes (2): page /admin/UserManagement, /admin/UserManagement

### Community 71 - "Frontend Auth Layout — Auth"
Cohesion (entity basis within full-graph community): 1
Nodes (2): page /auth/AuthLayout, /auth/AuthLayout

### Community 72 - "Frontend Google Callback"
Cohesion (entity basis within full-graph community): 1
Nodes (2): page /auth/GoogleCallback, /auth/GoogleCallback

### Community 73 - "Frontend Login Page — Page"
Cohesion (entity basis within full-graph community): 1
Nodes (2): page /auth/LoginPage, /auth/LoginPage

### Community 74 - "Frontend Signup Page — Page"
Cohesion (entity basis within full-graph community): 1
Nodes (2): page /auth/SignupPage, /auth/SignupPage

### Community 75 - "Frontend Booking Confirmation — Booking"
Cohesion (entity basis within full-graph community): 1
Nodes (2): page /customer/BookingConfirmation, /customer/BookingConfirmation

### Community 76 - "Frontend Booking Wizard — Booking \(2\)"
Cohesion (entity basis within full-graph community): 1
Nodes (2): page /customer/BookingWizard, /customer/BookingWizard

### Community 77 - "Frontend Customer Dashboard"
Cohesion (entity basis within full-graph community): 1
Nodes (2): page /customer/CustomerDashboard, /customer/CustomerDashboard

### Community 78 - "Frontend My Bookings — Bookings"
Cohesion (entity basis within full-graph community): 1
Nodes (2): page /customer/MyBookings, /customer/MyBookings

### Community 79 - "Frontend Landing Page"
Cohesion (entity basis within full-graph community): 1
Nodes (2): page /LandingPage, /LandingPage

### Community 80 - "Frontend Appointment Editor — Appointment"
Cohesion (entity basis within full-graph community): 1
Nodes (2): page /organiser/AppointmentEditor, /organiser/AppointmentEditor

### Community 81 - "Frontend Appointment List — Appointment"
Cohesion (entity basis within full-graph community): 1
Nodes (2): page /organiser/AppointmentList, /organiser/AppointmentList

### Community 82 - "Frontend Reporting"
Cohesion (entity basis within full-graph community): 1
Nodes (2): page /organiser/Reporting, /organiser/Reporting

### Community 83 - "Frontend Resource Editor"
Cohesion (entity basis within full-graph community): 1
Nodes (2): page /organiser/ResourceEditor, /organiser/ResourceEditor

### Community 84 - "Frontend User Editor"
Cohesion (entity basis within full-graph community): 1
Nodes (2): page /organiser/UserEditor, /organiser/UserEditor

### Community 85 - "Frontend Settings Page — Page"
Cohesion (entity basis within full-graph community): 1
Nodes (2): page /SettingsPage, /SettingsPage

### Community 86 - "Zilla Backend Check Db"
Cohesion (entity basis within full-graph community): 1
Nodes (1): checkUsers\(\)

### Community 87 - "Scratch Check Pg"
Cohesion (entity basis within full-graph community): 1
Nodes (1): checkPostgres\(\)

### Community 88 - "Zilla Backend Check Tables"
Cohesion (entity basis within full-graph community): 1
Nodes (1): check\(\)

### Community 89 - "Zilla Backend Db"
Cohesion (entity basis within full-graph community): 1
Nodes (1): query\(\)

### Community 90 - "Zilla Backend Error Middleware — Error"
Cohesion (entity basis within full-graph community): 1
Nodes (1): errorHandler\(\)

### Community 91 - "Zilla Backend Fix Constraints"
Cohesion (entity basis within full-graph community): 1
Nodes (1): fixConstraints\(\)

### Community 92 - "Zilla Backend Fix Db"
Cohesion (entity basis within full-graph community): 1
Nodes (1): fixServices\(\)

### Community 93 - "Scratch Init Db"
Cohesion (entity basis within full-graph community): 1
Nodes (1): initDb\(\)

### Community 94 - "Zilla Backend Inspect Db"
Cohesion (entity basis within full-graph community): 1
Nodes (1): inspectTable\(\)

### Community 95 - "Frontend Landing Page — Landing"
Cohesion (entity basis within full-graph community): 1
Nodes (1): LandingPage\(\)

### Community 96 - "Zilla Backend Logger"
Cohesion (entity basis within full-graph community): 1
Nodes (1): formatMessage\(\)

### Community 97 - "Zilla Backend Migrate Db"
Cohesion (entity basis within full-graph community): 1
Nodes (1): migrate\(\)

### Community 98 - "Zilla Backend Migrate Google"
Cohesion (entity basis within full-graph community): 1
Nodes (1): migrate\(\)

### Community 99 - "Zilla Backend Migrate Payments"
Cohesion (entity basis within full-graph community): 1
Nodes (1): fixConstraints\(\)

### Community 100 - "Frontend My Bookings — Bookings \(2\)"
Cohesion (entity basis within full-graph community): 1
Nodes (2): fetchBookings\(\), handleCancel\(\)

### Community 101 - "Frontend Protected Route"
Cohesion (entity basis within full-graph community): 1
Nodes (1): ProtectedRoute\(\)

### Community 102 - "Frontend Reporting — Fetch"
Cohesion (entity basis within full-graph community): 1
Nodes (2): Reporting\(\), fetch\(\)

### Community 103 - "Zilla Backend Resource Controller"
Cohesion (entity basis within full-graph community): 1
Nodes (1): listByFacility\(\)

### Community 104 - "Frontend Resource Editor — Editor"
Cohesion (entity basis within full-graph community): 1
Nodes (1): ResourceEditor\(\)

### Community 105 - "Zilla Backend Scan Redis"
Cohesion (entity basis within full-graph community): 1
Nodes (1): testRedisManual\(\)

### Community 106 - "Zilla Backend Seed Comprehensive"
Cohesion (entity basis within full-graph community): 1
Nodes (1): seed\(\)

### Community 107 - "Zilla Backend Seed Db"
Cohesion (entity basis within full-graph community): 1
Nodes (1): seed\(\)

### Community 108 - "Zilla Backend Seed Pro"
Cohesion (entity basis within full-graph community): 1
Nodes (1): seed\(\)

### Community 109 - "Zilla Backend Seed V5"
Cohesion (entity basis within full-graph community): 1
Nodes (1): seed\(\)

### Community 110 - "Zilla Backend Server"
Cohesion (entity basis within full-graph community): 1
Nodes (1): shutdown\(\)

### Community 111 - "Zilla Backend Setup Db"
Cohesion (entity basis within full-graph community): 1
Nodes (1): setup\(\)

### Community 112 - "Zilla Backend Slot Generator"
Cohesion (entity basis within full-graph community): 1
Nodes (1): generateSlots\(\)

### Community 113 - "Zilla Backend Test Conn"
Cohesion (entity basis within full-graph community): 1
Nodes (1): testConnections\(\)

### Community 114 - "Zilla Backend Test Google"
Cohesion (entity basis within full-graph community): 1
Nodes (1): test\(\)

### Community 115 - "Frontend User Editor — Editor"
Cohesion (entity basis within full-graph community): 1
Nodes (1): UserEditor\(\)

### Community 116 - "Frontend User Management — Fetch"
Cohesion (entity basis within full-graph community): 1
Nodes (2): UserManagement\(\), fetch\(\)

### Community 117 - "12676946 3840 2160 30fps Mp4"
Cohesion (entity basis within full-graph community): n/a
Nodes (0): 

### Community 118 - "Card1 Png"
Cohesion (entity basis within full-graph community): n/a
Nodes (0): 

### Community 119 - "Card2 Png"
Cohesion (entity basis within full-graph community): n/a
Nodes (0): 

### Community 120 - "Env Js"
Cohesion (entity basis within full-graph community): n/a
Nodes (0): 

### Community 121 - "Eslint Config Js"
Cohesion (entity basis within full-graph community): n/a
Nodes (0): 

### Community 122 - "Favicon SVG"
Cohesion (entity basis within full-graph community): n/a
Nodes (0): 

### Community 123 - "Hero Png"
Cohesion (entity basis within full-graph community): n/a
Nodes (0): 

### Community 124 - "Icons SVG"
Cohesion (entity basis within full-graph community): n/a
Nodes (0): 

### Community 125 - "Postcss Config Js"
Cohesion (entity basis within full-graph community): n/a
Nodes (0): 

### Community 126 - "Rate Limit Middleware Js"
Cohesion (entity basis within full-graph community): n/a
Nodes (0): 

### Community 127 - "Tailwind Config Js"
Cohesion (entity basis within full-graph community): n/a
Nodes (0): 

### Community 128 - "Vite SVG"
Cohesion (entity basis within full-graph community): n/a
Nodes (0): 

### Community 129 - "Zilla Logo Png"
Cohesion (entity basis within full-graph community): n/a
Nodes (0): 

## Knowledge Gaps
- **172 weakly connected node(s):** `AdminDashboard\(\)`, `ErrorMessage\(\)`, `fetch\(\)`, `/admin/AdminDashboard`, `requireRole\(\)` (+167 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Frontend Admin`** (2 nodes): `admin.js`, `UserManagement.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Zilla Backend Ai Controller`** (2 nodes): `ai.controller.js`, `chat\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend App — App`** (2 nodes): `App\(\)`, `main.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Zilla Backend Auth Controller — Google`** (2 nodes): `googleCallback\(\)`, `googleLogin\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Zilla Backend Auth Middleware`** (2 nodes): `auth.middleware.js`, `requireRole\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Zilla Backend Auth Service — Generate`** (2 nodes): `generateRefreshToken\(\)`, `login\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend Auth Layout`** (2 nodes): `AuthLayout.jsx`, `AuthLayout\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend Booking Wizard — Booking`** (2 nodes): `handleNext\(\)`, `submitBooking\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend App — Navigate`** (2 nodes): `Navigate`, `/\*`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend App — Layout`** (2 nodes): `/ \(layout\)`, `AuthLayout\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend App — Landing`** (2 nodes): `/`, `LandingPage\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend App — Admin \(2\)`** (2 nodes): `/admin/users`, `UserManagement\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend App — Callback`** (2 nodes): `/auth/callback`, `GoogleCallback\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend App — Booking`** (2 nodes): `/booking/:serviceId`, `BookingWizard\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend App — Bookings`** (2 nodes): `/bookings`, `MyBookings\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend App — Confirmation`** (2 nodes): `/confirmation`, `BookingConfirmation\(\)`
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
- **Thin community `Frontend Google Callback`** (2 nodes): `page /auth/GoogleCallback`, `/auth/GoogleCallback`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend Login Page — Page`** (2 nodes): `page /auth/LoginPage`, `/auth/LoginPage`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend Signup Page — Page`** (2 nodes): `page /auth/SignupPage`, `/auth/SignupPage`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend Booking Confirmation — Booking`** (2 nodes): `page /customer/BookingConfirmation`, `/customer/BookingConfirmation`
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
- **Thin community `Frontend Reporting`** (2 nodes): `page /organiser/Reporting`, `/organiser/Reporting`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend Resource Editor`** (2 nodes): `page /organiser/ResourceEditor`, `/organiser/ResourceEditor`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend User Editor`** (2 nodes): `page /organiser/UserEditor`, `/organiser/UserEditor`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend Settings Page — Page`** (2 nodes): `page /SettingsPage`, `/SettingsPage`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Zilla Backend Check Db`** (2 nodes): `check\_db.js`, `checkUsers\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Scratch Check Pg`** (2 nodes): `check\_pg.js`, `checkPostgres\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Zilla Backend Check Tables`** (2 nodes): `check\_tables.js`, `check\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Zilla Backend Db`** (2 nodes): `db.js`, `query\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Zilla Backend Error Middleware — Error`** (2 nodes): `error.middleware.js`, `errorHandler\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Zilla Backend Fix Constraints`** (2 nodes): `fix\_constraints.js`, `fixConstraints\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Zilla Backend Fix Db`** (2 nodes): `fix\_db.js`, `fixServices\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Scratch Init Db`** (2 nodes): `init\_db.js`, `initDb\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Zilla Backend Inspect Db`** (2 nodes): `inspect\_db.js`, `inspectTable\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend Landing Page — Landing`** (2 nodes): `LandingPage.jsx`, `LandingPage\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Zilla Backend Logger`** (2 nodes): `logger.js`, `formatMessage\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Zilla Backend Migrate Db`** (2 nodes): `migrate\_db.js`, `migrate\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Zilla Backend Migrate Google`** (2 nodes): `migrate\_google.js`, `migrate\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Zilla Backend Migrate Payments`** (2 nodes): `migrate\_payments.js`, `fixConstraints\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend My Bookings — Bookings \(2\)`** (2 nodes): `fetchBookings\(\)`, `handleCancel\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend Protected Route`** (2 nodes): `ProtectedRoute.jsx`, `ProtectedRoute\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend Reporting — Fetch`** (2 nodes): `Reporting\(\)`, `fetch\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Zilla Backend Resource Controller`** (2 nodes): `resource.controller.js`, `listByFacility\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend Resource Editor — Editor`** (2 nodes): `ResourceEditor.jsx`, `ResourceEditor\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Zilla Backend Scan Redis`** (2 nodes): `scan\_redis.js`, `testRedisManual\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Zilla Backend Seed Comprehensive`** (2 nodes): `seed\_comprehensive.js`, `seed\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Zilla Backend Seed Db`** (2 nodes): `seed\_db.js`, `seed\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Zilla Backend Seed Pro`** (2 nodes): `seed\_pro.js`, `seed\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Zilla Backend Seed V5`** (2 nodes): `seed\_v5.js`, `seed\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Zilla Backend Server`** (2 nodes): `server.js`, `shutdown\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Zilla Backend Setup Db`** (2 nodes): `setup\_db.js`, `setup\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Zilla Backend Slot Generator`** (2 nodes): `slotGenerator.js`, `generateSlots\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Zilla Backend Test Conn`** (2 nodes): `test\_conn.js`, `testConnections\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Zilla Backend Test Google`** (2 nodes): `test\_google.js`, `test\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend User Editor — Editor`** (2 nodes): `UserEditor.jsx`, `UserEditor\(\)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend User Management — Fetch`** (2 nodes): `UserManagement\(\)`, `fetch\(\)`
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

- **Why does \`App\(\)\` connect \`Frontend App — App\` to \`Zilla Backend App\`, \`Frontend Auth Context\`, \`Frontend Auth Layout\`, \`Frontend Login Page\`, \`Frontend Signup Page\`, \`Frontend Appointment List\`, \`Frontend My Bookings\`, \`Frontend Booking Wizard\`, \`Frontend Booking Confirmation\`, \`Frontend Appointment Editor\`, \`Frontend Landing Page — Landing\`, \`Frontend Chatbot Frame\`, \`Frontend App — Layout\`, \`Frontend App — Dashboard\`, \`Frontend App — Appointment\`, \`Frontend App — Admin\`, \`Frontend App\`, \`Frontend App — Landing\`, \`Frontend App — Navigate\`?**
  _High betweenness centrality \(15189.682\) - this node is a cross-community bridge._
- **Why does \`app\` connect \`Zilla Backend App\` to \`Zilla Backend Auth Routes\`, \`Zilla Backend Service Routes\`, \`Zilla Backend Availability Routes\`, \`Zilla Backend Booking Routes\`, \`Zilla Backend Payment Routes\`, \`Zilla Backend Resource Routes\`, \`Zilla Backend Ai Routes\`?**
  _High betweenness centrality \(8936.592\) - this node is a cross-community bridge._
- **Why does \`AppointmentEditor\(\)\` connect \`Frontend Appointment Editor\` to \`Frontend App — App\`, \`Frontend Appointment List\`, \`Frontend Question Builder\`, \`Frontend Appointment Editor — Appointment\`, \`Zilla Backend App\`?**
  _High betweenness centrality \(5037.013\) - this node is a cross-community bridge._
- **What connects \`AdminDashboard\(\)\`, \`ErrorMessage\(\)\`, \`fetch\(\)\` to the rest of the system?**
  _172 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should \`Zilla Backend App\` be split into smaller, more focused modules?**
  _Cohesion score 0.09 across 42 entity nodes - this community may mix unrelated responsibilities._
- **Should \`Zilla Backend App\` be split into smaller, more focused modules?**
  _Cohesion score 0.13 across 15 entity nodes - this community may mix unrelated responsibilities._
