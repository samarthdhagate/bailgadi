import React, { useState, useMemo } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  isToday,
  parseISO
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Trash2, CheckCircle, XCircle } from 'lucide-react';
import Card from './Card';
import Button from './Button';
import Loader from './Loader';
import { adminService } from '@services/admin';

const AdminBookingCalendar = ({ bookings = [], onRefresh }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Safely parse date
  const safeParse = (dateStr) => {
    if (!dateStr) return null;
    try {
      const d = parseISO(dateStr);
      return isNaN(d.getTime()) ? null : d;
    } catch (e) {
      return null;
    }
  };

  const days = useMemo(() => {
    try {
      const start = startOfWeek(startOfMonth(currentMonth));
      const end = endOfWeek(endOfMonth(currentMonth));
      return eachDayOfInterval({ start, end });
    } catch (e) {
      console.error("Calendar generation error:", e);
      return [];
    }
  }, [currentMonth]);

  const bookingsForSelectedDate = useMemo(() => {
    return (bookings || []).filter(b => {
      const d = safeParse(b.slot_start);
      return d && isSameDay(d, selectedDate);
    });
  }, [bookings, selectedDate]);

  const handleUpdateStatus = async (id, status) => {
    setIsLoading(true);
    setError('');
    try {
      await adminService.updateBookingStatus(id, status);
      setSuccess(`Booking ${status} successfully`);
      if (onRefresh) onRefresh();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Update failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this booking?')) return;
    setIsLoading(true);
    try {
      await adminService.deleteBooking(id);
      setSuccess('Booking deleted');
      if (onRefresh) onRefresh();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Delete failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
      {/* LEFT: Calendar Grid */}
      <Card className="lg:col-span-8 p-6 lg:p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">{format(currentMonth, 'MMMM yyyy')}</h3>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400"><ChevronLeft className="w-5 h-5" /></button>
            <button onClick={() => setCurrentMonth(new Date())} className="px-4 py-2 text-xs font-black uppercase tracking-widest text-primary hover:bg-primary/5 rounded-xl transition-colors">Today</button>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center py-2 text-[10px] font-black text-gray-300 uppercase tracking-widest">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((day, i) => {
            const isCurrMonth = isSameMonth(day, currentMonth);
            const isSel = isSameDay(day, selectedDate);
            const isTod = isToday(day);
            const dayBookings = (bookings || []).filter(b => {
              const d = safeParse(b.slot_start);
              return d && isSameDay(d, day);
            });

            return (
              <button
                key={i}
                onClick={() => setSelectedDate(day)}
                className={`min-h-[100px] p-3 rounded-[24px] border transition-all flex flex-col items-start relative group ${
                  !isCurrMonth ? 'bg-gray-50/30 border-transparent opacity-30' :
                  isSel ? 'bg-black border-black shadow-2xl scale-[1.02] z-10 text-white' :
                  'bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50 text-gray-800'
                }`}
              >
                <span className={`text-sm font-black ${isTod && !isSel ? 'text-primary underline decoration-2 underline-offset-4' : ''}`}>
                  {format(day, 'd')}
                </span>
                
                <div className="mt-auto flex flex-wrap gap-1">
                  {dayBookings.slice(0, 4).map((b, idx) => (
                    <div key={idx} className={`w-1.5 h-1.5 rounded-full ${
                      isSel ? 'bg-white/40' : 
                      b.status === 'confirmed' ? 'bg-green-500' : 
                      b.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                  ))}
                  {dayBookings.length > 4 && <span className="text-[8px] font-bold opacity-50">+{dayBookings.length - 4}</span>}
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* RIGHT: Selected Date Details */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{format(selectedDate, 'EEEE')}</p>
          <h2 className="text-3xl font-black text-gray-800 tracking-tighter">{format(selectedDate, 'MMM d, yyyy')}</h2>
          <div className="mt-4 inline-flex px-3 py-1 bg-gray-100 rounded-lg text-xs font-bold text-gray-500">
            {bookingsForSelectedDate.length} Bookings
          </div>
        </div>

        {success && <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-2xl text-xs font-bold animate-in zoom-in-95">{success}</div>}
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl text-xs font-bold animate-in shake">{error}</div>}

        <div className="space-y-4 overflow-y-auto max-h-[600px] pr-2 scrollbar-hide">
          {bookingsForSelectedDate.length > 0 ? bookingsForSelectedDate.map((b) => (
            <Card key={b.id} className="p-6 group hover:border-primary/30 transition-all border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div className="min-w-0">
                  <h4 className="font-bold text-gray-800 truncate">{b.service_name || 'Service'}</h4>
                  <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-1 font-bold uppercase tracking-wider">
                    <Clock className="w-3 h-3" />
                    {safeParse(b.slot_start) ? format(safeParse(b.slot_start), 'hh:mm a') : '??:??'}
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                  b.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                  b.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                }`}>
                  {b.status}
                </span>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl mb-4 border border-gray-100/50">
                <div className="w-8 h-8 rounded-xl bg-white border border-gray-100 flex items-center justify-center font-black text-xs text-primary shadow-sm">
                  {b.customer_name ? b.customer_name[0] : '?'}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-700 truncate">{b.customer_name || 'Anonymous'}</p>
                  <p className="text-[10px] text-gray-400 truncate font-medium">{b.customer_email || 'no-email'}</p>
                </div>
              </div>

              <div className="flex gap-2">
                {b.status === 'pending' && (
                  <button onClick={() => handleUpdateStatus(b.id, 'confirmed')} className="flex-1 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:opacity-90 transition-opacity">Confirm</button>
                )}
                <button onClick={() => handleUpdateStatus(b.id, 'cancelled')} className="flex-1 py-2 bg-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
                <button onClick={() => handleDelete(b.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
              </div>
            </Card>
          )) : (
            <div className="text-center py-16 bg-gray-50/50 rounded-[40px] border-2 border-dashed border-gray-100">
              <CalendarIcon className="w-8 h-8 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 font-bold text-sm">No appointments</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBookingCalendar;
