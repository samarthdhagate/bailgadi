import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';
import { organiserService } from '@services/organiser';

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await organiserService.getAppointments();
        setAppointments(response.data);
      } catch (err) {
        setError('Failed to load appointments.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  return (
    <DashboardLayout title="Appointments">
      <div className="flex flex-col gap-8">
        {/* Top Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-4">
            <Button onClick={() => navigate('/organiser/editor/new')} className="bg-white text-gray-800 border-2 border-gray-100 hover:border-primary hover:text-primary px-8">
              New
            </Button>
            <div className="flex gap-2">
              <Button variant="secondary" className="px-6">Reporting</Button>
            </div>
          </div>
          
          <div className="relative flex-1 max-w-xl">
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search appointments..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-xl shadow-sm focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>
        </div>

        {/* Appointment List */}
        <div className="flex flex-col gap-4">
          {isLoading ? (
            <Loader />
          ) : error ? (
            <ErrorMessage message={error} />
          ) : appointments.length === 0 ? (
            <Card className="text-center py-20 border-2 border-dashed border-gray-100">
              <p className="text-gray-400">No appointments found. Click "New" to create one.</p>
            </Card>
          ) : (
            appointments.map((app) => (
              <Card key={app.id} className="p-6 hover:shadow-md transition-all relative overflow-hidden group">
                {/* Published Badge */}
                {app.status?.toLowerCase() === 'published' && (
                  <div className="absolute top-4 -right-10 bg-orange-100 text-orange-600 text-[10px] font-black uppercase px-12 py-1 rotate-45 shadow-sm border border-orange-200">
                    Published
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-8">
                  {/* Name & Duration */}
                  <div className="flex items-center gap-12 min-w-[300px]">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-1">{app.title}</h3>
                      <p className="text-sm font-bold text-red-500 uppercase tracking-tighter">
                        {app.duration} Min <span className="text-gray-400 font-medium lowercase">Duration</span>
                      </p>
                    </div>

                    {/* Resources */}
                    <div className="flex gap-2">
                      {(app.resources || ['A1', 'A2']).map((res, i) => (
                        <div key={i} className="w-10 h-10 rounded-lg border-2 border-gray-100 flex items-center justify-center font-bold text-xs text-gray-500 bg-gray-50">
                          {res}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Stats & Actions */}
                  <div className="flex items-center gap-10 flex-1 justify-end">
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-800">{app.bookings || 0} Meeting</p>
                      <p className="text-xs text-gray-400 font-medium">Upcoming</p>
                    </div>

                    <div className="flex gap-3">
                      <button className="px-6 py-2 rounded-lg border-2 border-gray-100 font-bold text-gray-600 hover:border-primary hover:text-primary transition-all">
                        Share
                      </button>
                      <button 
                        onClick={() => navigate(`/organiser/editor/${app.id}`)}
                        className="px-6 py-2 rounded-lg border-2 border-gray-100 font-bold text-gray-600 hover:border-primary hover:text-primary transition-all"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AppointmentList;
