import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { format, addMinutes, parse } from 'date-fns';
import { CheckCircle, Clock, MapPin, Calendar, ArrowRight } from 'lucide-react';
import Button from '../../components/Button';

const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { booking, isRescheduling } = location.state || {};

  const generateGoogleCalendarUrl = () => {
    if (!booking) return '';
    try {
      const fromIso = booking.time ? new Date(booking.time) : null;
      const startDateTime =
        fromIso && !Number.isNaN(fromIso.getTime())
          ? fromIso
          : parse(`${booking.date} ${booking.time}`, 'yyyy-MM-dd hh:mm a', new Date());
      const endDateTime = addMinutes(startDateTime, 30);
      const formatForGoogle = (date) => format(date, "yyyyMMdd'T'HHmmss'Z'");
      const baseUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
      const text = encodeURIComponent(`Appointment: ${booking.serviceName || 'Booking'}`);
      const dates = `${formatForGoogle(startDateTime)}/${formatForGoogle(endDateTime)}`;
      const details = encodeURIComponent(`Confirmation Code: ${booking.confirmation_code || booking.id}\nStatus: ${booking.status}`);
      return `${baseUrl}&text=${text}&dates=${dates}&details=${details}`;
    } catch (e) {
      return '#';
    }
  };

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">No booking found</h2>
          <Button className="mt-4" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] py-20 px-4 font-['Inter',sans-serif]">
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-50 rounded-[40px] mb-8 animate-bounce">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tight mb-4">
            {isRescheduling ? 'Rescheduled!' : 'You\'re all set!'}
          </h1>
          <p className="text-xl text-gray-500 font-medium italic">
            Your appointment has been successfully {isRescheduling ? 'rescheduled' : 'confirmed'}.
          </p>
        </div>

        {/* Confirmation Card */}
        <div className="bg-white rounded-[48px] p-12 shadow-2xl shadow-black/5 border border-gray-100 relative overflow-hidden mb-12">
          {/* Top Info Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12 pb-8 border-b border-gray-50">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Confirmation Code</p>
              <p className="text-2xl font-black text-primary font-mono">{booking.confirmation_code || booking.id}</p>
            </div>
            <div className="flex gap-2">
              <a 
                href={generateGoogleCalendarUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold rounded-2xl transition-all text-sm"
              >
                <Calendar className="w-4 h-4" />
                Add to Calendar
              </a>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
            <div className="space-y-2">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date & Time</p>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary" />
                <p className="text-lg font-bold text-gray-800">
                  {format(new Date(booking.date), 'MMMM do, yyyy')} at {format(new Date(booking.time), 'hh:mm a')}
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Service</p>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-primary" />
                <p className="text-lg font-bold text-gray-800">{booking.serviceName || 'Premium Service'}</p>
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Venue Location</p>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-1" />
                <p className="text-lg font-bold text-gray-800 leading-relaxed">
                  {booking.location || "64 Doctor Street, Springfield 380005, Ahmedabad"}
                </p>
              </div>
            </div>
          </div>

          {/* User Info Bar */}
          <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
            <div className="flex justify-between items-center text-sm font-bold text-gray-500 uppercase tracking-widest">
              <span>Customer</span>
              <span>Email</span>
            </div>
            <div className="flex justify-between items-center mt-2 text-gray-800">
              <span className="text-xl font-black">{booking.userDetails?.name || 'Guest'}</span>
              <span className="font-bold">{booking.userDetails?.email || '-'}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col md:flex-row items-center gap-6">
          <Button 
            onClick={() => navigate('/dashboard')}
            className="flex-1 w-full py-6 text-xl rounded-[30px] shadow-2xl shadow-primary/20 flex items-center justify-center gap-3 group"
          >
            Back to Dashboard
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <button 
            onClick={() => navigate('/bookings')}
            className="flex-1 w-full py-6 text-xl font-black text-gray-400 hover:text-gray-800 transition-all uppercase tracking-widest"
          >
            View All Bookings
          </button>
        </div>

        <p className="text-center text-gray-400 text-sm mt-12 italic font-medium">
          A confirmation email has been sent to your registered address.
        </p>
      </div>
    </div>
  );
};

export default BookingConfirmation;
