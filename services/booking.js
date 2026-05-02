import axiosInstance from './api/axiosInstance';

// Toggle this to true to force mock mode if your backend is not ready
const FORCE_MOCK = false;

export const bookingService = {
  getServices: async () => {
    if (!FORCE_MOCK) {
      try {
        const response = await axiosInstance.get('/services');
        return response.data;
      } catch (e) { console.warn("API failed, using mock services"); }
    }
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      data: [
        {
          id: '82a5264d-e4fc-4e36-8bcb-701fdcc658ab',
          title: 'Haircut & Styling',
          location: 'Downtown Salon',
          description: 'Get a fresh new look with our professional stylists.',
          image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=400',
          price: 50,
          duration: 45,
        },
        {
          id: 'b8e9f2a1-c3d4-4e5f-a6b7-c8d9e0f1a2b3',
          title: 'Dental Consultation',
          location: 'City Medical Center',
          description: 'Expert dental checkup and consultation.',
          image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=400',
          price: 0,
          duration: 30
        },
      ]
    };
  },

  getSlots: async (serviceId, date) => {
    if (!FORCE_MOCK) {
      try {
        const response = await axiosInstance.get('/availability', {
          params: { service_id: serviceId, date },
        });
        return response.data;
      } catch (e) { console.warn("API failed, using mock slots"); }
    }
    await new Promise(resolve => setTimeout(resolve, 500));
    const baseDate = date || new Date().toISOString().split('T')[0];
    return {
      data: [
        { id: '1', time: `${baseDate}T09:00:00.000Z`, available: true },
        { id: '2', time: `${baseDate}T10:00:00.000Z`, available: false },
        { id: '3', time: `${baseDate}T11:00:00.000Z`, available: true },
        { id: '4', time: `${baseDate}T13:00:00.000Z`, available: true },
        { id: '5', time: `${baseDate}T14:00:00.000Z`, available: true }
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

  lockSlot: async (serviceId, startTime, attendeeCount) => {
    const response = await axiosInstance.post('/bookings/lock', {
      service_id: serviceId,
      start_time: startTime,
      attendee_count: attendeeCount,
    });
    return response.data;
  },

  createBooking: async (bookingData) => {
    if (FORCE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { data: { id: 'BK-' + Math.floor(Math.random() * 100000), ...bookingData, status: 'Confirmed' } };
    }
    const response = await axiosInstance.post('/bookings', {
      service_id: bookingData.serviceId,
      start_time: bookingData.startTime || bookingData.time,
      notes: JSON.stringify(bookingData.userDetails),
    });
    return response.data;
  },

  rescheduleBooking: async (bookingId, bookingData) => {
    if (FORCE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { data: { id: bookingId, ...bookingData, status: 'Confirmed' } };
    }
    const response = await axiosInstance.patch(`/bookings/${bookingId}/reschedule`, {
      new_start_time: bookingData.time,
    });
    return response.data;
  },

  cancelBooking: async (bookingId) => {
    if (FORCE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    }
    const response = await axiosInstance.patch(`/bookings/${bookingId}/cancel`);
    return response.data;
  },

  getMyBookings: async () => {
    if (!FORCE_MOCK) {
      try {
        const response = await axiosInstance.get('/bookings/my');
        return response.data;
      } catch (e) { console.warn("API failed, using mock bookings"); }
    }
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
  },

  createPaymentOrder: async (bookingId, amount) => {
    const response = await axiosInstance.post('/payments/create-order', {
      booking_id: bookingId,
      amount,
    });
    return response.data;
  },

  verifyPayment: async ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
    const response = await axiosInstance.post('/payments/verify', {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });
    return response.data;
  }
};
