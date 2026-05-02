import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import Button from '../../components/Button';
import { ChevronDown } from 'lucide-react';

const ResourceEditor = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: 'Court 1',
    capacity: '2',
    linkedResources: ['Court 2', 'Court 3', 'Court 4']
  });

  return (
    <DashboardLayout title="New Resource">
      <div className="flex flex-col gap-8 max-w-4xl">
        {/* Header Actions */}
        <div className="flex items-center gap-3 border-b border-gray-100 pb-6">
          <Button variant="secondary" onClick={() => navigate(-1)}>New</Button>
          <span className="font-bold text-gray-800 text-lg">Resource</span>
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
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Capacity</p>
            <div className="border-b-2 border-gray-100 focus-within:border-primary transition-colors pb-1 w-64">
              <input
                type="text"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="w-full bg-transparent outline-none text-2xl font-bold text-gray-700 italic"
              />
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Linked resources</p>
            <div className="relative w-64 group">
              <div className="flex items-center justify-between border-2 border-gray-100 rounded-xl px-4 py-3 bg-white hover:border-primary transition-all cursor-pointer">
                <span className="text-sm font-bold text-gray-600">Court 2</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
              
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-all z-10 overflow-hidden">
                {formData.linkedResources.map(res => (
                  <button key={res} className="w-full text-left px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors border-b border-gray-50 last:border-0">
                    {res}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-gray-50 flex justify-end">
          <Button className="px-12 py-3" onClick={() => navigate(-1)}>Save Resource</Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ResourceEditor;
