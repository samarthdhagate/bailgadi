import React, { useReducer, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, Plus, Trash2, Calendar, Clock, HelpCircle, Settings, MessageSquare } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Input from '../../components/Input';

const initialState = {
  title: '',
  duration: 30,
  location: '',
  description: '',
  resources: [],
  capacityEnabled: false,
  maxCapacity: 1,
  schedule: [
    { day: 'Monday', slots: [{ from: '09:00', to: '17:00' }] },
    { day: 'Tuesday', slots: [{ from: '09:00', to: '17:00' }] },
    { day: 'Wednesday', slots: [{ from: '09:00', to: '17:00' }] },
    { day: 'Thursday', slots: [{ from: '09:00', to: '17:00' }] },
    { day: 'Friday', slots: [{ from: '09:00', to: '17:00' }] }
  ],
  questions: [],
  manualConfirmation: false,
  isPaid: false,
  fee: 0,
  introMessage: '',
  confirmMessage: ''
};

function reducer(state, action) {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return { ...state, [action.field]: action.value };
    case 'ADD_QUESTION':
      return { ...state, questions: [...state.questions, { id: Date.now(), type: 'text', label: '', required: false }] };
    case 'REMOVE_QUESTION':
      return { ...state, questions: state.questions.filter(q => q.id !== action.id) };
    case 'UPDATE_QUESTION':
      return { 
        ...state, 
        questions: state.questions.map(q => q.id === action.id ? { ...q, ...action.data } : q) 
      };
    default:
      return state;
  }
}

const AppointmentEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [activeTab, setActiveTab] = useState('basic');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    navigate('/organiser');
  };

  const tabs = [
    { id: 'basic', label: 'Basic Details', icon: Calendar },
    { id: 'schedule', label: 'Schedule', icon: Clock },
    { id: 'questions', label: 'Questions', icon: HelpCircle },
    { id: 'options', label: 'Options', icon: Settings },
    { id: 'misc', label: 'Misc', icon: MessageSquare },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return (
          <div className="space-y-6">
            <Input 
              label="Appointment Title" 
              value={state.title} 
              onChange={e => dispatch({ type: 'UPDATE_FIELD', field: 'title', value: e.target.value })} 
              placeholder="e.g. 15 Minute Discovery Call"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Duration (minutes)" 
                type="number" 
                value={state.duration} 
                onChange={e => dispatch({ type: 'UPDATE_FIELD', field: 'duration', value: e.target.value })} 
              />
              <Input 
                label="Location" 
                value={state.location} 
                onChange={e => dispatch({ type: 'UPDATE_FIELD', field: 'location', value: e.target.value })} 
              />
            </div>
            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                checked={state.capacityEnabled} 
                onChange={e => dispatch({ type: 'UPDATE_FIELD', field: 'capacityEnabled', value: e.target.checked })}
                className="w-4 h-4 rounded text-primary"
              />
              <label className="text-sm font-medium">Enable Group Booking / Capacity</label>
            </div>
          </div>
        );
      case 'schedule':
        return (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-800">Weekly Availability</h3>
            {state.schedule.map((day, idx) => (
              <div key={day.day} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span className="font-medium w-24">{day.day}</span>
                <div className="flex-1 flex flex-col gap-2">
                  {day.slots.map((slot, sIdx) => (
                    <div key={sIdx} className="flex items-center gap-2">
                      <input type="time" defaultValue={slot.from} className="p-1 border rounded" />
                      <span>to</span>
                      <input type="time" defaultValue={slot.to} className="p-1 border rounded" />
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="p-2 ml-4">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        );
      case 'questions':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-gray-800">Custom Questions</h3>
              <Button variant="outline" onClick={() => dispatch({ type: 'ADD_QUESTION' })} className="flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add Question
              </Button>
            </div>
            {state.questions.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
                No custom questions added yet.
              </div>
            ) : (
              state.questions.map(q => (
                <Card key={q.id} className="flex flex-col gap-4 border-gray-200 shadow-none">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <Input 
                        label="Label" 
                        value={q.label} 
                        onChange={e => dispatch({ type: 'UPDATE_QUESTION', id: q.id, data: { label: e.target.value } })}
                      />
                      <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">Type</label>
                        <select 
                          className="input-field"
                          value={q.type}
                          onChange={e => dispatch({ type: 'UPDATE_QUESTION', id: q.id, data: { type: e.target.value } })}
                        >
                          <option value="text">Text Input</option>
                          <option value="textarea">Textarea</option>
                          <option value="checkbox">Checkbox</option>
                        </select>
                      </div>
                    </div>
                    <button onClick={() => dispatch({ type: 'REMOVE_QUESTION', id: q.id })} className="text-red-500 p-2 ml-2">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </Card>
              ))
            )}
          </div>
        );
      case 'options':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="font-bold">Manual Confirmation</p>
                <p className="text-sm text-gray-500">You must approve each booking before it is confirmed.</p>
              </div>
              <input 
                type="checkbox" 
                checked={state.manualConfirmation}
                onChange={e => dispatch({ type: 'UPDATE_FIELD', field: 'manualConfirmation', value: e.target.checked })}
                className="w-5 h-5 rounded text-primary"
              />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="font-bold">Paid Booking</p>
                <input 
                  type="checkbox" 
                  checked={state.isPaid}
                  onChange={e => dispatch({ type: 'UPDATE_FIELD', field: 'isPaid', value: e.target.checked })}
                  className="w-5 h-5 rounded text-primary"
                />
              </div>
              {state.isPaid && (
                <Input 
                  label="Booking Fee ($)" 
                  type="number" 
                  value={state.fee}
                  onChange={e => dispatch({ type: 'UPDATE_FIELD', field: 'fee', value: e.target.value })}
                />
              )}
            </div>
          </div>
        );
      case 'misc':
        return (
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Introduction Message</label>
              <textarea 
                className="input-field min-h-[100px]" 
                placeholder="Show this message to users before they book..."
                value={state.introMessage}
                onChange={e => dispatch({ type: 'UPDATE_FIELD', field: 'introMessage', value: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Confirmation Message</label>
              <textarea 
                className="input-field min-h-[100px]" 
                placeholder="Show this message after a successful booking..."
                value={state.confirmMessage}
                onChange={e => dispatch({ type: 'UPDATE_FIELD', field: 'confirmMessage', value: e.target.value })}
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <DashboardLayout title={id === 'new' ? 'New Appointment Type' : 'Edit Appointment'}>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <button 
            onClick={() => navigate('/organiser')}
            className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors"
          >
            <ChevronLeft className="w-5 h-5" /> Back to list
          </button>
          <Button isLoading={isSaving} onClick={handleSave} className="flex items-center gap-2">
            <Save className="w-5 h-5" /> Save Changes
          </Button>
        </div>

        <div className="flex gap-8">
          {/* Tabs Sidebar */}
          <div className="w-64 flex flex-col gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                  activeTab === tab.id 
                    ? 'bg-primary text-white shadow-md' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : 'text-gray-400'}`} />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1">
            <Card className="p-8">
              {renderTabContent()}
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AppointmentEditor;
