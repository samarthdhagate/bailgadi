import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, MoreHorizontal, Calendar as CalendarIcon, Clock, Share2, Edit3, Trash2, Bell } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';
import MiniCalendar from '../../components/MiniCalendar';
import { organiserService } from '@services/organiser';

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, bookingsRes] = await Promise.all([
          organiserService.getServices(),
          organiserService.getBookings()
        ]);
        setAppointments(servicesRes.data || []);
        setBookings(bookingsRes.data || []);
      } catch (err) {
        setError('Failed to sync with database.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Compute real events for the mini calendar
  const realEvents = bookings.map(b => new Date(b.slot_start));
  const now = new Date();
  const nextMeeting = bookings
    .filter(b => new Date(b.slot_start) > now && b.status === 'confirmed')
    .sort((a, b) => new Date(a.slot_start) - new Date(b.slot_start))[0];

  const handleTogglePublish = async (id) => {
    try {
      const res = await organiserService.togglePublish(id);
      setAppointments(prev =>
        prev.map(app => app.id === id ? { ...app, is_published: res.data?.is_published } : app)
      );
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to update.');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}?`)) return;
    try {
      await organiserService.deleteService(id);
      setAppointments(prev => prev.filter(app => app.id !== id));
    } catch (err) {
      alert('Delete failed.');
    }
  };

  return (
    <DashboardLayout title="Overview">
      <div className="flex flex-col xl:flex-row gap-8 h-[calc(100vh-8rem)] overflow-hidden">
        
        {/* Left Column: Mini Calendar */}
        <div className="w-full xl:w-80 flex flex-col gap-6 flex-shrink-0">
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2">Calendar</h2>
          <MiniCalendar events={realEvents} />
          
          <div className="bg-primary/5 rounded-3xl p-6 border border-primary/10 relative overflow-hidden group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Bell className="w-4 h-4 animate-bounce" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[10px] font-black text-primary uppercase tracking-widest mb-0.5">Next Meeting</h4>
                {nextMeeting ? (
                  <p className="text-xs font-bold text-gray-700 truncate italic">
                    {nextMeeting.service_name} — {new Date(nextMeeting.slot_start).toLocaleDateString()}
                  </p>
                ) : (
                  <p className="text-xs font-bold text-gray-500 truncate italic">No upcoming meetings</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Middle Column: Appointment List */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-4 scrollbar-hide">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Your Services</h2>
            <div className="flex gap-2">
               <button className="p-2 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-primary transition-all shadow-sm">
                 <Filter className="w-4 h-4" />
               </button>
               <button onClick={() => navigate('/organiser/editor/new')} className="p-2 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:scale-110 active:scale-95 transition-all">
                 <Plus className="w-4 h-4" />
               </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {isLoading ? (
              <Loader />
            ) : error ? (
              <ErrorMessage message={error} />
            ) : appointments.length === 0 ? (
              <Card className="text-center py-20 border-2 border-dashed border-gray-100 bg-white/50 rounded-[48px]">
                <p className="text-gray-400 font-bold italic">No services found in database. Create your first one!</p>
                <Button onClick={() => navigate('/organiser/editor/new')} className="mt-6">Create New Service</Button>
              </Card>
            ) : (
              <div className="grid gap-4">
                {appointments.map((app) => (
                  <div key={app.id} className="group relative bg-white border border-gray-100 rounded-[32px] p-6 hover:shadow-2xl hover:shadow-black/5 transition-all duration-500">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {app.image ? (
                          <img src={app.image} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-2xl font-black text-gray-200">{(app.name || 'S')[0]}</span>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-black text-gray-800 truncate">{app.name}</h3>
                          {app.is_published && <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" title="Published" />}
                        </div>
                        <div className="flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-tighter">
                          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-primary" /> {app.duration_min}m</span>
                          <span className="flex items-center gap-1.5"><CalendarIcon className="w-3.5 h-3.5 text-primary" /> {app.booking_count || 0} Bookings</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                        <button onClick={() => navigate(`/organiser/editor/${app.id}`)} className="p-2.5 bg-gray-50 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"><Edit3 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(app.id, app.name)} className="p-2.5 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AppointmentList;
