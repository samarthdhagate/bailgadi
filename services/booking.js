import axiosInstance from './api/axiosInstance';

// Toggle this to true to force mock mode if your backend is not ready
const FORCE_MOCK = false;

export const bookingService = {
  getServices: async () => {
    try {
      const response = await axiosInstance.get('/services');
      return response.data;
    } catch (e) {
      console.warn("API failed, using mock services");
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
          }
        ]
      };
    }
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
    try {
      const response = await axiosInstance.get(`/resources/${serviceId}`);
      return response.data;
    } catch (e) {
      console.warn("API failed, using mock resources");
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        data: [
          { id: 1, name: 'Dr. John Smith', role: 'Senior Stylist' },
          { id: 2, name: 'Sarah Wilson', role: 'Stylist' }
        ]
      };
    }
  },

  lockSlot: async (serviceId, startTime) => {
    const response = await axiosInstance.post('/bookings/lock', {
      service_id: serviceId,
      start_time: startTime,
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
      start_time: bookingData.time,
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
