import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Share2, MoreVertical, ToggleLeft, ToggleRight } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Loader from '../../components/Loader';
import { organiserService } from '@services/organiser';

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await organiserService.getAppointments();
        setAppointments(res.data);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <DashboardLayout title="My Appointment Types">
      <div className="flex justify-between items-center mb-8">
        <p className="text-gray-500">Manage your services and availability</p>
        <Button onClick={() => navigate('/organiser/editor/new')} className="flex items-center gap-2">
          <Plus className="w-5 h-5" /> New Appointment Type
        </Button>
      </div>

      {isLoading ? <Loader /> : (
        <div className="grid grid-cols-1 gap-4">
          {appointments.map(app => (
            <Card key={app.id} className="flex items-center justify-between hover:border-primary transition-colors group">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {app.duration}m
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">{app.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{app.resources.join(', ')}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span>{app.bookings} bookings</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 mr-4">
                  <span className={`text-xs font-bold uppercase ${app.status === 'Published' ? 'text-green-600' : 'text-gray-400'}`}>
                    {app.status}
                  </span>
                  {app.status === 'Published' ? <ToggleRight className="text-green-600 w-8 h-8" /> : <ToggleLeft className="text-gray-300 w-8 h-8" />}
                </div>
                <Button variant="outline" className="p-2" onClick={() => navigate(`/organiser/editor/${app.id}`)}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button variant="outline" className="p-2">
                  <Share2 className="w-4 h-4" />
                </Button>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <MoreVertical className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default AppointmentList;
