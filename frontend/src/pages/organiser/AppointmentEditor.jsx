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
    questions: [],
    availability: []
  },
  isLoading: false,
  isNew: true
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.value };
    case 'SET_DATA':
      return { ...state, formData: action.value, isNew: false };
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
      const fetch = async () => {
        try {
          const res = await organiserService.getAppointmentById(id);
          dispatch({ type: 'SET_DATA', value: res.data });
        } catch (err) {
          console.error(err);
        }
      };
      fetch();
    }
  }, [id]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      if (state.isNew) {
        await organiserService.createAppointment(state.formData);
      } else {
        await organiserService.updateAppointment(id, state.formData);
      }
      navigate('/organiser');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
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
          
          <button className="flex items-center gap-2 px-6 py-2 bg-white border border-gray-100 rounded-xl font-bold text-gray-700 hover:shadow-sm transition-all">
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
                onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'title', value: e.target.value })}
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
                    onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'duration', value: e.target.value })}
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
                    onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'location', value: e.target.value })}
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
                <h3 className="text-3xl font-bold text-gray-300">schedule = Weekly</h3>
                
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
                    
                    <button className="mt-6 px-6 py-3 font-bold text-primary hover:bg-primary/5 rounded-xl transition-all italic underline">
                      Add a Line
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'question' && (
              <div className="bg-white rounded-[30px] border border-gray-100 p-8">
                <QuestionBuilder 
                  questions={state.formData.questions} 
                  onChange={(qs) => dispatch({ type: 'UPDATE_FIELD', field: 'questions', value: qs })}
                />
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
