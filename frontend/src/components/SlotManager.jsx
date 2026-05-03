import React, { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, Pencil, Save, X, Zap, ChevronLeft } from 'lucide-react';
import Card from './Card';
import Button from './Button';
import Loader from './Loader';
import { adminService } from '@services/admin';

const SLOT_STATUS_COLORS = {
  available: 'bg-green-100 text-green-700',
  booked: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
  blackout: 'bg-gray-200 text-gray-600',
};

const getBasePrice = (facility) => String(facility?.base_price ?? facility?.price ?? 0);
const toMoneyNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const SlotManager = ({ facility, onBack }) => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingSlotId, setEditingSlotId] = useState(null);
  const [editSlotForm, setEditSlotForm] = useState({});
  const [showAddSingle, setShowAddSingle] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState([]);
  const [showBookForUser, setShowBookForUser] = useState(null); // slot id
  const [selectedUserId, setSelectedUserId] = useState('');

  const [newSlot, setNewSlot] = useState({ slot_start: '', slot_end: '', total_capacity: 1, frozen_price: getBasePrice(facility), status: 'available' });
  const [bulkForm, setBulkForm] = useState({ date_from: '', date_to: '', start_hour: 9, end_hour: 17, frozen_price: getBasePrice(facility), total_capacity: 1 });

  const loadSlots = async () => {
    setLoading(true);
    try {
      const res = await adminService.getSlots(facility.id, filterDate || undefined);
      setSlots(res.data || []);
    } catch (e) {
      setError('Failed to load slots.');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await adminService.getUsers();
      setUsers(res.data || []);
    } catch (e) {
      console.error('Failed to load users');
    }
  };

  useEffect(() => { loadSlots(); }, [filterDate]);
  useEffect(() => { loadUsers(); }, []);
  useEffect(() => { if (success) { const t = setTimeout(() => setSuccess(''), 3000); return () => clearTimeout(t); } }, [success]);

  const handleAddSingle = async () => {
    if (!newSlot.slot_start || !newSlot.slot_end) return setError('Start and end times required.');
    setSaving(true);
    try {
      await adminService.createSlot(facility.id, {
        ...newSlot,
        frozen_price: toMoneyNumber(newSlot.frozen_price),
      });
      setSuccess('Slot created.');
      setShowAddSingle(false);
      setNewSlot({ slot_start: '', slot_end: '', total_capacity: 1, frozen_price: getBasePrice(facility), status: 'available' });
      await loadSlots();
    } catch (e) { setError(e.response?.data?.error?.message || 'Failed to create slot.'); }
    finally { setSaving(false); }
  };

  const handleBulkCreate = async () => {
    if (!bulkForm.date_from || !bulkForm.date_to) return setError('Date range required.');
    setSaving(true);
    try {
      const res = await adminService.bulkCreateSlots(facility.id, {
        ...bulkForm,
        frozen_price: toMoneyNumber(bulkForm.frozen_price),
      });
      setSuccess(`${res.count} slots generated.`);
      setShowBulk(false);
      await loadSlots();
    } catch (e) { setError(e.response?.data?.error?.message || 'Failed to generate slots.'); }
    finally { setSaving(false); }
  };

  const startEditSlot = (s) => {
    setEditingSlotId(s.id);
    setEditSlotForm({ total_capacity: s.total_capacity, frozen_price: String(s.frozen_price ?? 0), status: s.status });
  };

  const saveSlotEdit = async () => {
    setSaving(true);
    try {
      await adminService.updateSlot(editingSlotId, {
        ...editSlotForm,
        frozen_price: toMoneyNumber(editSlotForm.frozen_price),
      });
      setSuccess('Slot updated.');
      setEditingSlotId(null);
      await loadSlots();
    } catch (e) { setError(e.response?.data?.error?.message || 'Failed to update.'); }
    finally { setSaving(false); }
  };

  const handleDeleteSlot = async (id) => {
    if (!window.confirm('Delete this slot?')) return;
    try {
      await adminService.deleteSlot(id);
      setSuccess('Slot deleted.');
      await loadSlots();
    } catch (e) { setError(e.response?.data?.error?.message || 'Failed to delete.'); }
  };

  const handleBookForUser = async (slotId) => {
    if (!selectedUserId) return setError('Please select a user.');
    setSaving(true);
    try {
      await adminService.createBooking({
        customer_id: selectedUserId,
        facility_id: facility.id,
        slot_id: slotId,
        status: 'confirmed'
      });
      setSuccess('Booking created successfully.');
      setShowBookForUser(null);
      await loadSlots();
    } catch (e) {
      setError(e.response?.data?.error?.message || 'Failed to create booking.');
    } finally {
      setSaving(false);
    }
  };

  const fmtTime = (iso) => { try { return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); } catch { return iso; } };
  const fmtDate = (iso) => { try { return new Date(iso).toLocaleDateString(); } catch { return iso; } };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-500" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Slots: {facility.name}</h2>
            <p className="text-xs text-gray-400">{facility.duration_mins} min slots · ₹{Number(facility.base_price).toLocaleString()} base</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none" />
          <button onClick={() => setFilterDate('')} className="text-xs text-gray-400 hover:text-primary font-bold">All Dates</button>
        </div>
      </div>

      {/* Toasts */}
      {error && <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-3 rounded-2xl text-sm font-bold"><X className="w-4 h-4 cursor-pointer flex-shrink-0" onClick={() => setError('')} />{error}</div>}
      {success && <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-5 py-3 rounded-2xl text-sm font-bold">{success}</div>}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button onClick={() => { setShowAddSingle(!showAddSingle); setShowBulk(false); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${showAddSingle ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-700 hover:border-primary/30'}`}>
          <Plus className="w-4 h-4" /> Add Single Slot
        </button>
        <button onClick={() => { setShowBulk(!showBulk); setShowAddSingle(false); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${showBulk ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-700 hover:border-primary/30'}`}>
          <Zap className="w-4 h-4" /> Bulk Generate
        </button>
      </div>

      {/* Add Single Slot Form */}
      {showAddSingle && (
        <Card className="p-6 bg-gray-50/50 space-y-4">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">New Slot</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div><label className="block text-xs font-bold text-gray-500 mb-1">Start</label>
              <input type="datetime-local" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white" value={newSlot.slot_start} onChange={(e) => setNewSlot({ ...newSlot, slot_start: e.target.value })} /></div>
            <div><label className="block text-xs font-bold text-gray-500 mb-1">End</label>
              <input type="datetime-local" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white" value={newSlot.slot_end} onChange={(e) => setNewSlot({ ...newSlot, slot_end: e.target.value })} /></div>
            <div><label className="block text-xs font-bold text-gray-500 mb-1">Capacity</label>
              <input type="number" min="1" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white" value={newSlot.total_capacity} onChange={(e) => setNewSlot({ ...newSlot, total_capacity: parseInt(e.target.value) || 1 })} /></div>
            <div><label className="block text-xs font-bold text-gray-500 mb-1">Price (₹)</label>
              <input type="number" min="0" step="0.01" inputMode="decimal" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white" value={newSlot.frozen_price} onChange={(e) => setNewSlot({ ...newSlot, frozen_price: e.target.value })} /></div>
            <div className="flex items-end">
              <button onClick={handleAddSingle} disabled={saving} className="w-full px-4 py-2 bg-primary text-white font-bold text-sm rounded-xl hover:opacity-90 disabled:opacity-50">{saving ? 'Creating...' : 'Create'}</button>
            </div>
          </div>
        </Card>
      )}

      {/* Bulk Generate Form */}
      {showBulk && (
        <Card className="p-6 bg-gray-50/50 space-y-4">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Bulk Generate Slots</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div><label className="block text-xs font-bold text-gray-500 mb-1">From Date</label>
              <input type="date" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white" value={bulkForm.date_from} onChange={(e) => setBulkForm({ ...bulkForm, date_from: e.target.value })} /></div>
            <div><label className="block text-xs font-bold text-gray-500 mb-1">To Date</label>
              <input type="date" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white" value={bulkForm.date_to} onChange={(e) => setBulkForm({ ...bulkForm, date_to: e.target.value })} /></div>
            <div><label className="block text-xs font-bold text-gray-500 mb-1">Start Hour</label>
              <input type="number" min="0" max="23" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white" value={bulkForm.start_hour} onChange={(e) => setBulkForm({ ...bulkForm, start_hour: parseInt(e.target.value) || 9 })} /></div>
            <div><label className="block text-xs font-bold text-gray-500 mb-1">End Hour</label>
              <input type="number" min="1" max="24" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white" value={bulkForm.end_hour} onChange={(e) => setBulkForm({ ...bulkForm, end_hour: parseInt(e.target.value) || 17 })} /></div>
            <div><label className="block text-xs font-bold text-gray-500 mb-1">Price (₹)</label>
              <input type="number" min="0" step="0.01" inputMode="decimal" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white" value={bulkForm.frozen_price} onChange={(e) => setBulkForm({ ...bulkForm, frozen_price: e.target.value })} /></div>
            <div className="flex items-end">
              <button onClick={handleBulkCreate} disabled={saving} className="w-full px-4 py-2 bg-primary text-white font-bold text-sm rounded-xl hover:opacity-90 disabled:opacity-50">{saving ? 'Generating...' : 'Generate'}</button>
            </div>
          </div>
          <p className="text-xs text-gray-400 italic">Creates one slot per hour between start and end hour for each day in the range. Slot duration uses the facility's {facility.duration_mins}-min setting.</p>
        </Card>
      )}

      {/* Slots Table */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{slots.length} Slots {filterDate ? `on ${filterDate}` : '(all dates)'}</span>
          </div>
          <div className="max-h-[500px] overflow-y-auto">
            <table className="w-full text-left">
              <thead className="bg-white border-b border-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Time</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Cap</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Booked</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Price</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Resource</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {slots.length > 0 ? slots.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3 text-sm text-gray-700">{fmtDate(s.slot_start)}</td>
                    <td className="px-5 py-3 text-sm font-bold text-gray-800">{fmtTime(s.slot_start)} – {fmtTime(s.slot_end)}</td>
                    <td className="px-5 py-3">
                      {editingSlotId === s.id ? (
                        <select className="px-2 py-1 border border-gray-200 rounded-lg text-xs bg-white" value={editSlotForm.status} onChange={(e) => setEditSlotForm({ ...editSlotForm, status: e.target.value })}>
                          <option value="available">Available</option>
                          <option value="booked">Booked</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="blackout">Blackout</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${SLOT_STATUS_COLORS[s.status] || 'bg-gray-100 text-gray-500'}`}>{s.status}</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-sm">
                      {editingSlotId === s.id ? (
                        <input type="number" min="1" className="w-16 px-2 py-1 border border-gray-200 rounded-lg text-xs bg-white" value={editSlotForm.total_capacity} onChange={(e) => setEditSlotForm({ ...editSlotForm, total_capacity: parseInt(e.target.value) || 1 })} />
                      ) : s.total_capacity}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500">{s.confirmed_count}/{s.total_capacity}</td>
                    <td className="px-5 py-3 text-sm">
                      {editingSlotId === s.id ? (
                        <input type="number" min="0" step="0.01" inputMode="decimal" className="w-20 px-2 py-1 border border-gray-200 rounded-lg text-xs bg-white" value={editSlotForm.frozen_price} onChange={(e) => setEditSlotForm({ ...editSlotForm, frozen_price: e.target.value })} />
                      ) : `₹${Number(s.frozen_price).toLocaleString()}`}
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-400 italic">{s.resource_name || '—'}</td>
                    <td className="px-5 py-3 text-right">
                      {editingSlotId === s.id ? (
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={saveSlotEdit} disabled={saving} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"><Save className="w-4 h-4" /></button>
                          <button onClick={() => setEditingSlotId(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          {s.status === 'available' && (
                            <button 
                              onClick={() => setShowBookForUser(s.id)} 
                              className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-lg hover:bg-primary/20 transition-all"
                            >
                              Book for User
                            </button>
                          )}
                          <button onClick={() => startEditSlot(s)} className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"><Pencil className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDeleteSlot(s.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      )}

                      {/* Book for User Overlay/Modal-ish */}
                      {showBookForUser === s.id && (
                        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                          <Card className="w-full max-w-md p-8 space-y-6 shadow-2xl">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-bold text-gray-800">Book for User</h3>
                              <button onClick={() => setShowBookForUser(null)} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5 text-gray-400" /></button>
                            </div>
                            <div className="space-y-4 text-left">
                              <p className="text-sm text-gray-500">Slot: <span className="font-bold text-gray-800">{fmtDate(s.slot_start)} at {fmtTime(s.slot_start)}</span></p>
                              <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Select Customer</label>
                                <select 
                                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-primary outline-none"
                                  value={selectedUserId}
                                  onChange={(e) => setSelectedUserId(e.target.value)}
                                >
                                  <option value="">-- Choose User --</option>
                                  {users.map(u => (
                                    <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>
                                  ))}
                                </select>
                              </div>
                              <Button 
                                onClick={() => handleBookForUser(s.id)}
                                disabled={saving || !selectedUserId}
                                className="w-full py-4 rounded-xl"
                              >
                                {saving ? <Loader /> : 'Confirm Booking'}
                              </Button>
                            </div>
                          </Card>
                        </div>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="8" className="px-5 py-12 text-center text-gray-400 font-bold">No slots found. Use the buttons above to create some.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default SlotManager;
