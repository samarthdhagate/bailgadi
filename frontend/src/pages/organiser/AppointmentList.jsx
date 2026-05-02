import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, MoreHorizontal, Calendar as CalendarIcon, Clock, Share2, Edit3, Trash2, Bell } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';
import MiniCalendar from '../../components/MiniCalendar';
import ChatbotFrame from '../../components/ChatbotFrame';
import { organiserService } from '@services/organiser';

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Mock events for the mini calendar
  const mockEvents = [
    new Date(Date.now() + 86400000 * 1), // Tomorrow
    new Date(Date.now() + 86400000 * 3), 
    new Date(Date.now() + 86400000 * 6)  
  ];

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await organiserService.getServices();
        setAppointments(response.data || []);
      } catch (err) {
        setError('Failed to load appointments.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, []);

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

  return (
    <DashboardLayout title="Overview">
      <div className="flex flex-col xl:flex-row gap-8 h-full min-h-[calc(100vh-16rem)]">
        
        {/* Left Column: Mini Calendar */}
        <div className="w-full xl:w-80 flex flex-col gap-6">
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2">Calendar</h2>
          <MiniCalendar events={mockEvents} />
          
          <div className="bg-primary/5 rounded-3xl p-6 border border-primary/10 relative overflow-hidden group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Bell className="w-4 h-4 animate-bounce" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[10px] font-black text-primary uppercase tracking-widest mb-0.5">Next Meeting</h4>
                <p className="text-xs font-bold text-gray-700 truncate italic">Consultation — Tomorrow, 2:00 PM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Column: Appointment List */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Upcoming Appointments</h2>
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
              <Card className="text-center py-20 border-2 border-dashed border-gray-100 bg-white/50">
                <p className="text-gray-400 font-bold italic">No appointments found. Start by creating one!</p>
                <Button onClick={() => navigate('/organiser/editor/new')} className="mt-6">Create New</Button>
              </Card>
            ) : (
              <div className="grid gap-4">
                {appointments.map((app) => (
                  <div key={app.id} className="group relative bg-white border border-gray-100 rounded-[32px] p-6 hover:shadow-2xl hover:shadow-black/5 transition-all duration-500">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0">
                        {app.image ? (
                          <img src={app.image} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-200">
                            <CalendarIcon className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-black text-gray-800 truncate">{app.name}</h3>
                          {app.is_published && <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" title="Published" />}
                        </div>
                        <div className="flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-tighter">
                          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-primary" /> {app.duration_min}m</span>
                          <span className="flex items-center gap-1.5"><CalendarIcon className="w-3.5 h-3.5 text-primary" /> {app.bookings || 0} Bookings</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                        <button className="p-2.5 bg-gray-50 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"><Share2 className="w-4 h-4" /></button>
                        <button onClick={() => navigate(`/organiser/editor/${app.id}`)} className="p-2.5 bg-gray-50 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"><Edit3 className="w-4 h-4" /></button>
                        <button className="p-2.5 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Chatbot */}
        <div className="w-full xl:w-96 flex flex-col gap-6 sticky top-0 h-[calc(100vh-12rem)]">
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2">Assistant</h2>
          <div className="flex-1 min-h-0">
            <ChatbotFrame />
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default AppointmentList;
