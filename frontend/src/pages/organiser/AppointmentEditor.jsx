import React, { useState, useEffect, useReducer, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Trash2, Plus, ArrowRight, Save, Eye, Send, Upload, X, UserPlus, Users as UsersIcon, MapPin, Clock } from 'lucide-react';
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
    selectedUsers: [1], // IDs of selected users
    manualConfirmation: false,
    capacityLimit: 50,
    paidBooking: false,
    bookingFee: 200,
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

  // Local state for users/staff
  const [staff, setStaff] = useState([
    { id: 1, name: 'User 1', initial: 'A1' },
    { id: 2, name: 'User 2', initial: 'A2' }
  ]);

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
              price: service.price || 0
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
        capacity: 1,
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
    setNewUserName('');
    setIsAddingUser(false);
  };

  return (
    <DashboardLayout title={state.isNew ? "New Appointment" : "Edit Appointment"}>
      <div className="flex flex-col gap-8 pb-32">
        {/* Header Actions */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-6">
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => navigate('/organiser/editor/new')}>New</Button>
            <Button variant="secondary" onClick={() => setIsPreviewOpen(true)}>
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button className="bg-primary text-white" onClick={handleSave}>
              <Send className="w-4 h-4 mr-2" />
              Publish
            </Button>
          </div>
          
          <button 
            onClick={() => navigate('/organiser/meetings')}
            className="flex items-center gap-2 px-6 py-2 bg-white border border-gray-100 rounded-xl font-bold text-gray-700 hover:shadow-sm transition-all"
          >
            <Calendar className="w-5 h-5 text-primary" />
            Meetings
          </button>
        </div>

        {/* Main Info Section */}
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left Column: Core Info */}
          <div className="flex-1 space-y-10">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Appointment Title</p>
              <input
                type="text"
                value={state.formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                className="text-5xl font-bold text-gray-800 border-none bg-transparent outline-none w-full placeholder:text-gray-200 tracking-tighter"
                placeholder="Enter Title..."
              />
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="w-24 text-sm font-bold text-gray-400 uppercase">Duration</span>
                <div className="flex items-center gap-2 border-b-2 border-gray-100 focus-within:border-primary transition-colors pb-1">
                  <input
                    type="text"
                    value={state.formData.duration}
                    onChange={(e) => updateField('duration', e.target.value)}
                    className="w-16 bg-transparent outline-none font-bold text-gray-700"
                    placeholder="00:30"
                  />
                  <span className="text-sm text-gray-400">HH:MM</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="w-24 text-sm font-bold text-gray-400 uppercase">Location</span>
                <div className="flex-1 border-b-2 border-gray-100 focus-within:border-primary transition-colors pb-1">
                  <input
                    type="text"
                    value={state.formData.location}
                    onChange={(e) => updateField('location', e.target.value)}
                    className="w-full bg-transparent outline-none font-bold text-gray-700"
                    placeholder="Doctor's Office"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Settings & Picture */}
          <div className="w-full lg:w-[450px] space-y-10">
            {/* Picture Upload */}
            <div className="flex justify-end">
              <div 
                onClick={() => state.formData.image ? null : fileInputRef.current.click()}
                className={`w-48 h-48 bg-gray-50 border-2 border-dashed rounded-[30px] flex flex-col items-center justify-center gap-4 relative group cursor-pointer overflow-hidden transition-all ${
                  state.formData.image ? 'border-transparent' : 'border-gray-100 hover:border-primary/50'
                }`}
              >
                {state.formData.image ? (
                  <>
                    <img src={state.formData.image} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <button 
                        onClick={(e) => { e.stopPropagation(); fileInputRef.current.click(); }}
                        className="p-3 bg-white rounded-xl shadow-lg hover:text-primary transition-all scale-90 hover:scale-100"
                      >
                        <Upload className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); updateField('image', ''); }}
                        className="p-3 bg-white rounded-xl shadow-lg hover:text-red-500 transition-all scale-90 hover:scale-100"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-200 group-hover:text-primary transition-colors" />
                    <span className="text-xs font-bold text-gray-300 uppercase tracking-widest group-hover:text-primary transition-colors">Upload Picture</span>
                  </>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                />
              </div>
            </div>

            <div className="bg-gray-50 rounded-[30px] p-8 space-y-8">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase">Book</span>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-sm text-gray-700">
                    <input type="radio" name="bookType" defaultChecked className="accent-primary" /> User
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-sm text-gray-700">
                    <input type="radio" name="bookType" className="accent-primary" /> Resources
                  </label>
                </div>
              </div>

              {/* User Selection with Add User Option */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400 uppercase">Users</span>
                  <button 
                    onClick={() => setIsAddingUser(true)}
                    className="p-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-all"
                  >
                    <UserPlus className="w-4 h-4" />
                  </button>
                </div>
                
                {isAddingUser && (
                  <div className="flex gap-2 animate-in slide-in-from-top-2 duration-300">
                    <input 
                      type="text" 
                      placeholder="User Name..."
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      className="flex-1 px-3 py-1 bg-white border border-primary/20 rounded-lg text-xs font-bold outline-none"
                    />
                    <button onClick={addNewUser} className="px-2 bg-primary text-white rounded-lg text-xs font-bold">Add</button>
                    <button onClick={() => setIsAddingUser(false)} className="px-2 bg-gray-200 text-gray-500 rounded-lg text-xs font-bold">X</button>
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  {staff.map(u => (
                    <button
                      key={u.id}
                      onClick={() => toggleUserSelection(u.id)}
                      className={`px-3 py-1.5 border rounded-xl flex items-center gap-2 transition-all ${
                        state.formData.selectedUsers.includes(u.id) 
                        ? 'bg-primary/5 border-primary text-primary shadow-sm' 
                        : 'bg-white border-gray-100 text-gray-400 opacity-60 grayscale'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${
                        state.formData.selectedUsers.includes(u.id) ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {u.initial}
                      </div>
                      <span className="text-xs font-bold">{u.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase">Assignment</span>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-sm text-gray-700">
                    <input type="radio" name="assignment" defaultChecked className="accent-primary" /> Automatically
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-sm text-gray-700">
                    <input type="radio" name="assignment" className="accent-primary" /> By visitor
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-gray-400 uppercase">Manage capacity</span>
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
                  <span className="text-xs font-medium text-gray-500">Allow <input type="text" className="w-8 border-b-2 border-gray-200 outline-none text-center bg-transparent" defaultValue="1" /> Simultaneous Appointment(s)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-12">
          <div className="flex gap-2 border-b border-gray-100 pb-4 mb-8">
            {['Schedule', 'Question', 'Options', 'Misc'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase())}
                className={`px-8 py-3 rounded-xl font-bold text-sm transition-all ${
                  activeTab === tab.toLowerCase() ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:bg-gray-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="min-h-[400px]">
            {activeTab === 'schedule' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <h3 className="text-3xl font-bold text-gray-200 uppercase tracking-tighter">schedule = {state.formData.scheduleType}</h3>
                
                <div className="w-full">
                  <div className="grid grid-cols-4 px-6 py-3 bg-gray-50 rounded-xl text-xs font-black uppercase text-gray-400 tracking-widest mb-4">
                    <span>Every</span>
                    <span className="text-right pr-12">From</span>
                    <span className="text-center"></span>
                    <span className="text-left pl-12">To</span>
                  </div>

                  <div className="space-y-2">
                    {state.formData.availability.map((item) => (
                      <div key={item.id} className="grid grid-cols-4 px-6 py-4 border-b border-gray-100 items-center group hover:bg-gray-50 transition-colors">
                        <select 
                          value={item.day}
                          onChange={(e) => updateAvailabilityLine(item.id, 'day', e.target.value)}
                          className="bg-transparent font-bold text-gray-700 italic outline-none cursor-pointer"
                        >
                          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                        <div className="text-right pr-12">
                          <input 
                            type="text" 
                            value={item.startTime} 
                            onChange={(e) => updateAvailabilityLine(item.id, 'startTime', e.target.value)}
                            className="bg-transparent text-gray-500 font-bold outline-none text-right w-16 focus:text-primary transition-colors" 
                          />
                        </div>
                        <div className="flex justify-center">
                          <ArrowRight className="w-10 h-4 text-primary opacity-30" />
                        </div>
                        <div className="flex items-center justify-between pl-12">
                          <input 
                            type="text" 
                            value={item.endTime} 
                            onChange={(e) => updateAvailabilityLine(item.id, 'endTime', e.target.value)}
                            className="bg-transparent text-gray-500 font-bold outline-none w-16 focus:text-primary transition-colors" 
                          />
                          <button 
                            onClick={() => removeAvailabilityLine(item.id)}
                            className="p-2 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <button 
                  onClick={addAvailabilityLine}
                  className="mt-6 px-6 py-3 font-bold text-primary hover:bg-primary/5 rounded-xl transition-all italic underline flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add a Line
                </button>
              </div>
            )}
            
            {activeTab === 'question' && (
              <div className="bg-white rounded-[30px] border border-gray-100 p-8 animate-in fade-in duration-300">
                <QuestionBuilder 
                  questions={state.formData.questions} 
                  onChange={(qs) => updateField('questions', qs)}
                />
              </div>
            )}

            {activeTab === 'options' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16 py-8 animate-in fade-in duration-300">
                <div className="space-y-12">
                  <div className="flex items-center gap-6">
                    <span className="w-32 text-xs font-bold text-gray-400 uppercase">Manual confirmation</span>
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        checked={state.formData.manualConfirmation}
                        onChange={(e) => updateField('manualConfirmation', e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer" 
                      />
                      <span className="text-sm font-bold text-gray-700 italic">Wait for my approval</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <span className="w-32 text-xs font-bold text-gray-400 uppercase">Paid Booking</span>
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        checked={state.formData.paidBooking}
                        onChange={(e) => updateField('paidBooking', e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer" 
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-700 italic">Booking Fee: Rs</span>
                        <input 
                          type="text" 
                          value={state.formData.price}
                          onChange={(e) => updateField('price', parseInt(e.target.value) || 0)}
                          className="w-16 border-b-2 border-gray-200 outline-none text-center bg-transparent font-bold text-primary" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <span className="w-32 text-xs font-bold text-gray-400 uppercase">Schedule Mode</span>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="radio" 
                          name="scheduleMode" 
                          checked={state.formData.scheduleType === 'weekly'}
                          onChange={() => updateField('scheduleType', 'weekly')}
                          className="w-5 h-5 accent-primary" 
                        />
                        <span className="font-bold text-gray-700 italic group-hover:text-primary transition-colors">weekly</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="radio" 
                          name="scheduleMode" 
                          checked={state.formData.scheduleType === 'flexible'}
                          onChange={() => updateField('scheduleType', 'flexible')}
                          className="w-5 h-5 accent-primary" 
                        />
                        <span className="font-bold text-gray-700 italic group-hover:text-primary transition-colors">flexible</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-12">
                  <div className="flex items-center gap-6">
                    <span className="w-32 text-xs font-bold text-gray-400 uppercase">Slot Interval</span>
                    <div className="flex items-center gap-3 border-b-2 border-gray-100 pb-1 w-32 focus-within:border-primary transition-colors">
                      <input 
                        type="text" 
                        value={state.formData.createSlotHours} 
                        onChange={(e) => updateField('createSlotHours', e.target.value)}
                        className="w-full bg-transparent outline-none font-bold text-gray-700 text-center" 
                      />
                      <span className="text-xs font-bold text-gray-400 uppercase">Hrs</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <span className="w-32 text-xs font-bold text-gray-400 uppercase">Cancellation</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-400 uppercase">up to</span>
                      <div className="flex items-center gap-2 border-b-2 border-gray-100 pb-1 w-24 focus-within:border-primary transition-colors">
                        <input 
                          type="text" 
                          value={state.formData.cancellationHours} 
                          onChange={(e) => updateField('cancellationHours', e.target.value)}
                          className="w-full bg-transparent outline-none font-bold text-gray-700 text-center" 
                        />
                      </div>
                      <span className="text-xs font-bold text-gray-400 uppercase">hrs before</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'misc' && (
              <div className="space-y-12 py-8 max-w-4xl animate-in fade-in duration-300">
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em]">Introduction page message</h4>
                  <div className="p-8 bg-white border border-gray-100 rounded-[30px] shadow-sm hover:shadow-md transition-shadow">
                    <textarea
                      value={state.formData.introMessage}
                      onChange={(e) => updateField('introMessage', e.target.value)}
                      className="w-full min-h-[120px] bg-transparent outline-none text-xl font-bold text-gray-600 italic leading-relaxed"
                      placeholder="Show this to your customers before they book..."
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em]">Confirmation page message</h4>
                  <div className="p-8 bg-white border border-gray-100 rounded-[30px] shadow-sm hover:shadow-md transition-shadow">
                    <textarea
                      value={state.formData.confirmMessage}
                      onChange={(e) => updateField('confirmMessage', e.target.value)}
                      className="w-full min-h-[120px] bg-transparent outline-none text-xl font-bold text-gray-600 italic leading-relaxed"
                      placeholder="Show this to your customers after a successful booking..."
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Save */}
        <div className="fixed bottom-8 right-8 z-50">
          <Button 
            isLoading={state.isLoading} 
            onClick={handleSave} 
            className="px-12 py-5 text-xl shadow-2xl shadow-primary/30 rounded-2xl scale-105 hover:scale-110 active:scale-95 transition-all"
          >
            <Save className="w-5 h-5 mr-3" />
            Save Changes
          </Button>
        </div>

        {/* Preview Modal */}
        {isPreviewOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 lg:p-20">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" onClick={() => setIsPreviewOpen(false)}></div>
            <div className="bg-white w-full max-w-6xl h-full rounded-[48px] shadow-2xl relative z-10 overflow-hidden flex flex-col border border-white/20">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black">P</div>
                  <span className="font-black text-gray-800 uppercase tracking-widest text-sm">Preview Mode</span>
                </div>
                <button onClick={() => setIsPreviewOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto bg-gray-50/50 p-12">
                <div className="max-w-4xl mx-auto space-y-12">
                  <div className="text-center space-y-4">
                    <h1 className="text-6xl font-black text-gray-800 tracking-tighter">{state.formData.title || "Appointment Title"}</h1>
                    <p className="text-xl text-gray-500 font-medium italic">{state.formData.introMessage}</p>
                  </div>
                  
                  <div className="bg-white rounded-[40px] p-12 shadow-2xl shadow-black/5 border border-gray-100 grid md:grid-cols-2 gap-12">
                    <div className="space-y-8">
                       <div className="aspect-video bg-gray-100 rounded-3xl overflow-hidden border border-gray-100">
                          {state.formData.image ? (
                            <img src={state.formData.image} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold">No Image</div>
                          )}
                       </div>
                       <div className="space-y-4">
                          <div className="flex items-center gap-4 text-gray-600 font-bold">
                            <Clock className="w-5 h-5 text-primary" />
                            {state.formData.duration} Hours
                          </div>
                          <div className="flex items-center gap-4 text-gray-600 font-bold">
                            <MapPin className="w-5 h-5 text-primary" />
                            {state.formData.location || "Online / TBD"}
                          </div>
                       </div>
                    </div>
                    <div className="bg-gray-50 rounded-3xl p-8 flex flex-col items-center justify-center text-center border border-gray-100">
                       <UsersIcon className="w-16 h-16 text-primary/20 mb-6" />
                       <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Select a date and time to see the full booking flow.</p>
                       <Button disabled className="mt-8">Book Appointment</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AppointmentEditor;
