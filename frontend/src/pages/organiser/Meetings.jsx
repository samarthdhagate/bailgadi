import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, Filter, X } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { organiserService } from '@services/organiser';

const Meetings = () => {
  const [meetings, setMeetings] = useState([
    { id: 1, subject: 'Cavity', appointment: 'Dental care', bookedBy: 'Vipin', resource: '', start: 'Dec 12 4:00', end: 'Dec 12 4:30', capacity: '', status: 'Booked' },
    { id: 2, subject: 'Routine', appointment: 'Dental care', bookedBy: 'Mayur', resource: '', start: 'Dec 15 4:00', end: 'Dec 15 4:30', capacity: '', status: 'Request' }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <DashboardLayout title="Meetings">
      <div className="flex flex-col gap-8">
        {/* Header & Filter */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-gray-800">Meetings</h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold text-primary">
              Dental care <X className="w-3 h-3 cursor-pointer" />
            </div>
          </div>
          
          <div className="relative w-96">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search meetings..."
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
            />
          </div>
        </div>

        {/* Meetings Table */}
        <Card className="p-0 overflow-hidden border-none shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Subject</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Appointment</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Booked by</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Resource</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Start</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">End</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">capacity</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {meetings.map((meeting) => (
                  <tr key={meeting.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-700 italic">{meeting.subject}</td>
                    <td className="px-6 py-4 text-sm text-red-500 font-bold">{meeting.appointment}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{meeting.bookedBy}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">{meeting.resource || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{meeting.start}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{meeting.end}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">{meeting.capacity || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="relative group w-max">
                        <button className={`flex items-center gap-2 px-4 py-1.5 rounded-lg border-2 font-bold text-xs transition-all ${
                          meeting.status === 'Booked' ? 'border-gray-100 text-gray-600 bg-gray-50' : 
                          'border-primary/20 text-primary bg-primary/5'
                        }`}>
                          {meeting.status}
                          <ChevronDown className="w-3 h-3" />
                        </button>
                        
                        {/* Dropdown Menu (Simplified for UI) */}
                        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all z-10 w-32 overflow-hidden">
                          {['Request', 'Booked', 'Cancelled'].map(status => (
                            <button 
                              key={status}
                              className="w-full text-left px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors"
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Meetings;
