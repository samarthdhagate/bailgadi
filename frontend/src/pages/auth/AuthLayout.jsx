import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-0 opacity-20"
      >
        <source src="/12676946_3840_2160_30fps.mp4" type="video/mp4" />
      </video>

      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-8">
          <img src="/zilla_logo.png" alt="Zilla" className="w-20 h-20 mb-2" />
          <h1 className="text-4xl font-bold text-primary tracking-tighter">zilla</h1>
          <p className="text-gray-400 font-medium italic mt-1">Professional Appointment Booking</p>
        </div>
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
