import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { format, addMinutes, parseISO, isValid } from 'date-fns';
import { CheckCircle } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';

const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { booking, isRescheduling } = location.state || {};

  const getBookingStart = () => {
    const rawStart = booking?.slot_start || booking?.start_time || booking?.time;
    if (rawStart) {
      const parsed = parseISO(rawStart);
      if (isValid(parsed)) return parsed;
    }

    if (booking?.date && booking?.time) {
      const parsed = parseISO(`${booking.date}T${booking.time}`);
      if (isValid(parsed)) return parsed;
    }

    return null;
  };

  const getCalendarData = () => {
    const start = getBookingStart();
    if (!booking || !start) return null;

    const end = addMinutes(start, Number(booking.duration_min || booking.duration || 30));
    return {
      start,
      end,
      title: `Appointment: ${booking.serviceName || booking.service_name || 'Booking'}`,
      details: `Confirmation Code: ${booking.confirmation_code || booking.id || 'N/A'}\nStatus: ${booking.status || 'confirmed'}`,
      venue: booking.location || "Doctor's Office, Ahmedabad",
    };
  };

  const formatCalendarDate = (date) => format(date, "yyyyMMdd'T'HHmmss");

  const generateGoogleCalendarUrl = () => {
    try {
      const calendarData = getCalendarData();
      if (!calendarData) return '';

      const baseUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
      const text = encodeURIComponent(calendarData.title);
      const dates = `${formatCalendarDate(calendarData.start)}/${formatCalendarDate(calendarData.end)}`;
      const details = encodeURIComponent(calendarData.details);
      const eventLocation = encodeURIComponent(calendarData.venue);

      return `${baseUrl}&text=${text}&dates=${dates}&details=${details}&location=${eventLocation}`;
    } catch (e) {
      console.error('Error generating calendar URL:', e);
      return '';
    }
  };

  const generateOutlookCalendarUrl = () => {
    const calendarData = getCalendarData();
    if (!calendarData) return '';

    const params = new URLSearchParams({
      path: '/calendar/action/compose',
      rru: 'addevent',
      subject: calendarData.title,
      startdt: calendarData.start.toISOString(),
      enddt: calendarData.end.toISOString(),
      body: calendarData.details,
      location: calendarData.venue,
    });

    return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
  };

  const openCalendarLink = (url) => {
    if (!url) {
      alert('Calendar link is not available for this booking yet.');
      return;
    }

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const bookingStart = getBookingStart();
  const displayDate = bookingStart ? format(bookingStart, 'PPP') : booking?.date;
  const displayTime = bookingStart ? format(bookingStart, 'p') : booking?.time;

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
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-[40px] p-12 shadow-sm border border-gray-100">
        <div className="flex flex-col gap-10">
          {/* Header */}
          <div className="border-b border-gray-100 pb-8 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-800">
                {isRescheduling ? 'Reschedule confirmed' : 'Appointment confirmed'}
              </h1>
              <p className="text-gray-500 mt-2">Confirmation Code: <span className="font-mono font-bold text-primary">{booking.confirmation_code || booking.id}</span></p>
            </div>
            <div className="bg-green-100 text-green-600 p-3 rounded-full">
              <CheckCircle className="w-8 h-8" />
            </div>
          </div>

          <div className="space-y-10">
            {/* Time */}
            <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-4">
              <span className="text-2xl font-bold text-gray-800">Time</span>
              <div className="md:col-span-3">
                <p className="text-2xl font-medium text-gray-700 mb-4">
                  {displayDate}, {displayTime}
                </p>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => openCalendarLink(generateGoogleCalendarUrl())}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <img src="https://www.gstatic.com/calendar/images/dynamiclogo_2020q4/calendar_31_2x.png" alt="Google Calendar" className="w-4 h-4" />
                    Google calendar
                  </button>
                  <button
                    type="button"
                    onClick={() => openCalendarLink(generateOutlookCalendarUrl())}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Outlook calendar
                  </button>
                </div>
              </div>
            </div>

            {/* Duration */}
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
              <span className="text-2xl font-bold text-gray-800">Duration</span>
              <div className="md:col-span-3">
                <p className="text-2xl font-medium text-gray-700">30 min</p>
              </div>
            </div>

            {/* Capacity (Conditional) */}
            {booking.capacity > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                <span className="text-2xl font-bold text-gray-800 whitespace-nowrap">No of people</span>
                <div className="md:col-span-3">
                  <p className="text-2xl font-medium text-gray-700">{booking.capacity}</p>
                </div>
              </div>
            )}

            {/* Venue */}
            <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-4">
              <span className="text-2xl font-bold text-gray-800">Venue</span>
              <div className="md:col-span-3">
                <p className="text-2xl font-medium text-gray-700 leading-relaxed">
                  {booking.location || "Doctor's Office"}<br />
                  64 Doctor Street<br />
                  Springfield 380005<br />
                  Ahmedabad
                </p>
              </div>
            </div>
          </div>

          {/* Footer Area */}
          <div className="mt-12 pt-10 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="bg-gray-50 px-6 py-4 rounded-2xl border border-gray-100 max-w-md">
              <p className="text-gray-600 font-medium italic">
                Thank you for your trust we look forward to meeting you
              </p>
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={() => navigate('/bookings')}
                className="px-8 py-3 border border-gray-200 rounded-xl text-lg font-bold text-gray-600 hover:bg-gray-50 transition-colors uppercase"
              >
                My Bookings
              </button>
              <button 
                onClick={() => navigate('/dashboard')}
                className="px-8 py-3 bg-primary text-white rounded-xl text-lg font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
