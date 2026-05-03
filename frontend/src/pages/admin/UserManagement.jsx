import React, { useState, useEffect } from 'react';
import { Search, Mail, Shield, Trash2 } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import Card from '../../components/Card';
import Loader from '../../components/Loader';
import { adminService } from '@services/admin';

const ROLE_COLORS = {
  admin: 'text-red-600',
  organiser: 'text-blue-600',
  customer: 'text-gray-600',
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await adminService.getUsers();
      setUsers(res.data || []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateUser = async (user, data) => {
    await adminService.updateUser(user.id, data);
    setMessage('User updated.');
    fetchUsers();
  };

  const deleteUser = async (user) => {
    if (!window.confirm(`Delete ${user.email}? This will fail if they have linked bookings or services.`)) return;
    try {
      await adminService.deleteUser(user.id);
      setMessage('User deleted.');
      fetchUsers();
    } catch (err) {
      setMessage(err.response?.data?.error?.message || 'User has linked records and cannot be deleted.');
    }
  };

  const filtered = users.filter((u) =>
    (u.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.role || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout title="User Directory">
      <div className="flex flex-col gap-6 h-[calc(100vh-10rem)] overflow-y-auto pr-2 scrollbar-hide">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[300px] max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email or role..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <p className="text-sm text-gray-400 font-bold">{filtered.length} users</p>
        </div>
        {message && <div className="rounded-2xl border border-gray-100 bg-white px-5 py-3 text-xs font-black uppercase tracking-widest text-gray-500">{message}</div>}

        {isLoading ? <Loader /> : (
          <Card className="p-0 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length > 0 ? filtered.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold uppercase">
                          {(user.full_name || 'U')[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{user.full_name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {user.role === 'admin' ? <Shield className="w-4 h-4 text-red-500" /> : <Mail className="w-4 h-4 text-gray-400" />}
                        <select
                          value={user.role}
                          onChange={(e) => updateUser(user, { role: e.target.value })}
                          className={`rounded-xl border border-gray-100 bg-white px-3 py-2 text-xs font-bold capitalize ${ROLE_COLORS[user.role] || 'text-gray-600'}`}
                        >
                          <option value="customer">customer</option>
                          <option value="organiser">organiser</option>
                          <option value="admin">admin</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => updateUser(user, { is_verified: !user.is_verified })}
                        className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        user.is_verified ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}
                      >
                        {user.is_verified ? 'Verified' : 'Unverified'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => deleteUser(user)} className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-400 font-bold">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default UserManagement;
