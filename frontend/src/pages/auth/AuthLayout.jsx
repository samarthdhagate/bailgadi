import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

const AuthLayout = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-['Inter',sans-serif]">
      {/* Shared Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/12676946_3840_2160_30fps.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Simple Branding Header */}
        <div 
          className="flex flex-col items-center mb-8 cursor-pointer group" 
          onClick={() => navigate('/')}
        >
          <img src="/zilla_logo.png" alt="Zilla" className="w-16 h-16 mb-2 group-hover:scale-110 transition-transform" />
          <h1 className="text-4xl font-black text-white tracking-tighter drop-shadow-lg">zilla</h1>
        </div>

        {/* Auth Form Card */}
        <div className="bg-white/95 backdrop-blur-xl p-8 lg:p-10 rounded-[32px] shadow-2xl shadow-black/40 border border-white/20">
          <Outlet />
        </div>

        <p className="text-center mt-8 text-white/60 text-sm font-medium drop-shadow-md">
          Return to <span className="text-white underline cursor-pointer" onClick={() => navigate('/')}>Home</span>
        </p>
      </div>
    </div>
  );
};

export default AuthLayout;
