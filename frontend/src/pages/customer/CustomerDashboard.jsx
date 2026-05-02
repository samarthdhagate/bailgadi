import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, ArrowRight, Search, Filter, Sparkles, Calendar as CalendarIcon } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';
import MiniCalendar from '../../components/MiniCalendar';
import ChatbotFrame from '../../components/ChatbotFrame';
import { bookingService } from '@services/booking';

const CustomerDashboard = () => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await bookingService.getServices();
        const data = response.data || [];
        setServices(data);
        setFilteredServices(data);
      } catch (err) {
        setError('Failed to load services. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  useEffect(() => {
    let result = services;
    if (searchTerm) {
      result = result.filter(s => 
        (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.provider_name || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (typeFilter !== 'all') {
      result = result.filter(s => 
        typeFilter === 'free' ? !s.advance_payment : s.advance_payment
      );
    }
    setFilteredServices(result);
  }, [searchTerm, typeFilter, services]);

  return (
    <DashboardLayout title="Marketplace">
      <div className="flex flex-col xl:flex-row gap-8 h-full min-h-[calc(100vh-16rem)]">
        
        {/* Left Column: Mini Calendar */}
        <div className="w-full xl:w-80 flex flex-col gap-6">
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2">Your Schedule</h2>
          <MiniCalendar />
          
          <div className="bg-primary/5 rounded-[30px] p-8 border border-primary/10 relative overflow-hidden group">
            <Sparkles className="w-12 h-12 text-primary/10 absolute -right-2 -top-2 rotate-12 group-hover:scale-110 transition-transform" />
            <h4 className="text-sm font-black text-primary uppercase tracking-widest mb-2">Pro Tip</h4>
            <p className="text-xs font-bold text-gray-500 italic leading-relaxed">
              Book your appointments early in the week to get the best slots with top providers.
            </p>
          </div>
        </div>

        {/* Middle Column: Services List */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Available Services</h2>
            
            <div className="flex items-center gap-3">
              <div className="relative flex-1 md:w-64">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-bold shadow-sm focus:border-primary/30 outline-none transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select 
                className="bg-white border border-gray-100 px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm outline-none focus:border-primary/30"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {isLoading ? (
              <Loader />
            ) : error ? (
              <ErrorMessage message={error} />
            ) : filteredServices.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-gray-100">
                <p className="text-gray-400 font-bold italic">No services found matching your criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {filteredServices.map((service) => (
                  <Card 
                    key={service.id} 
                    className="p-8 hover:shadow-2xl hover:shadow-black/5 transition-all duration-500 group flex flex-col gap-6 cursor-pointer border-transparent hover:border-primary/10" 
                    onClick={() => navigate(`/booking/${service.id}`)}
                  >
                    <div className="flex flex-col md:flex-row gap-8">
                      <div className="w-full md:w-48 h-48 rounded-3xl overflow-hidden shadow-inner flex-shrink-0 bg-gray-50 border border-gray-100 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                        {service.image ? (
                          <img src={service.image} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-6xl font-black text-gray-200">{(service.name || 'S')[0]}</span>
                        )}
                      </div>

                      <div className="flex-1 flex flex-col justify-center">
                        <div className="flex items-center justify-between mb-4">
                           <h3 className="text-2xl font-black text-gray-800 tracking-tighter group-hover:text-primary transition-colors">{service.name}</h3>
                           <div className="px-3 py-1 bg-gray-50 rounded-lg text-[10px] font-black text-gray-400 uppercase tracking-widest border border-gray-100">
                             {service.advance_payment ? 'Premium' : 'Free'}
                           </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-8">
                          <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Provider</p>
                            <span className="text-sm font-black text-gray-700 italic flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-primary/20" />
                              {service.provider_name || 'Verified Partner'}
                            </span>
                          </div>

                          <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Timing</p>
                            <p className="text-sm font-black text-gray-700 italic flex items-center gap-2">
                              <Clock className="w-4 h-4 text-primary" />
                              {service.duration_min} mins
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                      <div className="flex items-center gap-4 text-[10px] font-black text-gray-300 uppercase tracking-widest">
                        <span>Capacity: {service.capacity || 1} Person</span>
                        {service.advance_payment && (
                          <span className="text-primary">Instant Booking</span>
                        )}
                      </div>
                      <Button onClick={(e) => { e.stopPropagation(); navigate(`/booking/${service.id}`); }} className="px-10 py-3 rounded-2xl shadow-lg shadow-primary/20">
                        Book Now
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Chatbot */}
        <div className="w-full xl:w-96 flex flex-col gap-6 sticky top-0 h-[calc(100vh-12rem)]">
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2">Zilla Assistant</h2>
          <div className="flex-1 min-h-0">
            <ChatbotFrame />
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default CustomerDashboard;
