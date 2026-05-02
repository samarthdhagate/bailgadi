import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, ArrowRight, Search } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';
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
<<<<<<< HEAD
        setServices(response.data);
        setFilteredServices(response.data);
=======
        const data = response.data || [];
        setServices(data);
        setFilteredServices(data);
>>>>>>> 6af9674e4e07653f1a53c81caa8afe0546e9dba3
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
    <DashboardLayout title="Available Services">
      <div className="flex flex-col gap-8">
        {/* Header Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative w-full max-w-md">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search appointments..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Type</label>
              <select 
                className="bg-white border border-gray-200 px-4 py-3 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-primary min-w-[150px]"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-800">Appointments</h2>

        {isLoading ? (
          <Loader />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
            <p className="text-gray-400">No appointments found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {filteredServices.map((service) => (
              <Card key={service.id} className="p-8 hover:shadow-md transition-shadow group flex flex-col gap-6 cursor-pointer" onClick={() => navigate(`/booking/${service.id}`)}>
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Left: Icon placeholder */}
                  <div className="w-full md:w-48 h-48 rounded-2xl overflow-hidden shadow-inner flex-shrink-0 bg-gradient-to-br from-primary/10 to-primary/5 border border-gray-100 flex items-center justify-center">
                    <span className="text-6xl font-bold text-primary/30">{(service.name || 'S')[0]}</span>
                  </div>

                  {/* Right: Details */}
                  <div className="flex-1 flex flex-col">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">{service.name}</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Provider</p>
                        <span className="text-sm font-medium text-gray-700 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
                          {service.provider_name || 'Unknown'}
                        </span>
                      </div>

                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Duration</p>
                        <p className="text-gray-700 font-medium flex items-center gap-2">
                          <Clock className="w-4 h-4 text-primary" />
                          {service.duration_min} mins
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom: Capacity & Payment Info */}
                <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Capacity: {service.capacity || 1}</span>
                    {service.advance_payment && (
                      <span className="text-primary font-medium">Paid booking</span>
                    )}
                  </div>
                  <Button onClick={(e) => { e.stopPropagation(); navigate(`/booking/${service.id}`); }}>
                    Book Now
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CustomerDashboard;
