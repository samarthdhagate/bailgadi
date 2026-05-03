import { useState, useEffect, useReducer, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Trash2, Plus, Save, Eye, Send, Upload, X, MapPin, Clock, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import Button from '../../components/Button';
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
    availabilityStartDate: new Date().toISOString().split('T')[0],
    availabilityEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    assignmentMode: 'resource',
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

const DURATION_OPTIONS = [
  { label: '15 minutes', value: '00:15' },
  { label: '30 minutes', value: '00:30' },
  { label: '45 minutes', value: '00:45' },
  { label: '1 hour', value: '01:00' },
  { label: '1 hour 30 minutes', value: '01:30' },
  { label: '2 hours', value: '02:00' },
  { label: '3 hours', value: '03:00' },
  { label: '4 hours', value: '04:00' },
];

const RESOURCE_TYPES = [
  { label: 'Staff', value: 'staff' },
  { label: 'Court', value: 'court' },
  { label: 'Swim Lane', value: 'swim_lane' },
  { label: 'Chair', value: 'chair' },
  { label: 'Room', value: 'room' },
  { label: 'Equipment', value: 'equipment' },
];

const formatIndianDate = (value) => {
  if (!value) return '';
  const parts = String(value).split('-');
  if (parts.length !== 3) return value;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

const getDefaultSlotWindow = (availability) => ({
  startTime: availability?.[0]?.startTime || '09:00',
  endTime: availability?.[0]?.endTime || '17:00',
});

const getDateParts = (value) => {
  const [year, month, day] = String(value || new Date().toISOString().split('T')[0]).split('-');
  return {
    day: Number(day) || 1,
    month: Number(month) || 1,
    year: Number(year) || new Date().getFullYear(),
  };
};

const toDateValue = (date) => (
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
);

const toLocalDate = (value) => {
  const parts = getDateParts(value);
  return new Date(parts.year, parts.month - 1, parts.day);
};

const normalizeAvailability = (value) => {
  let availability = value;

  if (typeof availability === 'string') {
    try {
      availability = JSON.parse(availability);
    } catch {
      availability = null;
    }
  }

  if (!Array.isArray(availability)) {
    return initialState.formData.availability;
  }

  const normalized = availability
    .filter(Boolean)
    .map((item, index) => ({
      id: item.id || `${Date.now()}-${index}`,
      day: item.day || item.weekday || 'Monday',
      date: item.date || '',
      startTime: item.startTime || item.start_time || item.from || '09:00',
      endTime: item.endTime || item.end_time || item.to || '17:00',
    }));

  return normalized.length > 0 ? normalized : initialState.formData.availability;
};

const DatePickerField = ({ value, onChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => toLocalDate(value));
  const selectedDate = toLocalDate(value);
  const monthStart = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const gridStart = new Date(monthStart);
  gridStart.setDate(monthStart.getDate() - monthStart.getDay());
  const calendarDays = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return date;
  });

  const changeMonth = (offset) => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));
  };

  const selectDate = (date) => {
    onChange(toDateValue(date));
    setViewDate(date);
    setIsOpen(false);
  };

  return (
    <div className="relative min-w-0">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className={`flex w-full min-w-0 items-center justify-between gap-3 rounded-2xl border border-gray-300 bg-white px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-black text-black outline-none transition-all hover:border-primary/50 focus:border-primary ${className}`}
      >
        <span>{formatIndianDate(value)}</span>
        <Calendar className="h-4 w-4 flex-shrink-0 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute left-1/2 top-[calc(100%+0.5rem)] z-50 w-[min(18rem,calc(100vw-2rem))] -translate-x-1/2 rounded-3xl border border-gray-100 bg-white p-3 sm:left-0 sm:w-[20rem] sm:translate-x-0 sm:p-4 shadow-2xl shadow-black/15">
          <div className="mb-3 flex items-center justify-between gap-3">
            <button type="button" onClick={() => changeMonth(-1)} className="rounded-xl border border-gray-100 p-2 text-gray-600 hover:text-primary">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="text-center">
              <p className="text-sm font-black text-black">
                {viewDate.toLocaleString('en-IN', { month: 'long' })} {viewDate.getFullYear()}
              </p>
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">DD/MM/YYYY</p>
            </div>
            <button type="button" onClick={() => changeMonth(1)} className="rounded-xl border border-gray-100 p-2 text-gray-600 hover:text-primary">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
              <div key={`${day}-${index}`} className="py-2 text-[9px] font-black uppercase text-gray-400">{day}</div>
            ))}
            {calendarDays.map((date) => {
              const isCurrentMonth = date.getMonth() === viewDate.getMonth();
              const isSelected = toDateValue(date) === toDateValue(selectedDate);

              return (
                <button
                  key={toDateValue(date)}
                  type="button"
                  onClick={() => selectDate(date)}
                  className={`aspect-square rounded-xl text-[11px] sm:text-xs font-black transition-all ${
                    isSelected
                      ? 'bg-primary text-white shadow-lg shadow-primary/20'
                      : isCurrentMonth
                        ? 'text-black hover:bg-primary/10 hover:text-primary'
                        : 'text-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
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
  const [isAddingResource, setIsAddingResource] = useState(false);
  const [newResource, setNewResource] = useState({ name: '', type: 'staff' });
  const [resources, setResources] = useState([]);

  useEffect(() => {
    if (id && id !== 'new') {
      const fetchService = async () => {
        dispatch({ type: 'SET_LOADING', value: true });
        try {
          const res = await organiserService.getServices();
          const service = (res.data || []).find(s => String(s.id) === String(id));
          if (service) {
            const serviceData = {
              title: service.name,
              duration: service.duration_min ? String(Math.floor(service.duration_min / 60)).padStart(2,'0') + ':' + String(service.duration_min % 60).padStart(2,'0') : '00:30',
              location: service.location || '',
              description: service.description || '',
              manualConfirmation: service.manual_confirmation || false,
              paidBooking: service.advance_payment || false,
              image: service.image || '',
              price: service.price || 0,
              questions: service.questions || initialState.formData.questions,
              availability: normalizeAvailability(service.availability),
              assignmentMode: 'resource',
            };
            dispatch({ type: 'SET_DATA', value: serviceData });
            try {
              const resourceRes = await organiserService.getResources(id);
              setResources(resourceRes.data || []);
            } catch (resourceErr) {
              console.error('Failed to load resources', resourceErr);
            }
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
        status: 'published',
        assignment_mode: 'manual',
        availability: state.formData.availability,
        availability_start_date: state.formData.availabilityStartDate,
        availability_end_date: state.formData.availabilityEndDate
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

  const updateDefaultSlotWindow = (field, value) => {
    const availability = normalizeAvailability(state.formData.availability);
    const updated = availability.map((item) => ({ ...item, [field]: value }));
    updateField('availability', updated.length > 0 ? updated : [{
      id: Date.now(),
      day: 'Monday',
      startTime: field === 'startTime' ? value : '09:00',
      endTime: field === 'endTime' ? value : '17:00',
    }]);
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

  const addAvailabilityLine = (type = 'recurring') => {
    const newLine = {
      id: Date.now(),
      day: type === 'recurring' ? 'Monday' : '',
      date: type === 'specific' ? new Date().toISOString().split('T')[0] : '',
      startTime: '09:00',
      endTime: '17:00'
    };
    updateField('availability', [...normalizeAvailability(state.formData.availability), newLine]);
  };

  const removeAvailabilityLine = (id) => {
    updateField('availability', normalizeAvailability(state.formData.availability).filter(a => a.id !== id));
  };

  const updateAvailabilityLine = (id, field, value) => {
    const updated = normalizeAvailability(state.formData.availability).map(a => 
      a.id === id ? { ...a, [field]: value } : a
    );
    updateField('availability', updated);
  };

  const addNewResource = async () => {
    if (!newResource.name.trim()) return;
    if (state.isNew || !id || id === 'new') {
      alert('Save the service first, then add resources to it.');
      return;
    }

    try {
      const res = await organiserService.createResource(id, newResource);
      setResources([...resources, res.data]);
      setNewResource({ name: '', type: 'staff' });
      setIsAddingResource(false);
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to add resource.');
    }
  };

  const availabilityRows = normalizeAvailability(state.formData.availability);
  const defaultSlotWindow = getDefaultSlotWindow(availabilityRows);
  const durationOptions = DURATION_OPTIONS.some((option) => option.value === state.formData.duration)
    ? DURATION_OPTIONS
    : [{ label: state.formData.duration, value: state.formData.duration }, ...DURATION_OPTIONS];

  return (
    <DashboardLayout title={state.isNew ? "Create Service" : "Edit Service"}>
      {/* Scrollable Container */}
      <div className="h-[calc(100vh-8rem)] sm:h-[calc(100vh-10rem)] overflow-y-auto overflow-x-hidden px-1 pr-0 sm:pr-4 scrollbar-hide">
        <div className="mx-auto flex w-full max-w-[1440px] min-w-0 flex-col gap-5 sm:gap-8 xl:gap-10 pb-32">
          
          {/* Action Bar */}
          <div className="flex min-w-0 flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-between gap-3 sm:gap-6 bg-white/50 backdrop-blur-sm p-3 sm:p-5 xl:p-6 rounded-[24px] sm:rounded-[32px] border border-white/20 shadow-sm">
            <div className="grid min-w-0 grid-cols-3 sm:flex gap-2 sm:gap-3">
              <button 
                onClick={() => navigate('/organiser/editor/new')}
                className="min-w-0 px-2 sm:px-6 py-2 bg-gray-50 text-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all"
              >
                New
              </button>
              <button 
                onClick={() => setIsPreviewOpen(true)}
                className="min-w-0 px-2 sm:px-6 py-2 bg-gray-50 text-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center justify-center gap-1.5 sm:gap-2"
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
              <button 
                onClick={handleSave}
                className="min-w-0 px-2 sm:px-8 py-2 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1.5 sm:gap-2"
              >
                <Send className="w-4 h-4" />
                Publish
              </button>
            </div>
            
            <button 
              onClick={() => navigate('/organiser/meetings')}
              className="flex min-w-0 items-center justify-center gap-2 px-6 py-2 bg-white border border-gray-300 rounded-xl font-bold text-black hover:shadow-sm transition-all"
            >
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-xs uppercase tracking-wider">Meetings</span>
            </button>
          </div>

          <div className="grid min-w-0 grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 xl:gap-10">
            {/* Left: Basic Info */}
            <div className="min-w-0 lg:col-span-8 space-y-7 sm:space-y-10 xl:space-y-12 bg-white rounded-[28px] sm:rounded-[40px] xl:rounded-[48px] p-4 sm:p-7 xl:p-12 border border-gray-100 shadow-sm">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-black uppercase tracking-[0.2em] pl-1">Service Identity</p>
                <input
                  type="text"
                  value={state.formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  className="text-[clamp(2rem,8vw,3.75rem)] font-black text-black border-none bg-transparent outline-none w-full placeholder:text-gray-700 tracking-tighter leading-[0.95]"
                  placeholder="Name your amazing service..."
                />
              </div>

              <div className="grid min-w-0 md:grid-cols-2 gap-5 md:gap-8 xl:gap-10">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-black uppercase tracking-[0.2em] pl-1">Duration</p>
                  <div className="flex items-center gap-3 border-b-2 border-gray-300 focus-within:border-primary transition-all pb-3">
                    <Clock className="w-5 h-5 text-gray-900" />
                    <select
                      value={state.formData.duration}
                      onChange={(e) => updateField('duration', e.target.value)}
                      className="min-w-0 bg-transparent outline-none font-black text-xl sm:text-2xl text-black w-full"
                    >
                      {durationOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-black text-black uppercase tracking-[0.2em] pl-1">Location</p>
                  <div className="flex items-center gap-3 border-b-2 border-gray-300 focus-within:border-primary transition-all pb-3">
                    <MapPin className="w-5 h-5 text-gray-900" />
                    <input
                      type="text"
                      value={state.formData.location}
                      onChange={(e) => updateField('location', e.target.value)}
                      className="min-w-0 bg-transparent outline-none font-black text-xl sm:text-2xl text-black w-full placeholder:text-transparent"
                      placeholder=""
                    />
                  </div>
                </div>
              </div>

              <div className="grid min-w-0 xl:grid-cols-2 gap-5 rounded-[24px] sm:rounded-[32px] border border-gray-100 bg-gray-50 p-3 sm:p-5">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-black uppercase tracking-[0.2em] pl-1">Bookings Active</p>
                  <div className="grid min-w-0 sm:grid-cols-2 gap-3">
                    <DatePickerField value={state.formData.availabilityStartDate} onChange={(value) => updateField('availabilityStartDate', value)} />
                    <DatePickerField value={state.formData.availabilityEndDate} onChange={(value) => updateField('availabilityEndDate', value)} />
                  </div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter pl-1">
                    {formatIndianDate(state.formData.availabilityStartDate)} to {formatIndianDate(state.formData.availabilityEndDate)}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-black text-black uppercase tracking-[0.2em] pl-1">Default Time Slot</p>
                  <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-3">
                    <input
                      type="time"
                      value={defaultSlotWindow.startTime}
                      onChange={(e) => updateDefaultSlotWindow('startTime', e.target.value)}
                      className="w-full min-w-0 rounded-2xl border border-gray-300 bg-white px-3 sm:px-4 py-3 text-sm font-black text-black outline-none focus:border-primary"
                    />
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                    <input
                      type="time"
                      value={defaultSlotWindow.endTime}
                      onChange={(e) => updateDefaultSlotWindow('endTime', e.target.value)}
                      className="w-full min-w-0 rounded-2xl border border-gray-300 bg-white px-3 sm:px-4 py-3 text-sm font-black text-black outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Tabs Integration */}
              <div className="min-w-0 pt-8 sm:pt-10 border-t border-gray-50">
                <div className="flex gap-2 mb-8 overflow-x-auto scrollbar-hide pb-2">
                  {['Schedule', 'Questions', 'Policy', 'Success'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab.toLowerCase())}
                      className={`shrink-0 px-5 sm:px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                        activeTab === tab.toLowerCase() ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-gray-50 text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="min-h-[300px] min-w-0">
                  {activeTab === 'schedule' && (
                    <div className="min-w-0 space-y-6 animate-in fade-in duration-300">
                      <div className="grid min-w-0 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-black uppercase tracking-widest">Open slots from</label>
                          <div className="rounded-3xl bg-gray-50 p-2.5 sm:p-3">
                            <DatePickerField value={state.formData.availabilityStartDate} onChange={(value) => updateField('availabilityStartDate', value)} className="bg-gray-50" />
                            <div className="mt-2 text-[8px] font-bold text-gray-400 uppercase tracking-tighter pl-1">
                              {formatIndianDate(state.formData.availabilityStartDate)}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-black uppercase tracking-widest">Open slots until</label>
                          <div className="rounded-3xl bg-gray-50 p-2.5 sm:p-3">
                            <DatePickerField value={state.formData.availabilityEndDate} onChange={(value) => updateField('availabilityEndDate', value)} className="bg-gray-50" />
                            <div className="mt-2 text-[8px] font-bold text-gray-400 uppercase tracking-tighter pl-1">
                              {formatIndianDate(state.formData.availabilityEndDate)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-gray-50 pt-6">
                         <div className="space-y-1">
                           <h4 className="text-xs font-black text-black uppercase tracking-widest">Availability Strategy</h4>
                           <p className="text-[8px] font-bold text-gray-400 uppercase italic">Specific dates act as "Truth" overrides for recurring days</p>
                         </div>
                         <div className="grid min-w-0 grid-cols-2 sm:flex gap-2">
                           <button 
                             onClick={() => addAvailabilityLine('recurring')} 
                             className="flex min-w-0 items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 sm:py-1.5 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
                           >
                             <Plus className="w-3 h-3" /> Recurring
                           </button>
                           <button 
                             onClick={() => addAvailabilityLine('specific')} 
                             className="flex min-w-0 items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 sm:py-1.5 bg-gray-900 text-white rounded-xl hover:bg-black transition-all text-[10px] font-black uppercase tracking-widest shadow-lg shadow-black/10"
                           >
                             <Calendar className="w-3 h-3" /> Specific Date
                           </button>
                         </div>
                      </div>

                      <div className="space-y-3">
                        {availabilityRows.map((item) => (
                          <div key={item.id} className="flex min-w-0 flex-col gap-3 bg-gray-50 p-3 sm:p-5 rounded-3xl group hover:bg-white hover:shadow-xl hover:shadow-black/5 transition-all border border-transparent hover:border-gray-100">
                            <div className="flex items-center gap-4">
                              <div className={`shrink-0 px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${item.date ? 'bg-gray-900 text-white' : 'bg-primary/10 text-primary'}`}>
                                {item.date ? 'Specific Override' : 'Weekly Recurring'}
                              </div>
                              <div className="flex-1 h-[1px] bg-gray-200"></div>
                              <button onClick={() => removeAvailabilityLine(item.id)} className="p-2 text-gray-300 hover:text-red-500 transition-all"><Trash2 className="w-4 h-4" /></button>
                            </div>
                            
                            <div className="flex min-w-0 flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                              {item.date ? (
                                <div className="w-full flex-1 space-y-1">
                                  <DatePickerField value={item.date} onChange={(value) => updateAvailabilityLine(item.id, 'date', value)} className="bg-gray-50" />
                                  <p className="text-[9px] font-bold text-gray-400">Date: {formatIndianDate(item.date)}</p>
                                </div>
                              ) : (
                                <select 
                                  value={item.day}
                                  onChange={(e) => updateAvailabilityLine(item.id, 'day', e.target.value)}
                                  className="w-full flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-3 font-black text-black outline-none text-sm"
                                >
                                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                                    <option key={d} value={d}>{d}</option>
                                  ))}
                                </select>
                              )}
                              
                              <div className="grid w-full sm:w-[15rem] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-3 bg-white px-3 sm:px-4 py-2 rounded-2xl shadow-sm border border-gray-100">
                                <input 
                                  type="time" 
                                  value={item.startTime} 
                                  onChange={(e) => updateAvailabilityLine(item.id, 'startTime', e.target.value)} 
                                  className="min-w-0 bg-transparent outline-none text-center font-black text-black text-xs" 
                                  placeholder="09:00"
                                />
                                <ChevronRight className="w-3 h-3 text-gray-400" />
                                <input 
                                  type="time" 
                                  value={item.endTime} 
                                  onChange={(e) => updateAvailabilityLine(item.id, 'endTime', e.target.value)} 
                                  className="min-w-0 bg-transparent outline-none text-center font-black text-black text-xs" 
                                  placeholder="17:00"
                                />
                              </div>
                            </div>
                          </div>
                        ))}

                        {availabilityRows.length === 0 && (
                          <div className="py-12 border-2 border-dashed border-gray-200 rounded-[40px] flex flex-col items-center justify-center gap-4 text-gray-400">
                            <Calendar className="w-8 h-8 opacity-20" />
                            <p className="text-[10px] font-black uppercase tracking-widest">No availability rules added yet</p>
                          </div>
                        )}
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
                       <div className="grid min-w-0 md:grid-cols-2 gap-5 md:gap-8 xl:gap-10">
                          <div className="p-4 sm:p-6 bg-gray-50 rounded-[28px] sm:rounded-[32px] space-y-4">
                             <div className="flex items-center justify-between">
                               <span className="text-[10px] font-black text-black uppercase tracking-widest">Manual Confirmation</span>
                               <input type="checkbox" checked={state.formData.manualConfirmation} onChange={(e) => updateField('manualConfirmation', e.target.checked)} className="w-5 h-5 rounded-lg border-gray-200 text-primary focus:ring-primary" />
                             </div>
                             <p className="text-xs font-bold text-gray-900 italic">Bookings will wait for your manual approval before being confirmed.</p>
                          </div>
                          <div className="p-4 sm:p-6 bg-gray-50 rounded-[28px] sm:rounded-[32px] space-y-4">
                             <div className="flex items-center justify-between">
                               <span className="text-[10px] font-black text-black uppercase tracking-widest">Paid Booking</span>
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
                          <h5 className="text-[10px] font-black text-black uppercase tracking-widest">Confirmation Message</h5>
                          <textarea 
                            value={state.formData.confirmMessage} 
                            onChange={(e) => updateField('confirmMessage', e.target.value)}
                            className="w-full min-h-[150px] p-4 sm:p-8 bg-gray-50 rounded-[28px] sm:rounded-[32px] border border-gray-300 outline-none font-bold text-black placeholder:text-gray-700 italic leading-relaxed"
                            placeholder="What should the user see after booking?"
                          />
                       </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Media & Resource Settings */}
            <div className="min-w-0 lg:col-span-4 space-y-5 lg:space-y-8 xl:space-y-10">
              {/* Media Card */}
              <div className="bg-white rounded-[28px] sm:rounded-[40px] xl:rounded-[48px] p-4 sm:p-7 xl:p-8 border border-gray-100 shadow-sm space-y-5 sm:space-y-6">
                <p className="text-[10px] font-black text-black uppercase tracking-[0.2em] text-center">Service Cover</p>
                <div 
                  onClick={() => state.formData.image ? null : fileInputRef.current.click()}
                  className={`mx-auto aspect-square w-full max-w-[28rem] bg-gray-50 border-2 border-dashed rounded-[28px] sm:rounded-[40px] flex flex-col items-center justify-center gap-4 relative group cursor-pointer overflow-hidden transition-all ${
                    state.formData.image ? 'border-transparent' : 'border-gray-300 hover:border-primary/50'
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
                      <div className="w-16 h-16 rounded-3xl bg-white border border-gray-300 flex items-center justify-center shadow-sm">
                        <Upload className="w-6 h-6 text-black group-hover:text-primary transition-colors" />
                      </div>
                      <span className="text-[10px] font-black text-black uppercase tracking-widest">Upload Picture</span>
                    </>
                  )}
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                </div>
              </div>

              {/* Resource Settings */}
              <div className="bg-white rounded-[28px] sm:rounded-[40px] xl:rounded-[48px] p-4 sm:p-7 xl:p-10 border border-gray-100 shadow-sm space-y-8 xl:space-y-10">
                <div className="space-y-6">
                   <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-[10px] font-black text-black uppercase tracking-widest">Assign to</span>
                      <span className="rounded-lg bg-primary/10 px-3 py-1.5 text-[10px] font-black uppercase text-primary">Resources</span>
                   </div>

                   <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-black uppercase tracking-widest">Staff, Courts, Lanes</span>
                        <button
                          onClick={() => setIsAddingResource(true)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-all text-[10px] font-black uppercase"
                        >
                          <Plus className="w-3 h-3" /> Add
                        </button>
                      </div>

                      {isAddingResource && (
                        <div className="space-y-2 rounded-2xl border border-gray-100 bg-gray-50 p-3 animate-in slide-in-from-top-2 duration-300">
                          <input
                            type="text"
                            placeholder="Name, e.g. Ravi, Court 1, Lane 3"
                            value={newResource.name}
                            onChange={(e) => setNewResource({ ...newResource, name: e.target.value })}
                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-bold text-black outline-none"
                          />
                          <div className="grid grid-cols-[1fr_auto] gap-2">
                            <select
                              value={newResource.type}
                              onChange={(e) => setNewResource({ ...newResource, type: e.target.value })}
                              className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-black text-black outline-none"
                            >
                              {RESOURCE_TYPES.map((type) => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                              ))}
                            </select>
                            <button onClick={addNewResource} className="px-4 bg-primary text-white rounded-xl text-xs font-black">Add</button>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {resources.map((resource) => (
                          <div key={resource.id} className="px-4 py-2 rounded-2xl border border-gray-300 bg-white text-black">
                            <span className="text-[10px] font-black uppercase">{resource.name}</span>
                            <span className="ml-2 text-[9px] font-bold uppercase text-gray-400">{resource.type || 'resource'}</span>
                          </div>
                        ))}
                        {resources.length === 0 && (
                          <p className="text-xs font-bold text-gray-400 italic">
                            {state.isNew ? 'Save this service first, then add resources.' : 'No resources linked yet.'}
                          </p>
                        )}
                      </div>
                    </div>

                   <div className="space-y-4 pt-6 border-t border-gray-50">
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-black text-black uppercase tracking-widest">Simultaneous Cap</span>
                         <input 
                           type="text" 
                           value={state.formData.capacityLimit} 
                           onChange={(e) => updateField('capacityLimit', parseInt(e.target.value) || 1)} 
                           className="w-12 bg-gray-50 border border-gray-300 rounded-lg px-2 py-1 text-center font-black text-black text-xs" 
                         />
                      </div>
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-black text-black uppercase tracking-widest">Mode</span>
                         <span className="text-[10px] font-black text-black uppercase italic">Automatic</span>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Floating Footer */}
      <div className="fixed inset-x-3 bottom-3 sm:inset-x-auto sm:bottom-8 xl:bottom-10 sm:right-8 xl:right-10 z-50 grid grid-cols-2 sm:flex items-center gap-2.5 sm:gap-4">
        <button 
          onClick={() => navigate('/organiser')}
          className="px-3 sm:px-8 py-3.5 sm:py-4 bg-white border border-gray-300 rounded-[18px] sm:rounded-[20px] font-black text-[10px] uppercase tracking-widest text-black shadow-xl hover:text-primary transition-all"
        >
          Discard
        </button>
        <button 
          onClick={handleSave}
          disabled={state.isLoading}
          className="px-3 sm:px-10 xl:px-12 py-3.5 sm:py-5 bg-gray-800 text-white rounded-[20px] sm:rounded-[24px] font-black text-[11px] sm:text-sm uppercase tracking-widest shadow-2xl shadow-black/20 hover:bg-black hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 sm:gap-4"
        >
          {state.isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Save Changes
        </button>
      </div>

      {/* High Fidelity Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 lg:p-12 overflow-hidden">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-3xl" onClick={() => setIsPreviewOpen(false)}></div>
          <div className="bg-white w-full max-w-6xl h-full rounded-[28px] sm:rounded-[48px] xl:rounded-[64px] shadow-2xl relative z-10 overflow-hidden flex flex-col border border-white/20 animate-in zoom-in-95 duration-500">
            <div className="p-4 sm:p-8 border-b border-gray-100 flex items-center justify-between gap-4 flex-shrink-0">
              <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-2xl flex flex-shrink-0 items-center justify-center text-primary">
                  <Eye className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-black text-gray-800 uppercase tracking-widest text-xs sm:text-sm truncate">Previewing your Service</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">See what your customers will experience</p>
                </div>
              </div>
              <button onClick={() => setIsPreviewOpen(false)} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all">
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 xl:p-12 bg-gray-50/50">
              <div className="max-w-4xl mx-auto space-y-8 sm:space-y-12 xl:space-y-16 pb-20">
                <div className="text-center space-y-6">
                   <h1 className="text-[clamp(2.25rem,9vw,4.5rem)] font-black text-gray-800 tracking-tighter leading-none">{state.formData.title || "Your Epic Service"}</h1>
                   <p className="text-base sm:text-xl xl:text-2xl text-gray-500 font-bold italic max-w-2xl mx-auto leading-relaxed">{state.formData.introMessage}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 xl:gap-12 bg-white p-4 sm:p-8 xl:p-12 rounded-[32px] sm:rounded-[48px] xl:rounded-[64px] shadow-2xl shadow-black/5 border border-gray-100">
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
