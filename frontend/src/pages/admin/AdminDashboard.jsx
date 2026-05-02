import React, { useState, useEffect } from 'react';
import { Users, Calendar, CheckCircle, TrendingUp, Search, Filter, MoreHorizontal } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import Card from '../../components/Card';
import Loader from '../../components/Loader';
import { adminService } from '@services/admin';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [sRes, bRes] = await Promise.all([
          adminService.getStats(),
          adminService.getBookings()
        ]);
        setStats(sRes.data);
        setBookings(bRes.data);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Bookings', value: stats?.totalBookings, icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Active Services', value: stats?.activeServices, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Total Revenue', value: `$${stats?.revenue}`, icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <DashboardLayout title="Admin Overview">
      {isLoading ? <Loader /> : (
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map(stat => (
              <Card key={stat.label} className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                </div>
              </Card>
            ))}
          </div>

          {/* Recent Bookings Table */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Recent Bookings</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Search bookings..." 
                    className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm hover:bg-gray-50">
                  <Filter className="w-4 h-4 text-gray-400" /> Filter
                </button>
              </div>
            </div>

            <Card className="p-0 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Booking ID</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Service</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bookings.map(booking => (
                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-primary">{booking.id}</td>
                      <td className="px-6 py-4 text-gray-700">{booking.service}</td>
                      <td className="px-6 py-4 text-gray-700">{booking.user}</td>
                      <td className="px-6 py-4 text-gray-600">{booking.date}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                          booking.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                          booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-800">
                        {booking.amount > 0 ? `$${booking.amount}` : 'Free'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminDashboard;
