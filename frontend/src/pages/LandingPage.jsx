import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ArrowRight } from 'lucide-react';

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
      <header className="relative z-20 h-20 px-6 lg:px-20 flex items-center justify-between bg-white/10 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-3 cursor-pointer">
            <img src="/zilla_logo.png" alt="Zilla" className="w-10 h-10" />
            <span className="text-2xl font-black text-white tracking-tighter">zilla</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/login')} className="text-sm font-bold text-white hover:text-primary transition-colors">Log In</button>
          <button onClick={() => navigate('/signup')} className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-primary/20 transition-all">
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
              <p className="text-xl lg:text-2xl text-white/90 font-medium leading-relaxed max-w-xl drop-shadow-md">
                Book appointments and meetings, all in one place.
                From haircuts to consultations, schedule everything effortlessly.
                Simple, fast, and built for everyday life.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <button onClick={() => navigate('/signup')} className="px-10 py-5 bg-primary text-white rounded-2xl font-bold text-lg shadow-2xl shadow-primary/40 hover:-translate-y-1 transition-all flex items-center gap-3">
                Get Started for Free <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="hidden lg:block relative">
            <div className="relative z-10 bg-white rounded-[40px] shadow-2xl shadow-black/40 border border-gray-100 overflow-hidden aspect-[16/9] w-[750px] h-[600px]">
              {screenshots.map((slide, i) => (
                <div
                  key={i}
                  className={`absolute inset-0 transition-all duration-1000 ease-in-out flex flex-col ${activeSlide === i ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'
                    }`}
                >
                  <div className="p-8 border-b border-gray-100">
                    <h3 className="text-2xl font-bold text-gray-800 tracking-tight">{slide.title}</h3>
                  </div>
                  <div className="flex-1 bg-gray-50 p-6 flex flex-col gap-4">
                    <div className="flex-1 rounded-2xl overflow-hidden shadow-lg border border-gray-200 bg-white">
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
