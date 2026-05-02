import React, { useState, useEffect, useReducer, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Trash2, Plus, ArrowRight, Save, Eye, Send, Upload, X, UserPlus, Users as UsersIcon, MapPin, Clock, ChevronRight, Settings2 } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import QuestionBuilder from '../../components/QuestionBuilder';
import { organiserService } from '@services/organiser';

const initialState = {
  formData: {
    title: '',
    duration: '00:30',
    location: '',
    description: '',
    price: 0,
    image: '',
    questions: [
      { id: 1, label: 'Name', type: 'text', required: true },
      { id: 2, label: 'Phone', type: 'phone', required: true }
    ],
    scheduleType: 'weekly',
    availability: [
      { id: Date.now(), day: 'Monday', startTime: '09:00', endTime: '12:00' },
      { id: Date.now() + 1, day: 'Wednesday', startTime: '14:00', endTime: '17:00' }
    ],
    selectedUsers: [],
    manualConfirmation: false,
    capacityLimit: 1,
    paidBooking: false,
    bookingFee: 0,
    createSlotHours: 1,
    cancellationHours: 24,
    introMessage: 'Schedule your visit today and experience expert care brought right to your doorstep.',
    confirmMessage: 'Thank you for your trust we look forward to meeting you'
  },
  isLoading: false,
  isNew: true
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.value };
    case 'SET_DATA':
      return { ...state, formData: { ...state.formData, ...action.value }, isNew: false };
    case 'UPDATE_FIELD':
      return { ...state, formData: { ...state.formData, [action.field]: action.value } };
    default:
      return state;
  }
}

const AppointmentEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [activeTab, setActiveTab] = useState('schedule');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [staff, setStaff] = useState([]);

  useEffect(() => {
    if (id && id !== 'new') {
      const fetchService = async () => {
        dispatch({ type: 'SET_LOADING', value: true });
        try {
          const res = await organiserService.getServices();
          const service = (res.data || []).find(s => String(s.id) === String(id));
          if (service) {
            dispatch({ type: 'SET_DATA', value: {
              title: service.name,
              duration: service.duration_min ? String(Math.floor(service.duration_min / 60)).padStart(2,'0') + ':' + String(service.duration_min % 60).padStart(2,'0') : '00:30',
              location: service.location || '',
              description: service.description || '',
              manualConfirmation: service.manual_confirmation || false,
              paidBooking: service.advance_payment || false,
              image: service.image || '',
              price: service.price || 0,
              questions: service.questions || initialState.formData.questions
            }});
          }
        } catch (err) {
          console.error(err);
        } finally {
          dispatch({ type: 'SET_LOADING', value: false });
        }
      };
      fetchService();
    }
  }, [id]);

  const handleSave = async () => {
    dispatch({ type: 'SET_LOADING', value: true });
    try {
      const durationParts = state.formData.duration.split(':');
      const duration_min = (parseInt(durationParts[0]) * 60) + parseInt(durationParts[1]);
      
      const payload = {
        name: state.formData.title,
        duration_min: duration_min || 30,
        location: state.formData.location,
        description: state.formData.description,
        manual_confirmation: state.formData.manualConfirmation,
        advance_payment: state.formData.paidBooking,
        capacity: state.formData.capacityLimit,
        price: state.formData.price,
        image: state.formData.image,
        questions: state.formData.questions,
        assigned_users: state.formData.selectedUsers
      };

      if (state.isNew) {
        await organiserService.createService(payload);
      } else {
        await organiserService.updateService(id, payload);
      }
      navigate('/organiser');
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to save.');
    } finally {
      dispatch({ type: 'SET_LOADING', value: false });
    }
  };

  const updateField = (field, value) => {
    dispatch({ type: 'UPDATE_FIELD', field, value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateField('image', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const addAvailabilityLine = () => {
    const newLine = {
      id: Date.now(),
      day: 'Monday',
      startTime: '09:00',
      endTime: '12:00'
    };
    updateField('availability', [...state.formData.availability, newLine]);
  };

  const removeAvailabilityLine = (id) => {
    updateField('availability', state.formData.availability.filter(a => a.id !== id));
  };

  const updateAvailabilityLine = (id, field, value) => {
    const updated = state.formData.availability.map(a => 
      a.id === id ? { ...a, [field]: value } : a
    );
    updateField('availability', updated);
  };

  const toggleUserSelection = (userId) => {
    const selected = state.formData.selectedUsers;
    if (selected.includes(userId)) {
      updateField('selectedUsers', selected.filter(id => id !== userId));
    } else {
      updateField('selectedUsers', [...selected, userId]);
    }
  };

  const addNewUser = () => {
    if (!newUserName) return;
    const newUser = {
      id: Date.now(),
      name: newUserName,
      initial: newUserName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
    };
    setStaff([...staff, newUser]);
    updateField('selectedUsers', [...state.formData.selectedUsers, newUser.id]);
    setNewUserName('');
    setIsAddingUser(false);
  };

  return (
    <DashboardLayout title={state.isNew ? "Create Service" : "Edit Service"}>
      {/* Scrollable Container */}
      <div className="h-[calc(100vh-10rem)] overflow-y-auto pr-4 scrollbar-hide">
        <div className="flex flex-col gap-10 pb-20">
          
          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-6 bg-white/50 backdrop-blur-sm p-6 rounded-[32px] border border-white/20 shadow-sm">
            <div className="flex gap-3">
              <button 
                onClick={() => navigate('/organiser/editor/new')}
                className="px-6 py-2 bg-gray-50 text-gray-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all"
              >
                New
              </button>
              <button 
                onClick={() => setIsPreviewOpen(true)}
                className="px-6 py-2 bg-gray-50 text-gray-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
              <button 
                onClick={handleSave}
                className="px-8 py-2 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Publish
              </button>
            </div>
            
            <button 
              onClick={() => navigate('/organiser/meetings')}
              className="flex items-center gap-2 px-6 py-2 bg-white border border-gray-100 rounded-xl font-bold text-gray-700 hover:shadow-sm transition-all"
            >
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-xs uppercase tracking-wider">Meetings</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left: Basic Info */}
            <div className="lg:col-span-8 space-y-12 bg-white rounded-[48px] p-12 border border-gray-100 shadow-sm">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] pl-1">Service Identity</p>
                <input
                  type="text"
                  value={state.formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  className="text-6xl font-black text-gray-800 border-none bg-transparent outline-none w-full placeholder:text-gray-100 tracking-tighter"
                  placeholder="Name your amazing service..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] pl-1">Duration</p>
                  <div className="flex items-center gap-3 border-b-2 border-gray-50 focus-within:border-primary transition-all pb-3">
                    <Clock className="w-5 h-5 text-gray-300" />
                    <input
                      type="text"
                      value={state.formData.duration}
                      onChange={(e) => updateField('duration', e.target.value)}
                      className="bg-transparent outline-none font-black text-2xl text-gray-700 w-full"
                      placeholder="00:30"
                    />
                    <span className="text-[10px] font-black text-gray-300 uppercase">HH:MM</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] pl-1">Location</p>
                  <div className="flex items-center gap-3 border-b-2 border-gray-50 focus-within:border-primary transition-all pb-3">
                    <MapPin className="w-5 h-5 text-gray-300" />
                    <input
                      type="text"
                      value={state.formData.location}
                      onChange={(e) => updateField('location', e.target.value)}
                      className="bg-transparent outline-none font-black text-2xl text-gray-700 w-full"
                      placeholder="Doctor's Office"
                    />
                  </div>
                </div>
              </div>

              {/* Tabs Integration */}
              <div className="pt-10 border-t border-gray-50">
                <div className="flex gap-2 mb-8 overflow-x-auto scrollbar-hide pb-2">
                  {['Schedule', 'Questions', 'Policy', 'Success'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab.toLowerCase())}
                      className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                        activeTab === tab.toLowerCase() ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="min-h-[300px]">
                  {activeTab === 'schedule' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <div className="flex items-center justify-between">
                         <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Availability Slots</h4>
                         <button onClick={addAvailabilityLine} className="p-2 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition-all"><Plus className="w-4 h-4" /></button>
                      </div>
                      <div className="space-y-3">
                        {state.formData.availability.map((item) => (
                          <div key={item.id} className="flex items-center gap-4 bg-gray-50 p-4 rounded-3xl group hover:bg-white hover:shadow-xl hover:shadow-black/5 transition-all">
                            <select 
                              value={item.day}
                              onChange={(e) => updateAvailabilityLine(item.id, 'day', e.target.value)}
                              className="bg-transparent font-black text-gray-700 outline-none flex-1"
                            >
                              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                                <option key={d} value={d}>{d}</option>
                              ))}
                            </select>
                            <div className="flex items-center gap-3">
                              <input type="text" value={item.startTime} onChange={(e) => updateAvailabilityLine(item.id, 'startTime', e.target.value)} className="w-16 bg-white border border-gray-100 rounded-lg py-1 px-2 text-center font-bold text-gray-500 text-xs" />
                              <ChevronRight className="w-4 h-4 text-gray-200" />
                              <input type="text" value={item.endTime} onChange={(e) => updateAvailabilityLine(item.id, 'endTime', e.target.value)} className="w-16 bg-white border border-gray-100 rounded-lg py-1 px-2 text-center font-bold text-gray-500 text-xs" />
                            </div>
                            <button onClick={() => removeAvailabilityLine(item.id)} className="p-2 text-gray-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'questions' && (
                    <div className="animate-in fade-in duration-300">
                      <QuestionBuilder questions={state.formData.questions} onChange={(qs) => updateField('questions', qs)} />
                    </div>
                  )}

                  {activeTab === 'policy' && (
                    <div className="space-y-10 animate-in fade-in duration-300">
                       <div className="grid md:grid-cols-2 gap-10">
                          <div className="p-6 bg-gray-50 rounded-[32px] space-y-4">
                             <div className="flex items-center justify-between">
                               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Manual Confirmation</span>
                               <input type="checkbox" checked={state.formData.manualConfirmation} onChange={(e) => updateField('manualConfirmation', e.target.checked)} className="w-5 h-5 rounded-lg border-gray-200 text-primary focus:ring-primary" />
                             </div>
                             <p className="text-xs font-bold text-gray-400 italic">Bookings will wait for your manual approval before being confirmed.</p>
                          </div>
                          <div className="p-6 bg-gray-50 rounded-[32px] space-y-4">
                             <div className="flex items-center justify-between">
                               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Paid Booking</span>
                               <input type="checkbox" checked={state.formData.paidBooking} onChange={(e) => updateField('paidBooking', e.target.checked)} className="w-5 h-5 rounded-lg border-gray-200 text-primary focus:ring-primary" />
                             </div>
                             <div className="flex items-center gap-3">
                                <span className="text-xs font-black text-gray-700">Fee (Rs):</span>
                                <input type="text" value={state.formData.price} onChange={(e) => updateField('price', parseInt(e.target.value) || 0)} className="bg-white border border-gray-100 rounded-xl px-4 py-1 font-bold text-primary w-24" />
                             </div>
                          </div>
                       </div>
                    </div>
                  )}

                  {activeTab === 'success' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                       <div className="space-y-4">
                          <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Confirmation Message</h5>
                          <textarea 
                            value={state.formData.confirmMessage} 
                            onChange={(e) => updateField('confirmMessage', e.target.value)}
                            className="w-full min-h-[150px] p-8 bg-gray-50 rounded-[32px] border border-gray-100 outline-none font-bold text-gray-600 italic leading-relaxed"
                            placeholder="What should the user see after booking?"
                          />
                       </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Media & Resource Settings */}
            <div className="lg:col-span-4 space-y-10">
              {/* Media Card */}
              <div className="bg-white rounded-[48px] p-8 border border-gray-100 shadow-sm space-y-6">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] text-center">Service Cover</p>
                <div 
                  onClick={() => state.formData.image ? null : fileInputRef.current.click()}
                  className={`aspect-square bg-gray-50 border-2 border-dashed rounded-[40px] flex flex-col items-center justify-center gap-4 relative group cursor-pointer overflow-hidden transition-all ${
                    state.formData.image ? 'border-transparent' : 'border-gray-100 hover:border-primary/50'
                  }`}
                >
                  {state.formData.image ? (
                    <>
                      <img src={state.formData.image} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <button onClick={(e) => { e.stopPropagation(); fileInputRef.current.click(); }} className="p-3 bg-white rounded-xl shadow-lg hover:text-primary transition-all"><Upload className="w-5 h-5" /></button>
                        <button onClick={(e) => { e.stopPropagation(); updateField('image', ''); }} className="p-3 bg-white rounded-xl shadow-lg hover:text-red-500 transition-all"><Trash2 className="w-5 h-5" /></button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-3xl bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                        <Upload className="w-6 h-6 text-gray-300 group-hover:text-primary transition-colors" />
                      </div>
                      <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Upload Picture</span>
                    </>
                  )}
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                </div>
              </div>

              {/* Resource Settings */}
              <div className="bg-white rounded-[48px] p-10 border border-gray-100 shadow-sm space-y-10">
                <div className="space-y-6">
                   <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Assign to</span>
                      <div className="flex gap-2 p-1 bg-gray-50 rounded-xl">
                        <button className="px-4 py-1.5 bg-white shadow-sm rounded-lg text-[10px] font-black text-primary uppercase">User</button>
                        <button className="px-4 py-1.5 text-[10px] font-black text-gray-300 uppercase">Resources</button>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Staff</span>
                        <button onClick={() => setIsAddingUser(true)} className="p-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-all"><UserPlus className="w-4 h-4" /></button>
                      </div>
                      
                      {isAddingUser && (
                        <div className="flex gap-2 animate-in slide-in-from-top-2 duration-300">
                          <input type="text" placeholder="Name..." value={newUserName} onChange={(e) => setNewUserName(e.target.value)} className="flex-1 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold outline-none" />
                          <button onClick={addNewUser} className="px-4 bg-primary text-white rounded-xl text-xs font-black">Add</button>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {staff.map(u => (
                          <button 
                            key={u.id} 
                            onClick={() => toggleUserSelection(u.id)}
                            className={`px-4 py-2 rounded-2xl flex items-center gap-2 border transition-all ${
                              state.formData.selectedUsers.includes(u.id) ? 'bg-primary/5 border-primary text-primary' : 'bg-white border-gray-100 text-gray-400 opacity-60'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-lg flex items-center justify-center text-[8px] font-black ${state.formData.selectedUsers.includes(u.id) ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                              {u.initial}
                            </div>
                            <span className="text-[10px] font-black uppercase">{u.name}</span>
                          </button>
                        ))}
                      </div>
                   </div>

                   <div className="space-y-4 pt-6 border-t border-gray-50">
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Simultaneous Cap</span>
                         <input 
                           type="text" 
                           value={state.formData.capacityLimit} 
                           onChange={(e) => updateField('capacityLimit', parseInt(e.target.value) || 1)} 
                           className="w-12 bg-gray-50 border border-gray-100 rounded-lg px-2 py-1 text-center font-black text-primary text-xs" 
                         />
                      </div>
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mode</span>
                         <span className="text-[10px] font-black text-gray-700 uppercase italic">Automatic</span>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Floating Footer */}
      <div className="fixed bottom-10 right-10 z-50 flex items-center gap-4">
        <button 
          onClick={() => navigate('/organiser')}
          className="px-8 py-4 bg-white border border-gray-100 rounded-[20px] font-black text-[10px] uppercase tracking-widest text-gray-400 shadow-xl hover:text-gray-600 transition-all"
        >
          Discard
        </button>
        <button 
          onClick={handleSave}
          disabled={state.isLoading}
          className="px-12 py-5 bg-gray-800 text-white rounded-[24px] font-black text-sm uppercase tracking-widest shadow-2xl shadow-black/20 hover:bg-black hover:scale-105 active:scale-95 transition-all flex items-center gap-4"
        >
          {state.isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Save Changes
        </button>
      </div>

      {/* High Fidelity Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 lg:p-12 overflow-hidden">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-3xl" onClick={() => setIsPreviewOpen(false)}></div>
          <div className="bg-white w-full max-w-6xl h-full rounded-[64px] shadow-2xl relative z-10 overflow-hidden flex flex-col border border-white/20 animate-in zoom-in-95 duration-500">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <Eye className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-gray-800 uppercase tracking-widest text-sm">Previewing your Service</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">See what your customers will experience</p>
                </div>
              </div>
              <button onClick={() => setIsPreviewOpen(false)} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all">
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-12 bg-gray-50/50">
              <div className="max-w-4xl mx-auto space-y-16 pb-20">
                <div className="text-center space-y-6">
                   <h1 className="text-7xl font-black text-gray-800 tracking-tighter leading-none">{state.formData.title || "Your Epic Service"}</h1>
                   <p className="text-2xl text-gray-500 font-bold italic max-w-2xl mx-auto leading-relaxed">{state.formData.introMessage}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-12 bg-white p-12 rounded-[64px] shadow-2xl shadow-black/5 border border-gray-100">
                   <div className="space-y-8">
                      <div className="aspect-[4/3] bg-gray-50 rounded-[40px] overflow-hidden border border-gray-50 shadow-inner">
                         {state.formData.image ? (
                           <img src={state.formData.image} className="w-full h-full object-cover" />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center text-gray-200 font-black text-4xl">NO IMAGE</div>
                         )}
                      </div>
                      <div className="flex flex-wrap gap-8">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary"><Clock className="w-5 h-5" /></div>
                            <div>
                               <p className="text-[10px] font-black text-gray-300 uppercase">Duration</p>
                               <p className="text-sm font-black text-gray-700">{state.formData.duration} Hrs</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary"><MapPin className="w-5 h-5" /></div>
                            <div>
                               <p className="text-[10px] font-black text-gray-300 uppercase">Location</p>
                               <p className="text-sm font-black text-gray-700">{state.formData.location || "TBD"}</p>
                            </div>
                         </div>
                      </div>
                   </div>
                   
                   <div className="flex flex-col items-center justify-center text-center p-10 bg-primary/5 rounded-[48px] border border-primary/10 space-y-8">
                      <div className="w-20 h-20 rounded-[32px] bg-white shadow-xl flex items-center justify-center text-primary">
                        <Calendar className="w-10 h-10" />
                      </div>
                      <div className="space-y-2">
                         <h4 className="text-2xl font-black text-gray-800 tracking-tighter">Ready to schedule?</h4>
                         <p className="text-sm font-bold text-gray-400 italic">Select a date and time to continue with your booking.</p>
                      </div>
                      <Button className="w-full py-5 text-xl rounded-3xl" disabled>Book Now</Button>
                      <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest">SECURE BOOKING POWERED BY ZILLA</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AppointmentEditor;
