// Mock persistent data for the session
let appointments = [
  { 
    id: 1, 
    title: 'Dental care', 
    duration: '00:30', 
    location: 'Doctor\'s Office', 
    status: 'published',
    resources: ['A1', 'A2'],
    bookings: 1,
    scheduleType: 'weekly',
    questions: [
      { id: 1, label: 'Name', type: 'text', required: true },
      { id: 2, label: 'Phone', type: 'phone', required: true }
    ],
    introMessage: 'Schedule your visit today...',
    confirmMessage: 'Thank you for your trust...'
  },
  { 
    id: 2, 
    title: 'Tennis court', 
    duration: '01:00', 
    location: 'Sports Complex', 
    status: 'published',
    resources: ['R1', 'R2'],
    bookings: 3,
    scheduleType: 'flexible'
  }
];

let meetings = [
  { id: 1, subject: 'Cavity', appointment: 'Dental care', name: 'Vipin jindal', resource: '', time: 'Dec 12 4:00', answers: '+91987454632', status: 'Booked' },
  { id: 2, subject: 'Routine', appointment: 'Dental care', name: 'Tarak gor', resource: 'Court 1', time: 'Dec 13 9:00', answers: '+91478798465', status: 'Request' }
];

export const organiserService = {
  getAppointments: async () => {
    await new Promise(r => setTimeout(r, 500));
    return { data: appointments };
  },
  
  getAppointmentById: async (id) => {
    await new Promise(r => setTimeout(r, 500));
    const app = appointments.find(a => a.id === parseInt(id));
    return { data: app || appointments[0] };
  },
  
  createAppointment: async (data) => {
    await new Promise(r => setTimeout(r, 800));
    const newApp = { ...data, id: appointments.length + 1, bookings: 0, status: 'draft' };
    appointments.push(newApp);
    return { data: newApp };
  },
  
  updateAppointment: async (id, data) => {
    await new Promise(r => setTimeout(r, 800));
    appointments = appointments.map(a => a.id === parseInt(id) ? { ...a, ...data } : a);
    return { data: data };
  },
  
  getMeetings: async () => {
    await new Promise(r => setTimeout(r, 500));
    return { data: meetings };
  },
  
  updateMeetingStatus: async (id, status) => {
    meetings = meetings.map(m => m.id === id ? { ...m, status } : m);
    return { data: true };
  }
};
