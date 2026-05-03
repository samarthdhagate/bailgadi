import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, CheckCircle, Clock3, XCircle, X, CreditCard } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';
import { bookingService } from '@services/booking';

const MyBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const response = await bookingService.getMyBookings();
      setBookings(response.data || []);
    } catch (err) {
      setError('Failed to load your bookings.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await bookingService.cancelBooking(bookingId);
      // Refresh list to show updated status
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to cancel booking.');
    }
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'booked':
      case 'confirmed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'pending':
      case 'locked':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'rescheduled':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'booked':
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
      case 'locked':
        return <Clock3 className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString; // Return as is if not ISO
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) { return isoString; }
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString; // Return as is if not ISO
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch (e) { return isoString; }
  };

  const getBookingStart = (booking) => {
    const rawStart = booking?.slot_start || booking?.start_time || booking?.time;
    if (!rawStart) return null;
    const parsed = new Date(rawStart);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  const openConfirmation = (booking) => {
    const start = getBookingStart(booking);
    navigate('/confirmation', {
      state: {
        booking: {
          ...booking,
          serviceName: booking.service_name || booking.serviceName,
          date: start?.toISOString().split('T')[0],
          time: start?.toISOString(),
        }
      }
    });
  };

  const renderBookingDetails = () => {
    if (!selectedBooking) return null;

    const start = getBookingStart(selectedBooking);

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
        <div className="w-full max-w-xl rounded-3xl bg-white p-8 shadow-2xl">
          <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-6">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-gray-400">Booking Details</p>
              <h2 className="mt-2 text-2xl font-black text-gray-800">{selectedBooking.service_name || selectedBooking.serviceName}</h2>
              {selectedBooking.confirmation_code && (
                <p className="mt-1 font-mono text-sm font-bold text-primary">#{selectedBooking.confirmation_code}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setSelectedBooking(null)}
              className="rounded-xl p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-700"
              aria-label="Close booking details"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 py-6">
            <div className="rounded-2xl border border-gray-100 p-4">
              <p className="text-xs font-black uppercase tracking-widest text-gray-400">Time</p>
              <p className="mt-2 font-bold text-gray-800">
                {start ? `${formatDate(start.toISOString())} at ${formatTime(start.toISOString())}` : 'Time unavailable'}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-gray-100 p-4">
                <p className="text-xs font-black uppercase tracking-widest text-gray-400">Status</p>
                <div className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold uppercase ${getStatusStyle(selectedBooking.status)}`}>
                  {getStatusIcon(selectedBooking.status)}
                  {selectedBooking.status}
                </div>
              </div>
              <div className="rounded-2xl border border-gray-100 p-4">
                <p className="text-xs font-black uppercase tracking-widest text-gray-400">Payment</p>
                <p className="mt-2 flex items-center gap-2 font-bold text-gray-800">
                  <CreditCard className="h-4 w-4 text-primary" />
                  {selectedBooking.payment_status || 'Not available'}
                  {selectedBooking.paid_amount ? ` · ₹${selectedBooking.paid_amount}` : ''}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 border-t border-gray-100 pt-6">
            <Button onClick={() => openConfirmation(selectedBooking)} className="px-6 py-3 rounded-xl">
              View Confirmation
            </Button>
            {selectedBooking.status?.toLowerCase() !== 'cancelled' && (
              <button
                type="button"
                onClick={() => {
                  setSelectedBooking(null);
                  navigate(`/booking/${selectedBooking.service_id || selectedBooking.serviceId || selectedBooking.facility_id || 1}`, { state: { reschedulingBooking: selectedBooking } });
                }}
                className="px-6 py-3 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50"
              >
                Reschedule
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout title="My Bookings">
      {renderBookingDetails()}
      <div className="flex flex-col gap-6">
        <p className="text-gray-500">View and manage your upcoming and past appointments.</p>

        {isLoading ? (
          <Loader />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : bookings.length === 0 ? (
          <Card className="text-center py-16">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">You haven't made any bookings yet.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {bookings.map((booking) => (
              <Card
                key={booking.id}
                className="hover:border-primary transition-all group cursor-pointer"
                onClick={() => setSelectedBooking(booking)}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-1">{booking.service_name || booking.serviceName}</h3>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <User className="w-4 h-4" />
                          <span>{booking.provider_name || booking.resourceName}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          <span>
                            {getBookingStart(booking) ? 
                              `${formatDate(getBookingStart(booking).toISOString())} at ${formatTime(getBookingStart(booking).toISOString())}` : 
                              `${booking.date} at ${booking.time}`
                            }
                          </span>
                        </div>
                        {booking.confirmation_code && (
                          <div className="font-mono text-primary font-medium">
                            #{booking.confirmation_code}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold uppercase ${getStatusStyle(booking.status)}`}>
                      {getStatusIcon(booking.status)}
                      {booking.status}
                    </div>
                    {booking.status?.toLowerCase() !== 'cancelled' && (
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/booking/${booking.service_id || booking.serviceId || booking.facility_id || 1}`, { state: { reschedulingBooking: booking } });
                          }}
                          className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
                        >
                          Reschedule
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancel(booking.id);
                          }}
                          className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyBookings;
