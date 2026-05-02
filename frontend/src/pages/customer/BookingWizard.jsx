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

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="flex flex-col gap-6">
            <h2 className="text-xl font-bold">Select a Professional</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {resources.map(r => (
                <button
                  key={r.id}
                  onClick={() => {
                    setBookingData(prev => ({ ...prev, resourceId: r.id }));
                    handleNext();
                  }}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    bookingData.resourceId === r.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-gray-100 hover:border-gray-200 bg-white'
                  }`}
                >
                  <p className="font-bold text-gray-800">{r.name}</p>
                  <p className="text-sm text-gray-500">{r.role}</p>
                </button>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="flex flex-col gap-6">
            <h2 className="text-xl font-bold">Choose Date & Time</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <label className="text-sm font-medium mb-2 block">Date</label>
                <input
                  type="date"
                  value={bookingData.date}
                  onChange={(e) => setBookingData(prev => ({ ...prev, date: e.target.value }))}
                  className="input-field"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Available Slots</label>
                {isLoading ? <Loader /> : (
                  <div className="grid grid-cols-3 gap-2">
                    {slots.map(slot => (
                      <button
                        key={slot.id}
                        disabled={!slot.available}
                        onClick={() => setBookingData(prev => ({ ...prev, time: slot.time }))}
                        className={`p-2 text-xs rounded-lg border transition-all ${
                          bookingData.time === slot.time
                            ? 'bg-primary text-white border-primary'
                            : slot.available
                            ? 'bg-white text-gray-700 border-gray-200 hover:border-primary'
                            : 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed'
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-between mt-4">
              <Button variant="secondary" onClick={handleBack}>Back</Button>
              <Button disabled={!bookingData.time} onClick={handleNext}>Next</Button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="flex flex-col gap-6">
            <h2 className="text-xl font-bold">Number of People</h2>
            <div className="flex items-center gap-6 justify-center p-8 bg-gray-50 rounded-xl">
              <button 
                onClick={() => setBookingData(prev => ({ ...prev, capacity: Math.max(1, prev.capacity - 1) }))}
                className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-2xl border border-gray-100"
              >-</button>
              <span className="text-4xl font-bold w-12 text-center">{bookingData.capacity}</span>
              <button 
                onClick={() => setBookingData(prev => ({ ...prev, capacity: prev.capacity + 1 }))}
                className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-2xl border border-gray-100"
              >+</button>
            </div>
            <div className="flex justify-between mt-4">
              <Button variant="secondary" onClick={handleBack}>Back</Button>
              <Button onClick={handleNext}>Next</Button>
            </div>
          </div>
        );
      case 4:
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
              <Button variant="secondary" onClick={handleBack}>Back</Button>
              <Button 
                onClick={handleNext}
                disabled={!bookingData.userDetails.name || !bookingData.userDetails.email}
              >
                {service?.price > 0 ? 'Go to Payment' : 'Confirm Booking'}
              </Button>
            </div>
          </div>
        );
      case 5:
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
              <Button variant="secondary" onClick={handleBack}>Back</Button>
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
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-500 hover:text-primary mb-6 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3, 4, 5].filter(s => s < 5 || service?.price > 0).map((s) => (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  step === s ? 'bg-primary text-white scale-110 shadow-lg' : 
                  step > s ? 'bg-green-500 text-white' : 'bg-white text-gray-400 border border-gray-200'
                }`}>
                  {step > s ? <CheckCircle className="w-5 h-5" /> : s}
                </div>
              </div>
              {s < (service?.price > 0 ? 5 : 4) && (
                <div className={`flex-1 h-1 mx-2 rounded-full ${step > s ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <Card className="p-8">
          <ErrorMessage message={error} />
          {renderStep()}
        </Card>
      </div>
    </div>
  );
};

export default BookingWizard;
