import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const screenshots = [
  {
    title: "Share your booking page",
    image: "/card1.png",
    content: "Let clients pick a time that works for everyone in seconds."
  },
  {
    title: "Manage your meetings",
    image: "/card2.png",
    content: "Keep track of all your upcoming appointments in one place."
  }
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % screenshots.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col relative overflow-hidden font-['Inter',sans-serif]">
      {/* Background Video with subtle tint */}
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
        <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px]"></div>
      </div>

      {/* Top Navigation */}
      <header className="relative z-20 h-20 px-6 lg:px-20 flex items-center justify-between bg-white/10 border-b border-white/10">
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-4 cursor-pointer">
            <img src="/zilla_logo.png" alt="Zilla" className="w-10 h-10" />
            <span className="text-2xl font-black text-white tracking-tighter">zilla</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/login')} className="text-sm font-bold text-white hover:text-primary active:opacity-70 transition-colors duration-200">Log In</button>
          <button onClick={() => navigate('/signup')} className="px-6 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-primary/20 active:scale-95 transition-all duration-200">
            Get started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <div className="flex-1 container mx-auto px-6 lg:px-20 relative z-10 flex items-center">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-32 items-center w-full py-20">

          <div className="space-y-12">
            <div className="space-y-8">
              <h2 className="text-6xl lg:text-8xl font-black text-white leading-[0.9] tracking-tighter drop-shadow-2xl">
                Easy <br />
                <span className="text-primary italic">scheduling</span> <br />
                ahead
              </h2>
              <p className="text-xl lg:text-2xl text-white/90 font-medium leading-relaxed max-w-xl">
                Book appointments and meetings, all in one place.
                From haircuts to consultations, schedule everything effortlessly.
                Simple, fast, and built for everyday life.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <button onClick={() => navigate('/login')} className="px-10 py-5 bg-white text-gray-800 rounded-2xl font-bold text-lg shadow-2xl shadow-black/20 hover:scale-[1.02] active:scale-95 transition-all duration-200 flex items-center gap-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.83z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.83c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Sign in with Google
              </button>
            </div>
          </div>

          <div className="hidden lg:block relative">
            <div className="relative z-10 bg-white rounded-[40px] shadow-2xl shadow-black/40 overflow-hidden aspect-[16/9] w-[750px] h-[600px]">
              {screenshots.map((slide, i) => (
                <div
                  key={i}
                  className={`absolute inset-0 transition-all duration-200 ease-in-out flex flex-col ${activeSlide === i ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'
                    }`}
                >
                  <div className="p-8 border-b border-gray-100">
                    <h3 className="text-2xl font-bold text-gray-800 tracking-tight">{slide.title}</h3>
                  </div>
                  <div className="flex-1 bg-gray-50 p-8 flex flex-col gap-6">
                    <div className="flex-1 rounded-2xl overflow-hidden border border-gray-200 bg-white">
                      <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-gray-500 font-bold text-lg leading-snug px-2">{slide.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LandingPage;
