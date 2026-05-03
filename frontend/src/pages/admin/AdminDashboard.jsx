import React, { useEffect, useMemo, useState } from 'react';
import {
  Users, Calendar, CheckCircle, TrendingUp, Search, Trash2, Eye,
  Clock, Pencil, Save, X, Shield, CreditCard, RefreshCw
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Loader from '../../components/Loader';
import SlotManager from '../../components/SlotManager';
import AdminBookingCalendar from '../../components/AdminBookingCalendar';
import { adminService } from '@services/admin';

const STATUS_COLORS = {
  published: 'bg-green-100 text-green-700',
  draft: 'bg-yellow-100 text-yellow-700',
  unpublished: 'bg-red-100 text-red-700',
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  rescheduled: 'bg-blue-100 text-blue-700',
  no_show: 'bg-gray-200 text-gray-700',
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('services');
  const [stats, setStats] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookingView, setBookingView] = useState('list');
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [slotFacility, setSlotFacility] = useState(null);
  const [editingFacility, setEditingFacility] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const loadData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [sRes, fRes, bRes, uRes] = await Promise.all([
        adminService.getStats(),
        adminService.getFacilities(),
        adminService.getBookings(),
        adminService.getUsers(),
      ]);
      setStats(sRes?.data || {});
      setFacilities(fRes?.data || []);
      setBookings(bRes?.data || []);
      setUsers(uRes?.data || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to sync with database.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!successMsg) return undefined;
    const timer = setTimeout(() => setSuccessMsg(''), 3000);
    return () => clearTimeout(timer);
  }, [successMsg]);

  const filteredFacilities = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return facilities.filter((f) =>
      (f.name || '').toLowerCase().includes(q) ||
      (f.type || '').toLowerCase().includes(q) ||
      (f.organiser_name || '').toLowerCase().includes(q)
    );
  }, [facilities, searchTerm]);

  const filteredBookings = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return bookings.filter((b) =>
      (b.service_name || '').toLowerCase().includes(q) ||
      (b.customer_name || '').toLowerCase().includes(q) ||
      (b.customer_email || '').toLowerCase().includes(q) ||
      (b.status || '').toLowerCase().includes(q)
    );
  }, [bookings, searchTerm]);

  const filteredUsers = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return users.filter((u) =>
      (u.full_name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.role || '').toLowerCase().includes(q)
    );
  }, [users, searchTerm]);

  const upcomingBookings = bookings.filter((b) =>
    ['confirmed', 'booked'].includes(b.status) && new Date(b.slot_start) > new Date()
  ).length;

  const paidBookings = bookings.filter((b) => b.payment_status === 'success').length;

  const statCards = [
    { label: 'Users', value: stats?.totalUsers ?? users.length, detail: `${users.filter(u => u.role === 'organiser').length} organisers`, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Bookings', value: stats?.totalBookings ?? bookings.length, detail: `${upcomingBookings} upcoming`, icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Services', value: stats?.activeServices ?? facilities.length, detail: `${facilities.filter(f => f.status === 'published').length} published`, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Revenue', value: `₹${stats?.revenue ?? 0}`, detail: `${paidBookings} paid bookings`, icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  const saveFacility = async () => {
    setSaving(true);
    try {
      await adminService.updateFacility(editingFacility.id, {
        name: editingFacility.name,
        description: editingFacility.description,
        type: editingFacility.type,
        price: Number(editingFacility.price || editingFacility.base_price || 0),
        duration_min: Number(editingFacility.duration_min || editingFacility.duration_mins || 30),
        capacity: Number(editingFacility.capacity || editingFacility.max_capacity || 1),
        advance_payment: Boolean(editingFacility.advance_payment),
        manual_confirmation: Boolean(editingFacility.manual_confirmation || editingFacility.manual_confirm),
        status: editingFacility.status,
        location: editingFacility.location,
      });
      setEditingFacility(null);
      setSuccessMsg('Service updated.');
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Service update failed.');
    } finally {
      setSaving(false);
    }
  };

  const deleteFacility = async (facility) => {
    if (!window.confirm(`Delete service "${facility.name}"? Existing records stay in history.`)) return;
    try {
      await adminService.deleteFacility(facility.id);
      setSuccessMsg('Service deleted.');
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Delete failed.');
    }
  };

  const updateBookingStatus = async (booking, status) => {
    try {
      await adminService.updateBookingStatus(booking.id, status);
      setSuccessMsg(`Booking marked ${status}.`);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Booking update failed.');
    }
  };

  const deleteBooking = async (booking) => {
    if (!window.confirm(`Delete booking ${booking.confirmation_code || booking.id.slice(0, 8)}?`)) return;
    try {
      await adminService.deleteBooking(booking.id);
      setSuccessMsg('Booking deleted.');
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Booking delete failed.');
    }
  };

  const updateUser = async (user, data) => {
    try {
      await adminService.updateUser(user.id, data);
      setSuccessMsg('User updated.');
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'User update failed.');
    }
  };

  const deleteUser = async (user) => {
    if (!window.confirm(`Delete ${user.email}? This will fail if they own bookings or services.`)) return;
    try {
      await adminService.deleteUser(user.id);
      setSuccessMsg('User deleted.');
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'User has linked records and cannot be deleted.');
    }
  };

  const renderSearch = (placeholder) => (
    <div className="relative w-full max-w-md">
      <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-100 bg-white py-3 pl-9 pr-4 text-sm font-bold outline-none focus:border-primary/30"
      />
    </div>
  );

  const renderFacilityEditor = () => {
    if (!editingFacility) return null;

    const setField = (key, value) => setEditingFacility((prev) => ({ ...prev, [key]: value }));

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
        <div className="w-full max-w-3xl rounded-3xl bg-white p-8 shadow-2xl">
          <div className="flex items-start justify-between border-b border-gray-100 pb-5">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-gray-400">Service Control</p>
              <h2 className="mt-1 text-2xl font-black text-gray-800">{editingFacility.name}</h2>
            </div>
            <button onClick={() => setEditingFacility(null)} className="rounded-xl p-2 text-gray-400 hover:bg-gray-50"><X className="w-5 h-5" /></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-6">
            <label className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-gray-400">Name</span>
              <input value={editingFacility.name || ''} onChange={(e) => setField('name', e.target.value)} className="w-full rounded-xl border border-gray-100 px-4 py-3 font-bold outline-none focus:border-primary/30" />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-gray-400">Status</span>
              <select value={editingFacility.status || 'draft'} onChange={(e) => setField('status', e.target.value)} className="w-full rounded-xl border border-gray-100 px-4 py-3 font-bold outline-none focus:border-primary/30">
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="unpublished">Unpublished</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-gray-400">Price</span>
              <input type="number" value={editingFacility.price ?? editingFacility.base_price ?? 0} onChange={(e) => setField('price', e.target.value)} className="w-full rounded-xl border border-gray-100 px-4 py-3 font-bold outline-none focus:border-primary/30" />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-gray-400">Duration</span>
              <input type="number" value={editingFacility.duration_min ?? editingFacility.duration_mins ?? 30} onChange={(e) => setField('duration_min', e.target.value)} className="w-full rounded-xl border border-gray-100 px-4 py-3 font-bold outline-none focus:border-primary/30" />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-gray-400">Capacity</span>
              <input type="number" value={editingFacility.capacity ?? editingFacility.max_capacity ?? 1} onChange={(e) => setField('capacity', e.target.value)} className="w-full rounded-xl border border-gray-100 px-4 py-3 font-bold outline-none focus:border-primary/30" />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-gray-400">Location</span>
              <input value={editingFacility.location || ''} onChange={(e) => setField('location', e.target.value)} className="w-full rounded-xl border border-gray-100 px-4 py-3 font-bold outline-none focus:border-primary/30" />
            </label>
            <label className="md:col-span-2 space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-gray-400">Description</span>
              <textarea value={editingFacility.description || ''} onChange={(e) => setField('description', e.target.value)} rows={3} className="w-full rounded-xl border border-gray-100 px-4 py-3 font-bold outline-none focus:border-primary/30" />
            </label>
            <label className="flex items-center gap-3 rounded-xl border border-gray-100 p-4 font-bold text-gray-700">
              <input type="checkbox" checked={Boolean(editingFacility.advance_payment)} onChange={(e) => setField('advance_payment', e.target.checked)} className="h-5 w-5 accent-primary" />
              Advance payment required
            </label>
            <label className="flex items-center gap-3 rounded-xl border border-gray-100 p-4 font-bold text-gray-700">
              <input type="checkbox" checked={Boolean(editingFacility.manual_confirmation || editingFacility.manual_confirm)} onChange={(e) => setField('manual_confirmation', e.target.checked)} className="h-5 w-5 accent-primary" />
              Manual confirmation
            </label>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
            <button onClick={() => setEditingFacility(null)} className="rounded-xl border border-gray-100 px-5 py-3 font-bold text-gray-500 hover:bg-gray-50">Cancel</button>
            <Button onClick={saveFacility} isLoading={saving} className="rounded-xl px-6 py-3">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderBookingDetails = () => {
    if (!selectedBooking) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
        <div className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl">
          <div className="flex items-start justify-between border-b border-gray-100 pb-5">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-gray-400">Booking Record</p>
              <h2 className="mt-1 text-2xl font-black text-gray-800">{selectedBooking.service_name}</h2>
              <p className="mt-1 font-mono text-sm font-bold text-primary">#{selectedBooking.confirmation_code || selectedBooking.id.slice(0, 8)}</p>
            </div>
            <button onClick={() => setSelectedBooking(null)} className="rounded-xl p-2 text-gray-400 hover:bg-gray-50"><X className="w-5 h-5" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-6">
            <Info label="Customer" value={`${selectedBooking.customer_name || 'Unknown'} · ${selectedBooking.customer_email || 'No email'}`} />
            <Info label="Organiser" value={selectedBooking.organiser_name || 'Unknown'} />
            <Info label="When" value={selectedBooking.slot_start ? new Date(selectedBooking.slot_start).toLocaleString() : 'Not scheduled'} />
            <Info label="Payment" value={`${selectedBooking.payment_status || 'none'}${selectedBooking.paid_amount ? ` · ₹${selectedBooking.paid_amount}` : ''}`} />
            <Info label="Status" value={selectedBooking.status} />
            <Info label="Gateway Ref" value={selectedBooking.gateway_txn_id || 'Not available'} />
          </div>
          <div className="flex flex-wrap justify-end gap-2 border-t border-gray-100 pt-5">
            {['confirmed', 'cancelled', 'no_show'].map((status) => (
              <button key={status} onClick={() => updateBookingStatus(selectedBooking, status)} className="rounded-xl border border-gray-100 px-4 py-2 text-xs font-black uppercase tracking-widest text-gray-500 hover:border-primary/30 hover:text-primary">
                Mark {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout title="Admin Portal">
      {renderFacilityEditor()}
      {renderBookingDetails()}
      {isLoading ? (
        <Loader />
      ) : (
        <div className="space-y-6 h-[calc(100vh-10rem)] overflow-y-auto pr-2 scrollbar-hide pb-20">
          {error && <div className="bg-red-50 text-red-700 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest border border-red-100">{error}</div>}
          {successMsg && <div className="bg-green-50 text-green-700 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest border border-green-100">{successMsg}</div>}

          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {statCards.map((stat) => (
              <Card key={stat.label} className="flex items-center gap-4 border-gray-50 p-5">
                <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{stat.label}</p>
                  <p className="text-xl font-black text-gray-800">{stat.value}</p>
                  <p className="text-xs font-bold text-gray-400">{stat.detail}</p>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-3">
            <div className="flex gap-2">
              {['services', 'bookings', 'users'].map((id) => (
                <button
                  key={id}
                  onClick={() => { setActiveTab(id); setSlotFacility(null); setSearchTerm(''); }}
                  className={`rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-gray-400 border border-gray-100 hover:text-primary'}`}
                >
                  {id}
                </button>
              ))}
            </div>
            <button onClick={loadData} className="flex items-center gap-2 rounded-xl border border-gray-100 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-primary">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {activeTab === 'services' && (
            <div className="space-y-5">
              {slotFacility ? (
                <SlotManager facility={slotFacility} onBack={() => setSlotFacility(null)} />
              ) : (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-black text-gray-800">Services</h2>
                      <p className="text-sm font-bold text-gray-400">Edit pricing, publishing state, capacity, and slot inventory.</p>
                    </div>
                    {renderSearch('Search services, type, organiser...')}
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {filteredFacilities.map((f) => (
                      <Card key={f.id} className="p-5 border-gray-50">
                        <div className="grid grid-cols-1 xl:grid-cols-[1fr_auto] gap-5">
                          <div className="flex gap-4 min-w-0">
                            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center font-black text-gray-400 overflow-hidden">
                              {f.image ? <img src={f.image} className="w-full h-full object-cover" /> : (f.name || 'S')[0]}
                            </div>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="font-black text-gray-800">{f.name}</h3>
                                <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${STATUS_COLORS[f.status] || 'bg-gray-100 text-gray-600'}`}>{f.status}</span>
                                {f.advance_payment && <span className="px-2 py-1 rounded-full text-[10px] font-black uppercase bg-primary/10 text-primary">paid</span>}
                              </div>
                              <p className="mt-1 text-xs font-bold text-gray-400 truncate">{f.description || 'No description'}</p>
                              <div className="mt-3 flex flex-wrap gap-4 text-xs font-bold text-gray-500">
                                <span>Organiser: {f.organiser_name}</span>
                                <span>₹{f.price ?? f.base_price ?? 0}</span>
                                <span>{f.duration_min ?? f.duration_mins} min</span>
                                <span>Capacity {f.capacity ?? f.max_capacity ?? 1}</span>
                                <span>{f.location || 'No location'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center justify-end gap-2">
                            <button onClick={() => setSlotFacility(f)} className="rounded-xl border border-gray-100 px-4 py-2 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-green-600 hover:border-green-200"><Clock className="w-4 h-4 inline mr-2" />Slots</button>
                            <button onClick={() => setEditingFacility(f)} className="rounded-xl border border-gray-100 px-4 py-2 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-primary hover:border-primary/20"><Pencil className="w-4 h-4 inline mr-2" />Edit</button>
                            <button onClick={() => deleteFacility(f)} className="rounded-xl border border-gray-100 px-4 py-2 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-red-600 hover:border-red-200"><Trash2 className="w-4 h-4 inline mr-2" />Delete</button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-gray-800">Bookings</h2>
                  <p className="text-sm font-bold text-gray-400">Audit appointments, payment state, and booking lifecycle.</p>
                </div>
                <div className="flex items-center gap-3">
                  {renderSearch('Search booking, customer, status...')}
                  <div className="flex p-1 bg-gray-100 rounded-xl">
                    <button onClick={() => setBookingView('list')} className={`px-4 py-2 text-[10px] font-black uppercase rounded-lg ${bookingView === 'list' ? 'bg-white text-primary shadow-sm' : 'text-gray-400'}`}>List</button>
                    <button onClick={() => setBookingView('calendar')} className={`px-4 py-2 text-[10px] font-black uppercase rounded-lg ${bookingView === 'calendar' ? 'bg-white text-primary shadow-sm' : 'text-gray-400'}`}>Calendar</button>
                  </div>
                </div>
              </div>
              {bookingView === 'calendar' ? (
                <AdminBookingCalendar bookings={filteredBookings} onRefresh={loadData} />
              ) : (
                <Card className="p-0 overflow-hidden border-gray-50">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                      <tr>
                        <th className="px-5 py-4">Booking</th>
                        <th className="px-5 py-4">Customer</th>
                        <th className="px-5 py-4">Schedule</th>
                        <th className="px-5 py-4">Payment</th>
                        <th className="px-5 py-4">Status</th>
                        <th className="px-5 py-4 text-right">Controls</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredBookings.map((b) => (
                        <tr key={b.id} className="text-sm hover:bg-gray-50/60">
                          <td className="px-5 py-4">
                            <p className="font-black text-gray-800">{b.service_name}</p>
                            <p className="font-mono text-xs font-bold text-primary">#{b.confirmation_code || b.id.slice(0, 8)}</p>
                          </td>
                          <td className="px-5 py-4">
                            <p className="font-bold text-gray-700">{b.customer_name}</p>
                            <p className="text-xs text-gray-400">{b.customer_email}</p>
                          </td>
                          <td className="px-5 py-4 font-bold text-gray-500">{b.slot_start ? new Date(b.slot_start).toLocaleString() : 'Not scheduled'}</td>
                          <td className="px-5 py-4">
                            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-[10px] font-black uppercase text-gray-500">
                              <CreditCard className="w-3 h-3" />
                              {b.payment_status || 'none'} {b.paid_amount ? `₹${b.paid_amount}` : ''}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <select value={b.status} onChange={(e) => updateBookingStatus(b, e.target.value)} className={`rounded-xl border-0 px-3 py-2 text-xs font-black uppercase ${STATUS_COLORS[b.status] || 'bg-gray-100 text-gray-600'}`}>
                              <option value="confirmed">confirmed</option>
                              <option value="cancelled">cancelled</option>
                              <option value="rescheduled">rescheduled</option>
                              <option value="no_show">no show</option>
                            </select>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-1">
                              <button onClick={() => setSelectedBooking(b)} className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg"><Eye className="w-4 h-4" /></button>
                              <button onClick={() => deleteBooking(b)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-gray-800">Users</h2>
                  <p className="text-sm font-bold text-gray-400">Promote roles, verify accounts, and remove inactive accounts.</p>
                </div>
                {renderSearch('Search users, email, role...')}
              </div>
              <Card className="p-0 overflow-hidden border-gray-50">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                    <tr>
                      <th className="px-5 py-4">User</th>
                      <th className="px-5 py-4">Role</th>
                      <th className="px-5 py-4">Verification</th>
                      <th className="px-5 py-4">Joined</th>
                      <th className="px-5 py-4 text-right">Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="text-sm hover:bg-gray-50/60">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black">{(u.full_name || 'U')[0]}</div>
                            <div>
                              <p className="font-black text-gray-800">{u.full_name}</p>
                              <p className="text-xs text-gray-400">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <select value={u.role} onChange={(e) => updateUser(u, { role: e.target.value })} className="rounded-xl border border-gray-100 bg-white px-3 py-2 text-xs font-black uppercase text-gray-600">
                            <option value="customer">customer</option>
                            <option value="organiser">organiser</option>
                            <option value="admin">admin</option>
                          </select>
                        </td>
                        <td className="px-5 py-4">
                          <button onClick={() => updateUser(u, { is_verified: !u.is_verified })} className={`rounded-xl px-3 py-2 text-xs font-black uppercase ${u.is_verified ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {u.is_verified ? 'verified' : 'unverified'}
                          </button>
                        </td>
                        <td className="px-5 py-4 font-bold text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-1">
                            {u.role === 'admin' && <Shield className="w-5 h-5 text-red-400" />}
                            <button onClick={() => deleteUser(u)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

const Info = ({ label, value }) => (
  <div className="rounded-2xl border border-gray-100 p-4">
    <p className="text-xs font-black uppercase tracking-widest text-gray-400">{label}</p>
    <p className="mt-2 break-words font-bold text-gray-800">{value}</p>
  </div>
);

export default AdminDashboard;
