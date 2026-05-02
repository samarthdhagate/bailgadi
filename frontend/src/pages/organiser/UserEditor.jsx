import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import Button from '../../components/Button';

const UserEditor = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: 'Vipin Jindal',
    email: 'Vipin@jindal.com'
  });

  return (
    <DashboardLayout title="New User">
      <div className="flex flex-col gap-8 max-w-4xl">
        {/* Header Actions */}
        <div className="flex items-center gap-3 border-b border-gray-100 pb-6">
          <Button variant="secondary" onClick={() => navigate(-1)}>New</Button>
          <span className="font-bold text-gray-800 text-lg">User</span>
        </div>

        <div className="space-y-12 py-6">
          <div className="space-y-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Name</p>
            <div className="border-b-2 border-gray-100 focus-within:border-primary transition-colors pb-1 max-w-2xl">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-transparent outline-none text-2xl font-bold text-gray-700 italic"
              />
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email</p>
            <div className="border-b-2 border-gray-100 focus-within:border-primary transition-colors pb-1 max-w-2xl">
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-transparent outline-none text-2xl font-bold text-gray-700 italic underline"
              />
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-gray-50 flex justify-end">
          <Button className="px-12 py-3" onClick={() => navigate(-1)}>Save User</Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserEditor;
