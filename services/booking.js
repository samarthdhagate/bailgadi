import axiosInstance from './api/axiosInstance';

export const bookingService = {
  getServices: async () => {
    const response = await axiosInstance.get('/services');
    return response.data;
  },

  getSlots: async (serviceId, date) => {
    const response = await axiosInstance.get('/availability', {
      params: { service_id: serviceId, date },
    });
    return response.data;
  },

  getResources: async (serviceId) => {
    const response = await axiosInstance.get(`/resources/${serviceId}`);
    return response.data;
  },

  lockSlot: async (serviceId, startTime, attendeeCount = 1) => {
    const response = await axiosInstance.post('/bookings/lock', {
      service_id: serviceId,
      start_time: startTime,
      attendee_count: attendeeCount,
    });
    return response.data;
  },

  createBooking: async (bookingData) => {
    const response = await axiosInstance.post('/bookings', {
      service_id: bookingData.serviceId,
      start_time: bookingData.startTime || bookingData.time,
      attendee_count: bookingData.capacity || bookingData.attendee_count || 1,
      notes: JSON.stringify(bookingData.userDetails),
    });
    return response.data;
  },

  rescheduleBooking: async (bookingId, bookingData) => {
    const response = await axiosInstance.patch(`/bookings/${bookingId}/reschedule`, {
      new_start_time: bookingData.time,
    });
    return response.data;
  },

  cancelBooking: async (bookingId) => {
    const response = await axiosInstance.patch(`/bookings/${bookingId}/cancel`);
    return response.data;
  },

  getMyBookings: async () => {
    const response = await axiosInstance.get('/bookings/my');
    return response.data;
  },

  createPaymentOrder: async (reservationId) => {
    const response = await axiosInstance.post('/payments/create-order', {
      reservation_id: reservationId,
    });
    return response.data;
  },

  verifyPayment: async (paymentData) => {
    const response = await axiosInstance.post('/payments/verify', paymentData);
    return response.data;
  },

  cancelPayment: async (paymentData) => {
    const response = await axiosInstance.post('/payments/cancel', paymentData);
    return response.data;
  }
};
