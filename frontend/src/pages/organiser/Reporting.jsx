import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, CheckSquare, Square, X } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import Card from '../../components/Card';
import Loader from '../../components/Loader';
import { organiserService } from '@services/organiser';

const Reporting = () => {
  const [meetings, setMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await organiserService.getMeetings();
        setMeetings(res.data);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <DashboardLayout title="Reporting">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-gray-800">Meetings</h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold text-primary">
              Appointments <X className="w-3 h-3 cursor-pointer" />
            </div>
          </div>
          
          <div className="relative w-96 group">
            <input
              type="text"
              placeholder="Dental care"
              className="w-full pl-6 pr-4 py-2.5 bg-white border-2 border-gray-100 rounded-xl outline-none focus:border-primary transition-all text-sm font-bold italic"
            />
          </div>
        </div>

        {/* Meetings Table */}
        <Card className="p-0 overflow-hidden border-none shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 w-12">
                    <Square className="w-4 h-4 text-gray-300" />
                  </th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-400">Name</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-400 text-center">Time</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-400">Resource</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-400 text-right">Answers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  <tr><td colSpan="5" className="py-20"><Loader /></td></tr>
                ) : meetings.map((meeting) => (
                  <tr key={meeting.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-6">
                      <Square className="w-4 h-4 text-gray-200 group-hover:text-primary" />
                    </td>
                    <td className="px-6 py-6 font-bold text-gray-700 italic">{meeting.name}</td>
                    <td className="px-6 py-6 text-sm text-gray-800 font-bold text-center">{meeting.time}</td>
                    <td className="px-6 py-6 text-sm text-gray-500 font-bold">{meeting.resource || '-'}</td>
                    <td className="px-6 py-6 text-sm text-primary font-bold text-right tracking-tight">{meeting.answers}</td>
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

export default Reporting;
