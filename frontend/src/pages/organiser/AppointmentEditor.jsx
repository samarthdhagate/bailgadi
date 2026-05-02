import React, { useState, useEffect, useReducer } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Trash2, Plus, ArrowRight, Save, Eye, Send } from 'lucide-react';
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
      { id: 2, label: 'Phone', type: 'phone', required: true },
      { id: 3, label: 'Symptoms', type: 'text', required: false }
    ],
    scheduleType: 'weekly', // 'weekly' or 'flexible'
    availability: [],
    manualConfirmation: false,
    capacityLimit: 50,
    paidBooking: false,
    bookingFee: 200,
    createSlotHours: 1,
    cancellationHours: 24,
    introMessage: 'Schedule your visit today and experience expert dental care brought right to your doorstep.',
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
  const [state, dispatch] = useReducer(reducer, initialState);
  const [activeTab, setActiveTab] = useState('schedule');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (id && id !== 'new') {
      const fetchService = async () => {
        try {
          const res = await organiserService.getServices();
          const service = (res.data || []).find(s => String(s.id) === String(id));
          if (service) {
            dispatch({ type: 'SET_DATA', value: {
              title: service.name,
              duration: service.duration_min ? String(service.duration_min).padStart(2,'0') + ':00' : '00:30',
              location: service.location || '',
              description: service.description || '',
              manualConfirmation: service.manual_confirmation || false,
              paidBooking: service.advance_payment || false,
            }});
          }
        } catch (err) {
          console.error(err);
        }
      };
      fetchService();
    }
  }, [id]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const payload = {
        name: state.formData.title,
        duration_min: parseInt(state.formData.duration) || 30,
        location: state.formData.location,
        description: state.formData.description,
        manual_confirmation: state.formData.manualConfirmation,
        advance_payment: state.formData.paidBooking,
        capacity: 1,
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
      setIsLoading(false);
    }
  };

  const updateField = (field, value) => {
    dispatch({ type: 'UPDATE_FIELD', field, value });
  };

  return (
    <DashboardLayout title={state.isNew ? "New Appointment" : "Edit Appointment"}>
      <div className="flex flex-col gap-8">
        {/* Header Actions */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-6">
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => navigate('/organiser')}>New</Button>
            <Button variant="secondary">Preview</Button>
            <Button className="bg-primary text-white">Publish</Button>
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
                className="text-5xl font-bold text-gray-800 border-none bg-transparent outline-none w-full placeholder:text-gray-200"
                placeholder="Appointment Title"
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
                  />
                  <span className="text-sm text-gray-400">Hours</span>
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
              <div className="w-48 h-48 bg-gray-50 border-2 border-dashed border-gray-100 rounded-[30px] flex flex-col items-center justify-center gap-4 relative group">
                <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">Picture</span>
                <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-4">
                  <button className="p-2 bg-white rounded-lg shadow-sm hover:text-primary"><Plus className="w-4 h-4" /></button>
                  <button className="p-2 bg-white rounded-lg shadow-sm hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
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

              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase">User</span>
                <div className="flex gap-3">
                  <div className="px-3 py-1 bg-white border border-gray-100 rounded-lg flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center text-[10px] font-bold">A1</span>
                    <span className="text-xs font-bold text-gray-700">User 1</span>
                  </div>
                  <div className="px-3 py-1 bg-white border border-gray-100 rounded-lg flex items-center gap-2 opacity-50">
                    <span className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center text-[10px] font-bold">A2</span>
                    <span className="text-xs font-bold text-gray-700">User 2</span>
                  </div>
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
                  <span className="text-xs font-medium text-gray-500">Allow <input type="text" className="w-8 border-b-2 border-gray-200 outline-none text-center bg-transparent" defaultValue="1" /> Simultaneous Appointment(s) per user</span>
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
                className={`px-8 py-2 rounded-xl font-bold text-sm transition-all ${
                  activeTab === tab.toLowerCase() ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:bg-gray-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="min-h-[400px]">
            {activeTab === 'schedule' && (
              <div className="space-y-8">
                <h3 className="text-3xl font-bold text-gray-300 uppercase tracking-tighter">schedule = {state.formData.scheduleType}</h3>
                
                {state.formData.scheduleType === 'weekly' ? (
                  <div className="w-full">
                    <div className="grid grid-cols-4 px-6 py-3 bg-gray-50 rounded-xl text-xs font-black uppercase text-gray-400 tracking-widest mb-4">
                      <span>Every</span>
                      <span className="text-right pr-12">From</span>
                      <span className="text-center"></span>
                      <span className="text-left pl-12">To</span>
                    </div>

                    <div className="space-y-2">
                      {['Monday', 'Monday', 'Tuesday', 'Tuesday', 'Wednesday', 'Wednesday', 'Thursday', 'Thursday', 'Friday', 'Friday'].map((day, i) => (
                        <div key={i} className="grid grid-cols-4 px-6 py-4 border-b border-gray-100 items-center group hover:bg-gray-50 transition-colors">
                          <span className="font-bold text-gray-700 italic">{day}</span>
                          <div className="text-right pr-12">
                            <input type="text" defaultValue={i % 2 === 0 ? "9:00" : "14:00"} className="bg-transparent text-gray-500 font-medium outline-none text-right w-16" />
                          </div>
                          <div className="flex justify-center">
                            <ArrowRight className="w-10 h-4 text-primary opacity-50" />
                          </div>
                          <div className="flex items-center justify-between pl-12">
                            <input type="text" defaultValue={i % 2 === 0 ? "12:00" : "17:00"} className="bg-transparent text-gray-500 font-medium outline-none w-16" />
                            <button className="p-1 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-12 px-6 py-3 bg-gray-50 rounded-xl text-xs font-black uppercase text-gray-400 tracking-widest mb-4">
                      <span className="col-span-11">Slot</span>
                      <span className="col-span-1"></span>
                    </div>
                    {[
                      { from: 'Dec 12, 11:00 AM', to: 'Dec 15, 12:00 PM' },
                      { from: 'Dec 01, 11:00 AM', to: 'Dec 01, 06:00 PM' }
                    ].map((slot, i) => (
                      <div key={i} className="grid grid-cols-12 px-6 py-4 border-b border-gray-100 items-center group hover:bg-gray-50 transition-colors">
                        <div className="col-span-11 flex items-center gap-6">
                          <span className="font-bold text-gray-700 italic">{slot.from}</span>
                          <ArrowRight className="w-10 h-4 text-primary opacity-50" />
                          <span className="font-bold text-gray-700 italic">{slot.to}</span>
                        </div>
                        <div className="col-span-1 flex justify-end">
                          <button className="p-1 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <button className="mt-6 px-6 py-3 font-bold text-primary hover:bg-primary/5 rounded-xl transition-all italic underline">
                  Add a Line
                </button>
              </div>
            )}
            
            {activeTab === 'question' && (
              <div className="bg-white rounded-[30px] border border-gray-100 p-8">
                <QuestionBuilder 
                  questions={state.formData.questions} 
                  onChange={(qs) => updateField('questions', qs)}
                />
              </div>
            )}

            {activeTab === 'options' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16 py-8">
                <div className="space-y-12">
                  <div className="flex items-center gap-6">
                    <span className="w-32 text-xs font-bold text-gray-400 uppercase">Manual confirmation</span>
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        checked={state.formData.manualConfirmation}
                        onChange={(e) => updateField('manualConfirmation', e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary" 
                      />
                      <span className="text-sm font-bold text-gray-700 italic">Upto <input type="text" className="w-12 border-b-2 border-gray-200 outline-none text-center bg-transparent" defaultValue={state.formData.capacityLimit} />% of capacity</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <span className="w-32 text-xs font-bold text-gray-400 uppercase">Paid Booking</span>
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        checked={state.formData.paidBooking}
                        onChange={(e) => updateField('paidBooking', e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary" 
                      />
                      <span className="text-sm font-bold text-gray-700 italic">Booking Fees (Rs <input type="text" className="w-12 border-b-2 border-gray-200 outline-none text-center bg-transparent" defaultValue={state.formData.bookingFee} /> Per booking)</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <span className="w-32 text-xs font-bold text-gray-400 uppercase">Schedule</span>
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
                    <span className="w-32 text-xs font-bold text-gray-400 uppercase">Create Slot</span>
                    <div className="flex items-center gap-3 border-b-2 border-gray-100 pb-1 w-32">
                      <input type="text" defaultValue={state.formData.createSlotHours} className="w-full bg-transparent outline-none font-bold text-gray-700 text-center" />
                      <span className="text-xs font-bold text-gray-400 uppercase">Hours</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <span className="w-32 text-xs font-bold text-gray-400 uppercase">Cancellation</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-400 uppercase">up to</span>
                      <div className="flex items-center gap-2 border-b-2 border-gray-100 pb-1 w-24">
                        <input type="text" defaultValue={state.formData.cancellationHours} className="w-full bg-transparent outline-none font-bold text-gray-700 text-center" />
                      </div>
                      <span className="text-xs font-bold text-gray-400 uppercase">hour(s) before the booking</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'misc' && (
              <div className="space-y-12 py-8 max-w-4xl">
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em]">Introduction page message</h4>
                  <div className="p-8 bg-white border border-gray-100 rounded-[30px] shadow-sm">
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
                  <div className="p-8 bg-white border border-gray-100 rounded-[30px] shadow-sm">
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
        <div className="fixed bottom-8 right-8">
          <Button isLoading={isLoading} onClick={handleSave} className="px-12 py-4 text-lg shadow-xl shadow-primary/20">
            Save Appointment
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AppointmentEditor;
