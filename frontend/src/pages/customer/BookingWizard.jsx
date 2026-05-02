import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Clock, 
  Users, 
  CreditCard, 
  CheckCircle,
  ShieldCheck,
  Tag,
  Zap,
  ArrowRight} from 'lucide-react';
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
      if (Number(service?.price) > 0) {
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
      if (isRescheduling) {
        await bookingService.rescheduleBooking(existingBooking.id, bookingData);
        navigate('/confirmation', {
          state: {
            booking: {
              ...existingBooking,
              date: bookingData.date,
              time: bookingData.time,
              status: 'Rescheduled'
            },
            isRescheduled: true
          }
        });
        return;
      }

      // 1. Lock the slot
      const lockRes = await bookingService.lockSlot(serviceId, bookingData.time);
      const { reservation_id, payment_order } = lockRes.data;

      // 2. Handle Payment if required
      if (payment_order) {
        if (!window.Razorpay) {
          setError('Razorpay SDK failed to load. Please refresh the page.');
          setIsLoading(false);
          return;
        }

        const options = {
          key: payment_order.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: payment_order.amount,
          currency: payment_order.currency,
          name: 'ZILLA',
          description: `Premium Booking: ${service?.name || 'Appointment'}`,
          image: '/zilla_logo.png', // Ensure this exists in public folder
          order_id: payment_order.id,
          handler: async (response) => {
            try {
              setIsLoading(true);
              // 3. Verify Payment and Confirm Booking
              const verifyRes = await bookingService.verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
              
              if (verifyRes.success) {
                navigate('/confirmation', {
                  state: {
                    booking: {
                      ...verifyRes.data,
                      serviceName: service?.name || service?.title,
                      date: bookingData.date,
                      time: bookingData.time,
                      userDetails: bookingData.userDetails,
                    }
                  }
                });
              }
            } catch (err) {
              setError(err.response?.data?.error?.message || 'Payment verification failed');
            } finally {
              setIsLoading(false);
            }
          },
          prefill: {
            name: bookingData.userDetails.name,
            email: bookingData.userDetails.email,
            contact: bookingData.userDetails.phone
          },
          notes: {
             service_id: serviceId,
             customer_id: bookingData.userDetails.email
          },
          theme: { 
            color: '#875A7B', // Primary brand color
            backdrop_color: '#fafafa'
          },
          modal: {
            ondismiss: () => {
              setIsLoading(false);
              setError('Payment process was interrupted.');
            },
            escape: true,
            confirm_close: true
          },
          retry: {
            enabled: true,
            max_count: 3
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', (response) => {
          setError(`Payment failed: ${response.error.description}`);
          setIsLoading(false);
        });
        rzp.open();
        return; // Wait for handler
      }
  
        // 3. If no payment, create booking directly
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
            {daysOfWeek.map((d, idx) => (
              <div key={idx} className="text-center text-xs font-bold text-gray-400 uppercase">
                {d}
              </div>
            ))}
          </div>
  
          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date, i) => {
              const isCurrentMonth = isSameMonth(date, monthStart);
              const isSelected = isSameDay(date, new Date(bookingData.date));
              const isDisabled = (isPast(date) && !isToday(date));
  
              return (
                <button
                  key={i}
                  disabled={isDisabled}
                  onClick={() => setBookingData(prev => ({ ...prev, date: format(date, 'yyyy-MM-dd') }))}
                  className={`aspect-square flex items-center justify-center rounded-xl text-sm font-bold transition-all duration-200 ${
                    !isCurrentMonth ? 'text-gray-200' :
                    isSelected ? 'bg-black text-white' :
                    isDisabled ? 'text-gray-200 opacity-40 cursor-not-allowed' :
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
                    className={`flex items-center gap-3 px-4 py-2 rounded-xl border-2 transition-all duration-200 ${
                      bookingData.resourceId === r.id
                        ? 'border-primary bg-primary/5 text-primary'
                      : 'border-gray-100 bg-white text-gray-600 hover:border-gray-200'
                  }`}
                  >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                    bookingData.resourceId === r.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {(r.name || 'Staff').split(' ').map(n => n[0]).join('')}
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
            <div className="bg-white border border-gray-100 rounded-[32px] p-10">
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
            <div className="bg-white border border-gray-100 rounded-[32px] p-10 min-h-[400px] flex flex-col">
              <div className="grid grid-cols-2 gap-4">
                {slots.length > 0 ? slots.map(slot => (
                  <button
                    key={slot.id || slot.time}
                    disabled={!slot.available}
                    onClick={() => setBookingData(prev => ({ ...prev, time: slot.time }))}
                    className={`py-4 px-6 rounded-2xl border-2 font-bold text-sm transition-all duration-200 ${
                      bookingData.time === slot.time
                        ? 'bg-primary border-primary text-white scale-[1.02]'
                        : slot.available
                        ? 'border-gray-100 text-gray-700 hover:border-primary/50 hover:bg-gray-50'
                        : 'bg-gray-50 border-gray-50 text-gray-300 opacity-40 cursor-not-allowed'
                    }`}
                  >
                    {format(new Date(slot.time), 'hh:mm a')}
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
                      className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-bold text-gray-600 shadow-sm hover:text-primary active:scale-95 transition-all duration-200"
                    >-</button>
                    <span className="w-8 text-center font-black text-lg text-gray-800">{bookingData.capacity}</span>
                    <button 
                      onClick={() => setBookingData(prev => ({ ...prev, capacity: prev.capacity + 1 }))}
                      className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-bold text-gray-600 shadow-sm hover:text-primary active:scale-95 transition-all duration-200"
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
            className="px-12 py-5 text-lg rounded-2xl shadow-lg shadow-primary/20 active:scale-95"
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
                {Number(service?.price) > 0 ? 'Proceed to payment' : 'Confirm Appointment'}
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
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-full text-primary text-[10px] font-black uppercase tracking-widest mb-6 border border-primary/10">
                <ShieldCheck className="w-4 h-4" />
                SECURE CHECKOUT
              </div>
              <h2 className="text-5xl font-black text-gray-800 tracking-tighter mb-4">Complete Booking</h2>
              <p className="text-gray-500 font-medium text-lg">Finalize your premium appointment with Zilla.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-stretch">
              {/* Service Details Card */}
              <div className="bg-[#fcfcfc] rounded-[50px] p-12 border border-gray-100 flex flex-col relative overflow-hidden group shadow-sm hover:shadow-xl hover:shadow-black/[0.02] transition-all duration-500">
                <div className="absolute top-0 left-0 w-2 h-full bg-primary opacity-20"></div>
                
                <div className="w-24 h-24 bg-primary/10 rounded-[32px] flex items-center justify-center text-primary mb-10 group-hover:scale-110 transition-transform duration-500">
                  <CreditCard className="w-12 h-12" />
                </div>
                
                <h3 className="text-3xl font-black text-gray-800 mb-3">{service?.name}</h3>
                <div className="space-y-4 mb-10">
                  <div className="flex items-center gap-3 text-gray-500 font-bold">
                    <Calendar className="w-5 h-5 text-primary" />
                    {format(new Date(bookingData.date), 'MMMM do, yyyy')}
                  </div>
                  <div className="flex items-center gap-3 text-gray-500 font-bold">
                    <Clock className="w-5 h-5 text-primary" />
                    {format(new Date(bookingData.time), 'hh:mm a')}
                  </div>
                </div>

                <div className="mt-auto pt-8 border-t border-gray-100 flex items-center gap-3">
                   <div className="flex -space-x-3">
                      {[1,2,3].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[10px] font-black text-gray-400">
                           {String.fromCharCode(64 + i)}
                        </div>
                      ))}
                   </div>
                   <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Verified Merchant</span>
                </div>
              </div>

              {/* Order Summary Card */}
              <div className="bg-white rounded-[50px] p-12 border border-gray-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] flex flex-col relative">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-10">Order Summary</h4>
                
                <div className="space-y-8 flex-1">
                  <div className="flex justify-between items-center group/item">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover/item:text-primary transition-colors">
                          <Tag className="w-4 h-4" />
                       </div>
                       <span className="text-gray-500 font-bold">Base Service</span>
                    </div>
                    <span className="font-black text-gray-800 text-lg">₹{service?.price}</span>
                  </div>
                  
                  <div className="flex justify-between items-center group/item">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover/item:text-primary transition-colors">
                          <Zap className="w-4 h-4" />
                       </div>
                       <span className="text-gray-500 font-bold">Platform Fee</span>
                    </div>
                    <span className="font-black text-gray-800 text-lg">₹40</span>
                  </div>

                  <div className="pt-10 mt-10 border-t-2 border-dashed border-gray-100 flex justify-between items-end">
                    <div>
                       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Grand Total</span>
                       <span className="text-5xl font-black text-gray-800 tracking-tighter">₹{Number(service?.price || 0) + 40}</span>
                    </div>
                    <div className="text-primary animate-bounce">
                       <ArrowRight className="w-8 h-8" />
                    </div>
                  </div>
                </div>

                <Button 
                  isLoading={isLoading}
                  onClick={submitBooking}
                  className="w-full py-7 text-2xl font-black rounded-3xl shadow-2xl shadow-primary/40 mt-12 transform hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Confirm & Pay Now
                </Button>
              </div>
            </div>

            <div className="mt-12 text-center">
              <button 
                onClick={() => setStep(2)}
                className="text-gray-400 hover:text-primary font-bold uppercase tracking-widest text-xs transition-all flex items-center gap-2 mx-auto"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to details
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] py-12 px-4 font-['Inter',sans-serif] relative overflow-hidden">
      {/* Cinematic Background Decorations */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[100px]"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Floating Glass Header */}
        <header className="flex items-center justify-between mb-16 px-8 py-6 bg-white/50 backdrop-blur-2xl border border-white/20 rounded-[32px] shadow-2xl shadow-black/5">
          <button 
            onClick={() => navigate('/dashboard')}
            className="group flex items-center gap-3 text-gray-400 hover:text-primary font-black uppercase tracking-[0.2em] text-[10px] transition-all"
          >
            <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-primary/10 group-hover:scale-110 transition-all">
              <ChevronLeft className="w-4 h-4" />
            </div>
            Back
          </button>

          <div className="flex items-center gap-6">
            {[1, 2, 3].filter(s => s < 3 || service?.price > 0).map((s) => (
              <div key={s} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs transition-all duration-500 ${
                  step === s ? 'bg-primary text-white shadow-xl shadow-primary/30 scale-110' : 
                  step > s ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  {step > s ? <CheckCircle className="w-4 h-4" /> : s}
                </div>
                {s < (service?.price > 0 ? 3 : 2) && (
                  <div className={`w-12 h-1 rounded-full transition-all duration-700 ${
                    step > s ? 'bg-green-200' : 'bg-gray-100'
                  }`} />
                )}
              </div>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4 text-right">
             <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Booking For</div>
             <div className="text-sm font-bold text-gray-800 leading-none">{service?.name || 'Loading...'}</div>
          </div>
        </header>

        <main className="relative">
          <div className="bg-white rounded-[60px] p-12 lg:p-24 shadow-2xl shadow-black/[0.03] border border-white relative overflow-hidden transition-all duration-500 min-h-[600px] flex flex-col">
            {/* Glossy Overlay */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
            
            <div className="flex-1">
              <ErrorMessage message={error} />
              {renderStep()}
            </div>
          </div>
        </main>

        <footer className="mt-12 text-center">
           <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">Zilla © 2026 — Secure Slot Booking Engine</p>
        </footer>
      </div>
    </div>
  );
};

export default BookingWizard;
