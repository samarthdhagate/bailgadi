import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center relative overflow-hidden font-['Inter',sans-serif]">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      >
        <source src="/12676946_3840_2160_30fps.mp4" type="video/mp4" />
      </video>

      <div className="container mx-auto px-6 lg:px-20 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-24">
          
          {/* Left Side: Punchline & Marketing Text */}
          <div className="flex-1 text-center lg:text-left max-w-2xl">
            <div className="flex items-center gap-4 mb-8 justify-center lg:justify-start">
              <img src="/zilla_logo.png" alt="Zilla" className="w-14 h-14" />
              <h1 className="text-4xl font-black text-white tracking-tighter">zilla</h1>
            </div>
            
            <h2 className="text-5xl lg:text-7xl font-black text-white leading-[1.1] mb-8 tracking-tight">
              Easy <br/>
              <span className="text-primary italic">scheduling</span> <br/>
              ahead
            </h2>
            
            <p className="text-xl lg:text-2xl text-slate-300 font-medium leading-relaxed mb-10 max-w-xl">
              Join the next generation of professionals who easily book meetings with the #1 scheduling tool for creators and businesses.
            </p>

            <div className="flex flex-wrap items-center gap-6 justify-center lg:justify-start text-slate-400">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?u=${i}`} alt="User" />
                  </div>
                ))}
              </div>
              <p className="text-sm font-bold uppercase tracking-widest">+ 20M PROFESSIONALS</p>
            </div>
          </div>

          {/* Right Side: Login/Auth Card */}
          <div className="w-full max-w-[480px]">
            <div className="bg-white/95 backdrop-blur-xl p-10 lg:p-12 rounded-[40px] shadow-2xl shadow-black/50 border border-white/20">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Welcome back</h3>
                <p className="text-slate-500 font-medium">Continue your journey with Zilla</p>
              </div>
              <Outlet />
            </div>
            
            <p className="text-center mt-8 text-slate-400 text-sm font-medium">
              By continuing, you agree to our <span className="text-white underline cursor-pointer">Terms of Service</span> and <span className="text-white underline cursor-pointer">Privacy Policy</span>.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
