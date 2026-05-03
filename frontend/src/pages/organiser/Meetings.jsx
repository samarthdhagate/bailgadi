import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, Filter, X, Calendar as CalendarIcon, Clock, User, Trash2 } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import Card from '../../components/Card';
import Loader from '../../components/Loader';
import { organiserService } from '@services/organiser';

const Meetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchMeetings = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await organiserService.getMeetings();
      setMeetings(res.data || []);
    } catch (err) {
      console.error("Meetings fetch error:", err);
      setError('Failed to sync with database.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await organiserService.updateMeetingStatus(id, status);
      await fetchMeetings();
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  const filteredMeetings = meetings.filter(m => 
    (m.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.service_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout title="Meetings">
      <div className="flex flex-col gap-8 h-[calc(100vh-10rem)] overflow-y-auto pr-2 scrollbar-hide pb-20">
        {/* Header & Filter */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-6 sticky top-0 bg-white/80 backdrop-blur-md z-20">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-black text-gray-800 tracking-tighter uppercase">System Meetings</h1>
          </div>
          
          <div className="relative w-96">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter meetings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-xs font-bold"
            />
          </div>
        </div>

        {isLoading ? (
          <Loader />
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-8 rounded-3xl text-xs font-black uppercase tracking-widest border border-red-100">{error}</div>
        ) : filteredMeetings.length === 0 ? (
          <div className="text-center py-32 bg-gray-50/50 rounded-[48px] border-2 border-dashed border-gray-100">
            <CalendarIcon className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-black text-sm uppercase tracking-widest italic">No meetings found in database.</p>
          </div>
        ) : (
          <Card className="p-0 overflow-hidden border-none shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Customer</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Service</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Scheduled For</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Duration</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredMeetings.map((meeting) => (
                    <tr key={meeting.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-xs">
                            {meeting.customer_name ? meeting.customer_name[0] : 'U'}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">{meeting.customer_name}</p>
                            <p className="text-[10px] text-gray-400">{meeting.customer_email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-gray-100 rounded-lg text-[10px] font-black text-gray-600 uppercase tracking-widest">{meeting.service_name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-gray-700">{new Date(meeting.slot_start).toLocaleDateString()}</span>
                          <span className="text-[10px] font-medium text-gray-400">{new Date(meeting.slot_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-gray-500">
                        {meeting.duration_min} Mins
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative group/status w-max">
                          <button className={`flex items-center gap-2 px-4 py-1.5 rounded-lg border-2 font-black text-[10px] uppercase tracking-widest transition-all ${
                            meeting.status === 'confirmed' ? 'border-green-100 text-green-600 bg-green-50' : 
                            'border-yellow-100 text-yellow-600 bg-yellow-50'
                          }`}>
                            {meeting.status}
                            <ChevronDown className="w-3 h-3" />
                          </button>
                          
                          <div className="absolute left-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl opacity-0 group-hover/status:opacity-100 pointer-events-none group-hover/status:pointer-events-auto transition-all z-30 w-32 overflow-hidden">
                            {[
                              { label: 'Confirmed', value: 'confirmed' },
                              { label: 'Cancelled', value: 'cancelled' },
                              { label: 'No Show', value: 'no_show' }
                            ].map(status => (
                              <button 
                                key={status.value}
                                onClick={() => handleStatusChange(meeting.id, status.value)}
                                className="w-full text-left px-4 py-3 text-[10px] font-black uppercase text-gray-400 hover:bg-gray-50 hover:text-primary transition-colors"
                              >
                                {status.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Meetings;
