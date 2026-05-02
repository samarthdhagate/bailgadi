import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Appointify</h1>
          <p className="text-gray-500 mt-2">Professional Appointment Booking</p>
        </div>
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
