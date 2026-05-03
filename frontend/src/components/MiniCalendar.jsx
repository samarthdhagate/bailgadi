import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MiniCalendar = ({ events = [], selectedDate, onSelectDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const activeDate = selectedDate ? new Date(selectedDate) : new Date();

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth)),
    end: endOfWeek(endOfMonth(currentMonth))
  });

  return (
    <div className="bg-white rounded-[30px] p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-black text-gray-800 uppercase tracking-widest text-sm">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <div className="flex gap-1">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1 hover:bg-gray-50 rounded-lg transition-colors">
            <ChevronLeft className="w-4 h-4 text-gray-400" />
          </button>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1 hover:bg-gray-50 rounded-lg transition-colors">
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, index) => (
          <div key={`${d}-${index}`} className="text-[10px] font-black text-gray-300 text-center uppercase tracking-widest">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          const isSelected = isSameDay(day, activeDate);
          const isToday = isSameDay(day, new Date());
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const hasEvent = events.some(eventDate => isSameDay(new Date(eventDate), day));
          
          return (
            <button
              type="button"
              key={i}
              onClick={() => onSelectDate?.(day)}
              className={`h-8 flex flex-col items-center justify-center rounded-lg text-xs font-bold transition-all relative ${
                !isCurrentMonth ? 'text-gray-200' : 
                isSelected ? 'bg-primary text-white shadow-lg shadow-primary/30' : 
                hasEvent ? 'text-gray-800 bg-green-50 hover:bg-green-100' :
                'text-gray-500 hover:bg-gray-50'
              }`}
              title={hasEvent ? `Bookings on ${format(day, 'PPP')}` : format(day, 'PPP')}
            >
              {format(day, 'd')}
              {isToday && !isSelected && (
                <div className="w-1 h-1 rounded-full absolute top-1 bg-primary" />
              )}
              {hasEvent && (
                <div className={`w-1 h-1 rounded-full absolute bottom-1 ${isSelected ? 'bg-white' : 'bg-green-500'}`} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MiniCalendar;
