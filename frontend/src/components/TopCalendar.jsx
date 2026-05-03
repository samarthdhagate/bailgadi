import React, { useEffect, useMemo, useRef } from 'react';
import { format, addDays, startOfToday, eachDayOfInterval, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const TopCalendar = ({ events = [] }) => {
  const scrollRef = useRef(null);
  const today = useMemo(() => startOfToday(), []);
  const days = useMemo(() => eachDayOfInterval({
    start: addDays(today, -30),
    end: addDays(today, 30)
  }), [today]);

  useEffect(() => {
    // Scroll to today after mount
    setTimeout(() => {
      if (scrollRef.current) {
        const todayElement = scrollRef.current.querySelector('[data-today="true"]');
        if (todayElement) {
          todayElement.scrollIntoView({ behavior: 'smooth', inline: 'center' });
        }
      }
    }, 100);
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="w-full bg-white border-b border-gray-100 flex items-center relative group">
      <button 
        onClick={() => scroll('left')}
        className="absolute left-2 z-10 p-2 bg-white/80 backdrop-blur shadow-lg rounded-full opacity-0 group-hover:opacity-100 transition-all border border-gray-100"
      >
        <ChevronLeft className="w-4 h-4 text-gray-600" />
      </button>

      <div 
        ref={scrollRef}
        className="flex overflow-x-auto scrollbar-hide py-3 px-8 gap-1 w-full"
      >
        {days.map((day) => {
          const isToday = isSameDay(day, today);
          const hasEvent = events.some(eventDate => isSameDay(new Date(eventDate), day));
          
          return (
            <div 
              key={day.toString()}
              data-today={isToday}
              className={`flex-shrink-0 flex flex-col items-center justify-center w-16 h-20 rounded-2xl transition-all cursor-pointer ${
                isToday ? 'bg-primary shadow-lg shadow-primary/30 text-white' : 'hover:bg-gray-50 text-gray-400'
              }`}
            >
              <span className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isToday ? 'text-white/70' : 'text-gray-300'}`}>
                {format(day, 'EEE')}
              </span>
              <span className="text-xl font-black tracking-tighter">
                {format(day, 'dd')}
              </span>
              
              {hasEvent && (
                <div className={`w-1.5 h-1.5 rounded-full mt-1 animate-pulse ${isToday ? 'bg-white shadow-[0_0_8px_white]' : 'bg-green-500 shadow-[0_0_8px_#22c55e]'}`} />
              )}
            </div>
          );
        })}
      </div>

      <button 
        onClick={() => scroll('right')}
        className="absolute right-2 z-10 p-2 bg-white/80 backdrop-blur shadow-lg rounded-full opacity-0 group-hover:opacity-100 transition-all border border-gray-100"
      >
        <ChevronRight className="w-4 h-4 text-gray-600" />
      </button>
    </div>
  );
};

export default TopCalendar;
