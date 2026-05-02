import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Auth Pages
import AuthLayout from './pages/auth/AuthLayout';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import BookingWizard from './pages/customer/BookingWizard';
import BookingConfirmation from './pages/customer/BookingConfirmation';
import MyBookings from './pages/customer/MyBookings';

// Organiser Pages
import AppointmentList from './pages/organiser/AppointmentList';
import AppointmentEditor from './pages/organiser/AppointmentEditor';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>

        {/* Protected Customer Routes */}
        <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
          <Route path="/dashboard" element={<CustomerDashboard />} />
          <Route path="/bookings" element={<MyBookings />} />
          <Route path="/booking/:serviceId" element={<BookingWizard />} />
          <Route path="/confirmation" element={<BookingConfirmation />} />
        </Route>

        {/* Protected Organiser Routes */}
        <Route element={<ProtectedRoute allowedRoles={['organiser']} />}>
          <Route path="/organiser" element={<AppointmentList />} />
          <Route path="/organiser/editor/:id" element={<AppointmentEditor />} />
        </Route>

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
        </Route>

        {/* Default Redirects */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
