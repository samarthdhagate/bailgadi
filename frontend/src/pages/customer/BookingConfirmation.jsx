import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, Clock, MapPin, Users, Download, Share2, Plus } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';

const BookingConfirmation = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const booking = state?.booking;

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 text-green-600 rounded-full mb-6">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
        <p className="text-gray-500 mb-10">We've sent a confirmation email to {booking.userDetails.email}</p>

        <Card className="text-left mb-8">
          <div className="flex justify-between items-start border-b border-gray-100 pb-4 mb-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Booking ID</p>
              <p className="font-mono font-bold text-lg text-primary">{booking.id}</p>
            </div>
            <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase">
              {booking.status}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Date</p>
                <p className="font-medium">{booking.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Time & Duration</p>
                <p className="font-medium">{booking.time} (45 mins)</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Venue</p>
                <p className="font-medium">Downtown Salon, New York</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Guests</p>
                <p className="font-medium">{booking.capacity} People</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button variant="outline" className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add to Google Calendar
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add to Outlook
          </Button>
        </div>

        <div className="mt-12 flex items-center justify-center gap-6">
          <button className="text-gray-600 hover:text-primary font-medium">Cancel Booking</button>
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-primary font-bold hover:underline"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
