import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const existingBooking = location.state?.reschedulingBooking;
  
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRescheduling, setIsRescheduling] = useState(!!existingBooking);
  
  const [bookingData, setBookingData] = useState({
    serviceId: serviceId,
    resourceId: existingBooking?.resourceId || null,
    date: existingBooking?.date || new Date().toISOString().split('T')[0],
    time: existingBooking?.time || null,
    capacity: existingBooking?.capacity || 1,
    userDetails: existingBooking?.userDetails || {
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
    if (step === 1 && bookingData.date) {
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
    if (isRescheduling && step === 1) {
      // If rescheduling, skip details and payment
      submitBooking();
      return;
    }

    if (step === 2) {
      if (service?.price > 0) {
        setStep(3); // Payment
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
      let res;
      if (isRescheduling && existingBooking?.id) {
        res = await bookingService.rescheduleBooking(existingBooking.id, bookingData);
      } else {
        res = await bookingService.createBooking(bookingData);
      }
      navigate('/confirmation', { state: { booking: res.data, isRescheduling } });
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
            {isRescheduling ? 'Confirm Reschedule' : 'Continue to Details'}
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
          <div className="flex flex-col gap-8 max-w-4xl mx-auto">
            <div className="border-b border-gray-100 pb-6">
              <h2 className="text-3xl font-bold text-gray-800">Details</h2>
              <p className="text-gray-500 mt-2">Please provide your contact information and answer a few questions.</p>
            </div>

            <div className="space-y-8 py-4">
              {/* Standard Fields */}
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
                    placeholder="+1 234 567 890"
                    value={bookingData.userDetails.phone}
                    onChange={(e) => setBookingData(prev => ({ 
                      ...prev, 
                      userDetails: { ...prev.userDetails, phone: e.target.value } 
                    }))}
                    required
                  />
                </div>
              </div>

              {/* Dynamic Questions from Organiser */}
              {service?.questions?.map((q) => (
                <div key={q.id} className="grid grid-cols-1 md:grid-cols-3 items-start gap-4">
                  <label className="font-bold text-gray-700 pt-3">{q.label}{q.required && '*'}</label>
                  <div className="md:col-span-2">
                    {q.type === 'textarea' ? (
                      <textarea
                        className="input-field min-h-[120px]"
                        placeholder={`Enter ${q.label.toLowerCase()}...`}
                        required={q.required}
                        value={bookingData.userDetails[q.id] || ''}
                        onChange={(e) => setBookingData(prev => ({ 
                          ...prev, 
                          userDetails: { ...prev.userDetails, [q.id]: e.target.value } 
                        }))}
                      />
                    ) : (
                      <Input
                        placeholder={`Enter ${q.label.toLowerCase()}...`}
                        required={q.required}
                        value={bookingData.userDetails[q.id] || ''}
                        onChange={(e) => setBookingData(prev => ({ 
                          ...prev, 
                          userDetails: { ...prev.userDetails, [q.id]: e.target.value } 
                        }))}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center gap-4 pt-10 border-t border-gray-50">
              <Button 
                onClick={handleNext}
                disabled={!bookingData.userDetails.name || !bookingData.userDetails.email}
                className="px-16 py-4 text-lg min-w-[250px]"
              >
                {service?.price > 0 ? 'Proceed to payment' : 'Confirm'}
              </Button>
              <button 
                onClick={() => setStep(1)}
                className="text-gray-400 hover:text-primary font-medium transition-colors"
              >
                Go back to selection
              </button>
            </div>
          </div>
        );
      case 3: // Payment (originally step 5)
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
            {/* Left: Payment Method Selection */}
            <div className="lg:col-span-2 space-y-10">
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">Choose a payment method</h3>
                <div className="space-y-6">
                  {/* Credit Card Option */}
                  <div className="space-y-6">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input type="radio" name="paymentMethod" defaultChecked className="w-5 h-5 accent-primary" />
                      <span className="font-bold text-gray-700 group-hover:text-primary transition-colors">Credit Card</span>
                    </label>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-8">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-500 mb-2">Name on Card</label>
                        <Input placeholder="John Doe" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-500 mb-2">Card Number</label>
                        <Input placeholder="•••• •••• •••• ••••" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-500 mb-2">Expiration Date</label>
                        <Input placeholder="MM / YY" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-500 mb-2">Security Code</label>
                        <Input placeholder="CVV" />
                      </div>
                    </div>
                  </div>

                  {/* Other Options (Placeholders) */}
                  {['Debit Card', 'UPI Pay', 'PayPal'].map(method => (
                    <label key={method} className="flex items-center gap-3 cursor-pointer group pl-0">
                      <input type="radio" name="paymentMethod" className="w-5 h-5 accent-primary" />
                      <span className="font-bold text-gray-700 group-hover:text-primary transition-colors">{method}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-gray-50">
                <button 
                  onClick={() => setStep(2)}
                  className="text-gray-400 hover:text-primary font-medium transition-colors"
                >
                  Go back to details
                </button>
              </div>
            </div>

            {/* Right: Order Summary */}
            <div>
              <Card className="p-8 sticky top-8">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Order Summary</h3>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-800 font-medium">{service?.title}</span>
                    <span className="font-bold text-gray-800">${service?.price}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-medium text-gray-800">${service?.price}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Taxes</span>
                    <span className="font-medium text-gray-800">${(service?.price * 0.1).toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 mb-8 flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-800">Total</span>
                  <span className="text-2xl font-black text-primary">${(service?.price * 1.1).toFixed(2)}</span>
                </div>

                <Button 
                  isLoading={isLoading} 
                  onClick={submitBooking}
                  className="w-full py-4 text-lg"
                >
                  Pay Now
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
