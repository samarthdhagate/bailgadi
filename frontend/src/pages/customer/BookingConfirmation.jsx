import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { CheckCircle } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';

const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { booking } = location.state || {};

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
          <div className="border-b border-gray-100 pb-8">
            <h1 className="text-4xl font-bold text-gray-800">Appointment confirmed</h1>
          </div>

          <div className="space-y-10">
            {/* Time */}
            <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-4">
              <span className="text-2xl font-bold text-gray-800">Time</span>
              <div className="md:col-span-3">
                <p className="text-2xl font-medium text-gray-700 mb-4">
                  {format(new Date(booking.date), 'MMM dd')}, {booking.time}
                </p>
                <div className="flex gap-4">
                  <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                    Google calendar
                  </button>
                  <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
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
                  Doctor's Office<br />
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
                cancel
              </button>
              <button 
                onClick={() => navigate(`/booking/${booking.serviceId}`)}
                className="px-8 py-3 border border-gray-200 rounded-xl text-lg font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Reschedule
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
