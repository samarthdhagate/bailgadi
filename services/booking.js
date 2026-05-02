import axiosInstance from './api/axiosInstance';

export const bookingService = {
  getServices: async () => {
    // In a real app: return axiosInstance.get('/services');
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      data: [
        {
          id: 1,
          title: 'Haircut & Styling',
          location: 'Downtown Salon',
          description: 'Get a fresh new look with our professional stylists.',
          image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=400',
          price: 50,
          duration: 45,
          questions: [
            { id: 101, label: 'Hair type', type: 'text', required: true },
            { id: 102, label: 'Preferred Style', type: 'textarea', required: false }
          ]
        },
        {
          id: 2,
          title: 'Dental Consultation',
          location: 'City Medical Center',
          description: 'Expert dental checkup and consultation.',
          image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=400',
          price: 0,
          duration: 30
        },
        {
          id: 3,
          title: 'Personal Training',
          location: 'Elite Fitness Gym',
          description: 'One-on-one session with a certified fitness trainer.',
          image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=400',
          price: 80,
          duration: 60
        }
      ]
    };
  },

  getSlots: async (serviceId, date) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      data: [
        { id: '1', time: '09:00 AM', available: true },
        { id: '2', time: '10:00 AM', available: false },
        { id: '3', time: '11:00 AM', available: true },
        { id: '4', time: '01:00 PM', available: true },
        { id: '5', time: '02:00 PM', available: true },
        { id: '6', time: '03:00 PM', available: false },
        { id: '7', time: '04:00 PM', available: true }
      ]
    };
  },

  getResources: async (serviceId) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      data: [
        { id: 1, name: 'Dr. John Smith', role: 'Senior Stylist' },
        { id: 2, name: 'Sarah Wilson', role: 'Stylist' }
      ]
    };
  },

  createBooking: async (bookingData) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return { data: { id: 'BK-' + Math.floor(Math.random() * 100000), ...bookingData, status: 'Confirmed' } };
  },

  rescheduleBooking: async (bookingId, bookingData) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return { data: { id: bookingId, ...bookingData, status: 'Confirmed' } };
  },

  cancelBooking: async (bookingId) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true };
  },

  getMyBookings: async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      data: [
        {
          id: 'BK-78234',
          serviceName: 'Haircut & Styling',
          resourceName: 'Dr. John Smith',
          date: '2026-05-10',
          time: '11:00 AM',
          status: 'Confirmed',
          price: 50
        },
        {
          id: 'BK-78235',
          serviceName: 'Dental Consultation',
          resourceName: 'Sarah Wilson',
          date: '2026-05-15',
          time: '02:00 PM',
          status: 'Pending',
          price: 0
        }
      ]
    };
  }
};
