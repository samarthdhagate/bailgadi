import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Calendar, User, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import TopCalendar from './TopCalendar';

const DashboardLayout = ({ children, title }) => {
  const { logout, user, role } = useAuth();
  const navigate = useNavigate();

  const menuItems = {
    customer: [
      { label: 'Dashboard', icon: Calendar, path: '/dashboard' },
      { label: 'My Bookings', icon: User, path: '/bookings' },
    ],
    organiser: [
      { label: 'Appointments', icon: Calendar, path: '/organiser' },
    ],
    admin: [
      { label: 'Dashboard', icon: Calendar, path: '/admin' },
      { label: 'Users', icon: User, path: '/admin/users' },
    ]
  };

  // Mock events for the top calendar
  const mockEvents = [
    new Date(),
    new Date(Date.now() + 86400000 * 2), // 2 days later
    new Date(Date.now() - 86400000 * 3), // 3 days ago
    new Date(Date.now() + 86400000 * 5)  // 5 days later
  ];

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col z-20">
        <div className="p-6 flex items-center gap-3">
          <img src="/zilla_logo.png" alt="Zilla" className="w-10 h-10" />
          <h2 className="text-2xl font-bold text-primary tracking-tighter">zilla</h2>
        </div>
        
        <nav className="flex-1 px-4 py-4 flex flex-col gap-1">
          {menuItems[role]?.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
            >
              <item.icon className="w-5 h-5 text-gray-400" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div
            className="w-full flex items-center gap-3 px-4 py-3 mb-2 hover:bg-gray-50 rounded-xl transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold transition-all">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500 truncate capitalize">{role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Calendar - Now above everything in the main view */}
        <TopCalendar events={mockEvents} />

        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => navigate('/organiser/reporting')}
              className="px-4 py-1.5 text-sm font-bold text-gray-600 border border-gray-100 rounded-lg hover:border-primary hover:text-primary transition-all"
            >
              Reporting
            </button>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50/30">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
