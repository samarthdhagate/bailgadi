import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, ArrowRight } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';
import { bookingService } from '@services/booking';

const CustomerDashboard = () => {
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await bookingService.getServices();
        setServices(response.data);
      } catch (err) {
        setError('Failed to load services. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  return (
    <DashboardLayout title="Available Services">
      {isLoading ? (
        <Loader />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card key={service.id} className="p-0 overflow-hidden flex flex-col hover:shadow-md transition-shadow group">
              <div className="h-48 overflow-hidden">
                <img 
                  src={service.image} 
                  alt={service.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{service.title}</h3>
                <div className="flex flex-col gap-2 mb-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{service.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{service.duration} mins</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-6 line-clamp-2">
                  {service.description}
                </p>
                <div className="mt-auto flex items-center justify-between">
                  <span className="text-lg font-bold text-primary">
                    {service.price > 0 ? `$${service.price}` : 'Free'}
                  </span>
                  <Button onClick={() => navigate(`/booking/${service.id}`)}>
                    Book Now
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default CustomerDashboard;
