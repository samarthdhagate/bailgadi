import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  CreditCard, 
  CheckCircle 
} from 'lucide-react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval, 
  isPast,
  isToday
} from 'date-fns';
import { bookingService } from '@services/booking';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';

const BookingWizard = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const existingBooking = location.state?.reschedulingBooking;
  
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRescheduling, setIsRescheduling] = useState(!!existingBooking);
  
  const [bookingData, setBookingData] = useState({
    serviceId: serviceId,
    resourceId: existingBooking?.resourceId || 'default',
    date: existingBooking?.date || new Date().toISOString().split('T')[0],
    time: existingBooking?.time || null,
    capacity: existingBooking?.capacity || 1,
    userDetails: existingBooking?.userDetails || {
      name: '',
      email: '',
      phone: ''
    }
  });

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [resources, setResources] = useState([]);
  const [slots, setSlots] = useState([]);
  const [service, setService] = useState(null);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        const res = await bookingService.getServices();
        const currentService = (res.data || []).find(s => String(s.id) === String(serviceId));
        setService(currentService);

        // Fetch resources (mocked for now in service, but let's set some defaults)
        const resData = await bookingService.getResources(serviceId);
        setResources(resData.data || []);
        if (resData.data?.length > 0 && !bookingData.resourceId) {
          setBookingData(prev => ({ ...prev, resourceId: resData.data[0].id }));
        }
      } catch (err) {
        setError('Failed to load service details');
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [serviceId]);

  useEffect(() => {
    if (step === 1 && bookingData.date) {
      const fetchSlots = async () => {
        setIsLoading(true);
        setError('');
        try {
          const res = await bookingService.getSlots(serviceId, bookingData.date);
          setSlots(res.data || []);
        } catch (err) {
          setError('Failed to load available slots');
        } finally {
          setIsLoading(false);
        }
      };
      fetchSlots();
    }
  }, [step, bookingData.date, serviceId]);

  const handleNext = () => {
    if (isRescheduling && step === 1) {
      submitBooking();
      return;
    }

    if (step === 2) {
      if (service?.price > 0) {
        setStep(3);
      } else {
        submitBooking();
      }
    } else {
      setStep(prev => prev + 1);
    }
  };

  const submitBooking = async () => {
    setIsLoading(true);
    setError('');
    try {
      await bookingService.lockSlot(serviceId, bookingData.time);
      const res = await bookingService.createBooking({
        ...bookingData,
        serviceId,
        startTime: bookingData.time,
      });
      
      navigate('/confirmation', {
        state: {
          booking: {
            ...res.data,
            serviceName: service?.name || service?.title,
            date: bookingData.date,
            time: bookingData.time,
            userDetails: bookingData.userDetails,
          }
        }
      });
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to confirm booking');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Calendar Helpers ---
  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "d";
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    const calendarDays = eachDayOfInterval({
      start: startDate,
      end: endDate
    });

    const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    return (
      <div className="w-full">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-400" />
          </button>
          <span className="text-lg font-bold text-gray-800">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button 
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Days of Week */}
        <div className="grid grid-cols-7 mb-4">
          {daysOfWeek.map(d => (
            <div key={d} className="text-center text-xs font-bold text-gray-400 uppercase">
              {d}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((date, i) => {
            const isCurrentMonth = isSameMonth(date, monthStart);
            const isSelected = isSameDay(date, new Date(bookingData.date));
            const isDisabled = isPast(date) && !isToday(date);

            return (
              <button
                key={i}
                disabled={isDisabled}
                onClick={() => setBookingData(prev => ({ ...prev, date: format(date, 'yyyy-MM-dd') }))}
                className={`aspect-square flex items-center justify-center rounded-xl text-sm font-bold transition-all ${
                  !isCurrentMonth ? 'text-gray-200' :
                  isSelected ? 'bg-black text-white shadow-lg' :
                  isDisabled ? 'text-gray-200 cursor-not-allowed' :
                  'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {format(date, 'd')}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderUnifiedSelection = () => {
    return (
      <div className="flex flex-col gap-10">
        {resources.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">With</h3>
            <div className="flex flex-wrap gap-4">
              {resources.map(r => (
                <button
                  key={r.id}
                  onClick={() => setBookingData(prev => ({ ...prev, resourceId: r.id }))}
                  className={`flex items-center gap-3 px-4 py-2 rounded-xl border-2 transition-all ${
                    bookingData.resourceId === r.id
                      ? 'border-primary bg-primary/5 text-primary'
                    : 'border-gray-100 bg-white text-gray-600 hover:border-gray-200'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                  bookingData.resourceId === r.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  {r.name.split(' ').map(n => n[0]).join('')}
                </div>
                <span className="font-bold">{r.name}</span>
              </button>
            ))}
            </div>
          </div>
        )}

        {/* Section: Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left: Date Picker */}
          <div className="space-y-6">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Date picker</h3>
            <div className="bg-white border border-gray-100 rounded-[32px] p-10 shadow-sm">
              {renderCalendar()}
              
              <div className="mt-10 pt-8 border-t border-gray-50">
                <p className="text-sm text-gray-500 font-medium leading-relaxed italic">
                  Schedule your visit today and experience expert care brought right to your doorstep.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Slots */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Slots</h3>
              <span className="text-[10px] font-bold text-gray-400 uppercase">(schedule = Weekly)</span>
            </div>
            <div className="bg-white border border-gray-100 rounded-[32px] p-10 shadow-sm min-h-[400px] flex flex-col">
              <div className="grid grid-cols-2 gap-4">
                {slots.length > 0 ? slots.map(slot => (
                  <button
                    key={slot.id}
                    disabled={!slot.available}
                    onClick={() => setBookingData(prev => ({ ...prev, time: slot.time }))}
                    className={`py-4 px-6 rounded-2xl border-2 font-bold text-sm transition-all ${
                      bookingData.time === slot.time
                        ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20 scale-[1.02]'
                        : slot.available
                        ? 'border-gray-100 text-gray-700 hover:border-primary/30 hover:bg-gray-50'
                        : 'bg-gray-50 border-gray-50 text-gray-300 cursor-not-allowed'
                    }`}
                  >
                    {slot.time}
                  </button>
                )) : (
                  <div className="col-span-2 py-20 text-center">
                    <p className="text-gray-400 font-medium">No slots available for this date.</p>
                  </div>
                )}
              </div>

              {/* Number of People (if enabled) */}
              {service?.capacity > 1 && (
                <div className="mt-auto pt-10 border-t border-gray-50">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Number of people</p>
                  <div className="flex items-center gap-6 bg-gray-50 w-max rounded-2xl p-2 border border-gray-100">
                    <button 
                      onClick={() => setBookingData(prev => ({ ...prev, capacity: Math.max(1, prev.capacity - 1) }))}
                      className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-bold text-gray-600 shadow-sm hover:text-primary transition-colors"
                    >-</button>
                    <span className="w-8 text-center font-black text-lg text-gray-800">{bookingData.capacity}</span>
                    <button 
                      onClick={() => setBookingData(prev => ({ ...prev, capacity: prev.capacity + 1 }))}
                      className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-bold text-gray-600 shadow-sm hover:text-primary transition-colors"
                    >+</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end pt-6">
          <Button 
            disabled={!bookingData.time || (resources.length > 0 && !bookingData.resourceId) || isLoading}
            onClick={handleNext}
            className="px-12 py-5 text-lg rounded-2xl shadow-2xl shadow-primary/30"
          >
            {isLoading ? <Loader /> : (isRescheduling ? 'Confirm Reschedule' : 'Continue to Details')}
          </Button>
        </div>
      </div>
    );
  };

  const renderStep = () => {
    if (step === 1) return renderUnifiedSelection();
    
    switch (step) {
      case 2:
        return (
          <div className="flex flex-col gap-8 max-w-4xl mx-auto">
            <div className="border-b border-gray-100 pb-6">
              <h2 className="text-3xl font-bold text-gray-800 tracking-tighter">Details</h2>
              <p className="text-gray-500 mt-2 font-medium">Please provide your contact information to confirm your booking.</p>
            </div>

            <div className="space-y-8 py-4">
              <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                <label className="font-bold text-gray-700">Full Name</label>
                <div className="md:col-span-2">
                  <Input
                    placeholder="John Doe"
                    value={bookingData.userDetails.name}
                    onChange={(e) => setBookingData(prev => ({ 
                      ...prev, 
                      userDetails: { ...prev.userDetails, name: e.target.value } 
                    }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                <label className="font-bold text-gray-700">Email Address</label>
                <div className="md:col-span-2">
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    value={bookingData.userDetails.email}
                    onChange={(e) => setBookingData(prev => ({ 
                      ...prev, 
                      userDetails: { ...prev.userDetails, email: e.target.value } 
                    }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                <label className="font-bold text-gray-700">Phone Number</label>
                <div className="md:col-span-2">
                  <Input
                    placeholder="+91 98765 43210"
                    value={bookingData.userDetails.phone}
                    onChange={(e) => setBookingData(prev => ({ 
                      ...prev, 
                      userDetails: { ...prev.userDetails, phone: e.target.value } 
                    }))}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-6 pt-10 border-t border-gray-50">
              <Button 
                onClick={handleNext}
                disabled={!bookingData.userDetails.name || !bookingData.userDetails.email}
                className="px-20 py-5 text-xl min-w-[300px] rounded-2xl shadow-2xl shadow-primary/30"
              >
                {service?.price > 0 ? 'Proceed to payment' : 'Confirm Appointment'}
              </Button>
              <button 
                onClick={() => setStep(1)}
                className="text-gray-400 hover:text-primary font-bold transition-all uppercase tracking-widest text-xs"
              >
                ← Back to selection
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
            <div className="lg:col-span-2 space-y-10">
              <div>
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-8">Choose a payment method</h3>
                <div className="space-y-6">
                  <div className="space-y-8 p-8 bg-gray-50 rounded-[32px] border border-gray-100">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input type="radio" name="paymentMethod" defaultChecked className="w-6 h-6 accent-primary" />
                      <span className="font-black text-xl text-gray-800">Credit / Debit Card</span>
                    </label>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Card Number</label>
                        <Input placeholder="0000 0000 0000 0000" />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Expiry</label>
                        <Input placeholder="MM / YY" />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">CVV</label>
                        <Input placeholder="•••" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button 
                  onClick={() => setStep(2)}
                  className="text-gray-400 hover:text-primary font-bold uppercase tracking-widest text-xs"
                >
                  ← Go back to details
                </button>
              </div>
            </div>

            <div>
              <Card className="p-10 sticky top-8 bg-white border border-gray-100 rounded-[40px] shadow-2xl shadow-black/5">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-8 text-center">Summary</h3>
                
                <div className="space-y-6 mb-10">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-bold">{service?.name || service?.title}</span>
                    <span className="font-black text-gray-800">₹{service?.price}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Convenience Fee</span>
                    <span className="font-bold text-gray-800">₹40</span>
                  </div>
                </div>

                <div className="pt-8 border-t border-gray-100 mb-10 flex justify-between items-center">
                  <span className="text-2xl font-black text-gray-800">Total</span>
                  <span className="text-3xl font-black text-primary">₹{Number(service?.price || 0) + 40}</span>
                </div>

                <Button 
                  isLoading={isLoading} 
                  onClick={submitBooking}
                  className="w-full py-5 text-xl rounded-2xl shadow-2xl shadow-primary/30"
                >
                  Pay & Confirm
                </Button>
              </Card>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 font-['Inter',sans-serif]">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-12">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-400 hover:text-primary font-bold uppercase tracking-widest text-xs transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Dashboard
          </button>

          <div className="flex items-center gap-4">
            {[1, 2, 3].filter(s => s < 3 || service?.price > 0).map((s) => (
              <div key={s} className={`w-3 h-3 rounded-full transition-all duration-500 ${
                step === s ? 'bg-primary w-8' : 
                step > s ? 'bg-green-500' : 'bg-gray-200'
              }`} />
            ))}
          </div>
        </header>

        <div className="bg-white rounded-[48px] p-12 lg:p-20 shadow-2xl shadow-black/5 border border-gray-100 relative overflow-hidden">
          {/* Decorative Background Element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          
          <ErrorMessage message={error} />
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default BookingWizard;
