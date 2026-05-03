import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import ChatWidget from './components/ChatWidget';

// Auth Pages
import AuthLayout from './pages/auth/AuthLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import GoogleCallback from './pages/auth/GoogleCallback';

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
import SettingsPage from './pages/SettingsPage';
import Meetings from './pages/organiser/Meetings';
import Reporting from './pages/organiser/Reporting';
import ResourceEditor from './pages/organiser/ResourceEditor';
import UserEditor from './pages/organiser/UserEditor';

const CustomerSection = () => (
  <>
    <Outlet />
    <ChatWidget />
  </>
);

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/auth/callback" element={<GoogleCallback />} />
        </Route>

        {/* Protected Customer Routes */}
        <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
          <Route element={<CustomerSection />}>
            <Route path="/dashboard" element={<CustomerDashboard />} />
            <Route path="/bookings" element={<MyBookings />} />
            <Route path="/booking/:serviceId" element={<BookingWizard />} />
            <Route path="/confirmation" element={<BookingConfirmation />} />
          </Route>
        </Route>

        {/* Protected Organiser Routes */}
        <Route element={<ProtectedRoute allowedRoles={['organiser']} />}>
          <Route path="/organiser" element={<AppointmentList />} />
          <Route path="/organiser/editor/:id" element={<AppointmentEditor />} />
          <Route path="/organiser/meetings" element={<Meetings />} />
          <Route path="/organiser/reporting" element={<Reporting />} />
          <Route path="/organiser/resource/:id" element={<ResourceEditor />} />
          <Route path="/organiser/user/:id" element={<UserEditor />} />
        </Route>

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
        </Route>

        {/* Shared Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={['customer', 'organiser', 'admin']} />}>
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Default Redirects */}
        <Route path="/" element={<LandingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}



export default App;
