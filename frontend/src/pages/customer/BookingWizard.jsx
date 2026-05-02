import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Users, CreditCard, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { bookingService } from '@services/booking';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';

const BookingWizard = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [bookingData, setBookingData] = useState({
    serviceId: serviceId,
    resourceId: null,
    date: new Date().toISOString().split('T')[0],
    time: null,
    capacity: 1,
    userDetails: {
      name: '',
      email: '',
      phone: ''
    }
  });

  const [resources, setResources] = useState([]);
  const [slots, setSlots] = useState([]);
  const [service, setService] = useState(null);

  useEffect(() => {
    // Fetch service details initially
    const init = async () => {
      setIsLoading(true);
      try {
        const res = await bookingService.getServices();
        const currentService = res.data.find(s => s.id === parseInt(serviceId));
        setService(currentService);
        
        const resResources = await bookingService.getResources(serviceId);
        setResources(resResources.data);
      } catch (err) {
        setError('Failed to load service details');
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [serviceId]);

  useEffect(() => {
    if (step === 2 && bookingData.date) {
      const fetchSlots = async () => {
        setIsLoading(true);
        try {
          const res = await bookingService.getSlots(serviceId, bookingData.date);
          setSlots(res.data);
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
    if (step === 4) {
      if (service?.price > 0) {
        setStep(5); // Payment
      } else {
        submitBooking();
      }
    } else {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const submitBooking = async () => {
    setIsLoading(true);
    try {
      const res = await bookingService.createBooking(bookingData);
      navigate('/confirmation', { state: { booking: res.data } });
    } catch (err) {
      setError('Failed to confirm booking');
    } finally {
      setIsLoading(false);
    }
  };

  const renderUnifiedSelection = () => {
    return (
      <div className="flex flex-col gap-10">
        {/* Step Header: "With" (Resource Selection) */}
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
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                  bookingData.resourceId === r.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  U{r.id}
                </div>
                <span className="font-semibold">{r.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Selection Area: Calendar and Slots */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: Date Picker */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Date picker</h3>
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
              {/* Simplistic Calendar UI Mockup */}
              <div className="flex items-center justify-between mb-6">
                <button className="p-2 hover:bg-gray-50 rounded-lg"><ChevronLeft className="w-5 h-5 text-gray-400" /></button>
                <span className="font-bold text-gray-800">{format(new Date(bookingData.date), 'MMMM yyyy')}</span>
                <button className="p-2 hover:bg-gray-50 rounded-lg"><ChevronRight className="w-5 h-5 text-gray-400" /></button>
              </div>
              <input
                type="date"
                value={bookingData.date}
                onChange={(e) => setBookingData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full p-4 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary outline-none mb-6"
              />
              <p className="text-sm text-gray-500 italic leading-relaxed">
                {service?.description}
              </p>
            </div>
          </div>

          {/* Right: Slots */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Slots</h3>
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex-1">
              <div className="grid grid-cols-2 gap-3 mb-8">
                {slots.map(slot => (
                  <button
                    key={slot.id}
                    disabled={!slot.available}
                    onClick={() => setBookingData(prev => ({ ...prev, time: slot.time }))}
                    className={`py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all ${
                      bookingData.time === slot.time
                        ? 'bg-primary border-primary text-white shadow-md'
                        : slot.available
                        ? 'border-gray-50 text-gray-700 hover:border-primary/30 hover:bg-primary/5'
                        : 'bg-gray-50 border-gray-50 text-gray-300 cursor-not-allowed'
                    }`}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>

              {/* Conditional Capacity Selector */}
              {service?.capacityEnabled !== false && (
                <div className="pt-6 border-t border-gray-50 mt-auto">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Number of people</p>
                  <div className="flex items-center gap-4 bg-gray-50 w-max rounded-xl p-1 border border-gray-100">
                    <button 
                      onClick={() => setBookingData(prev => ({ ...prev, capacity: Math.max(1, prev.capacity - 1) }))}
                      className="w-8 h-8 rounded-lg bg-white flex items-center justify-center font-bold text-gray-600 shadow-sm"
                    >-</button>
                    <span className="w-8 text-center font-bold text-gray-800">{bookingData.capacity}</span>
                    <button 
                      onClick={() => setBookingData(prev => ({ ...prev, capacity: prev.capacity + 1 }))}
                      className="w-8 h-8 rounded-lg bg-white flex items-center justify-center font-bold text-gray-600 shadow-sm"
                    >+</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button 
            disabled={!bookingData.resourceId || !bookingData.time} 
            onClick={handleNext}
            className="px-10 py-4 text-lg"
          >
            Continue to Details
          </Button>
        </div>
      </div>
    );
  };

  const renderStep = () => {
    if (step === 1) return renderUnifiedSelection();
    
    switch (step) {
      case 2: // Details (originally step 4)
        return (
          <div className="flex flex-col gap-6">
            <h2 className="text-xl font-bold">Your Details</h2>
            <div className="space-y-4">
              <Input
                label="Full Name"
                placeholder="John Doe"
                value={bookingData.userDetails.name}
                onChange={(e) => setBookingData(prev => ({ 
                  ...prev, 
                  userDetails: { ...prev.userDetails, name: e.target.value } 
                }))}
                required
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="john@example.com"
                value={bookingData.userDetails.email}
                onChange={(e) => setBookingData(prev => ({ 
                  ...prev, 
                  userDetails: { ...prev.userDetails, email: e.target.value } 
                }))}
                required
              />
              <Input
                label="Phone Number"
                placeholder="+1 234 567 890"
                value={bookingData.userDetails.phone}
                onChange={(e) => setBookingData(prev => ({ 
                  ...prev, 
                  userDetails: { ...prev.userDetails, phone: e.target.value } 
                }))}
                required
              />
            </div>
            <div className="flex justify-between mt-4">
              <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
              <Button 
                onClick={handleNext}
                disabled={!bookingData.userDetails.name || !bookingData.userDetails.email}
              >
                {service?.price > 0 ? 'Go to Payment' : 'Confirm Booking'}
              </Button>
            </div>
          </div>
        );
      case 3: // Payment (originally step 5)
        return (
          <div className="flex flex-col gap-6">
            <h2 className="text-xl font-bold">Payment</h2>
            <Card className="bg-gray-50 border-none">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">{service?.title}</span>
                  <span className="font-medium">${service?.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxes (5%)</span>
                  <span className="font-medium">${(service?.price * 0.05).toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${(service?.price * 1.05).toFixed(2)}</span>
                </div>
              </div>
            </Card>
            
            <div className="grid grid-cols-2 gap-4">
              {['Credit Card', 'Debit Card', 'UPI', 'PayPal'].map(method => (
                <button 
                  key={method}
                  className="p-4 border border-gray-200 rounded-xl text-sm font-medium hover:border-primary transition-all flex flex-col items-center gap-2"
                >
                  <CreditCard className="w-6 h-6 text-gray-400" />
                  {method}
                </button>
              ))}
            </div>

            <div className="flex justify-between mt-4">
              <Button variant="secondary" onClick={() => setStep(2)}>Back</Button>
              <Button isLoading={isLoading} onClick={submitBooking}>Pay & Confirm</Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-500 hover:text-primary mb-8 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <div className="flex items-center justify-center mb-12">
          {[1, 2, 3].filter(s => s < 3 || service?.price > 0).map((s) => (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  step === s ? 'bg-primary text-white scale-110 shadow-lg' : 
                  step > s ? 'bg-green-500 text-white' : 'bg-white text-gray-400 border border-gray-200'
                }`}>
                  {step > s ? <CheckCircle className="w-5 h-5" /> : s}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  {s === 1 ? 'Selection' : s === 2 ? 'Details' : 'Payment'}
                </span>
              </div>
              {s < (service?.price > 0 ? 3 : 2) && (
                <div className={`w-24 h-1 mx-4 rounded-full mt-[-18px] ${step > s ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="bg-white rounded-[40px] p-12 shadow-sm border border-gray-100">
          <ErrorMessage message={error} />
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default BookingWizard;
