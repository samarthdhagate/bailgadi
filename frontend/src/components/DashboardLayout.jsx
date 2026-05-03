import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, LayoutDashboard, Briefcase, FileText } from 'lucide-react';
import { useAuth } from '../context/useAuth';

const DashboardLayout = ({ children, title }) => {
  const { logout, user, role } = useAuth();
  const navigate = useNavigate();
  const displayName = user?.full_name || user?.name || 'User';

  const menuItems = {
    customer: [
      { label: 'Marketplace', icon: LayoutDashboard, path: '/dashboard' },
      { label: 'My Bookings', icon: Briefcase, path: '/bookings' },
    ],
    organiser: [
      { label: 'Overview', icon: LayoutDashboard, path: '/organiser' },
      { label: 'Services', icon: FileText, path: '/organiser/editor/new' },
    ],
    admin: [
      { label: 'System', icon: LayoutDashboard, path: '/admin' },
      { label: 'Directory', icon: User, path: '/admin/users' },
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden text-gray-900">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-100 hidden md:flex flex-col z-20">
        <div className="p-8 flex items-center gap-4">
          <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter">zilla</h2>
        </div>
        
        <nav className="flex-1 px-4 py-8 flex flex-col gap-2">
          {menuItems[role]?.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="flex items-center gap-4 px-6 py-4 text-gray-400 hover:text-primary hover:bg-gray-50 rounded-3xl transition-all group"
            >
              <item.icon className="w-5 h-5 group-hover:text-primary transition-colors" />
              <span className="font-bold uppercase tracking-widest text-[10px]">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-gray-100">
          <div className="w-full flex items-center gap-4 p-4 mb-4 bg-gray-50 rounded-[32px] border border-gray-100">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-xl">
              {displayName?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-gray-900 truncate">{displayName}</p>
              <p className="text-[10px] text-primary font-bold uppercase tracking-widest opacity-60">{role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-4 px-6 py-4 text-gray-400 hover:text-red-500 hover:bg-red-50/10 rounded-3xl transition-all font-bold uppercase tracking-widest text-[10px]"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-10 z-10 flex-shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-black text-gray-900 uppercase tracking-[0.4em]">{title}</h1>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => navigate('/organiser/reporting')}
              className="px-6 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest border border-gray-100 rounded-xl hover:border-primary hover:text-primary transition-all bg-gray-50"
            >
              Intelligence
            </button>
          </div>
        </header>
        
        <div className="flex-1 overflow-hidden p-10 bg-gray-50/30">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
