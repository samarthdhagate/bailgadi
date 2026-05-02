import axiosInstance from './api/axiosInstance';

export const bookingService = {
  /**
   * Fetch all published services (public).
   * GET /api/services
   */
  getServices: async () => {
    const response = await axiosInstance.get('/services');
    return response.data;
  },

  /**
   * Fetch available time slots for a service on a given date.
   * GET /api/availability?service_id={id}&date={date}
   */
  getSlots: async (serviceId, date) => {
    const response = await axiosInstance.get('/availability', {
      params: { service_id: serviceId, date },
    });
    return response.data;
  },

  /**
   * Lock a slot before booking (Redis-based, 10min TTL).
   * POST /api/bookings/lock
   */
  lockSlot: async (serviceId, startTime) => {
    const response = await axiosInstance.post('/bookings/lock', {
      service_id: serviceId,
      start_time: startTime,
    });
    return response.data;
  },

  /**
   * Create a booking (must lock slot first).
   * POST /api/bookings
   */
  createBooking: async ({ serviceId, startTime, notes }) => {
    const response = await axiosInstance.post('/bookings', {
      service_id: serviceId,
      start_time: startTime,
      notes,
    });
    return response.data;
  },

  /**
   * Get customer's own bookings.
   * GET /api/bookings/my
   */
  getMyBookings: async () => {
    const response = await axiosInstance.get('/bookings/my');
    return response.data;
  },

  /**
   * Cancel a booking.
   * PATCH /api/bookings/:id/cancel
   */
  cancelBooking: async (bookingId) => {
    const response = await axiosInstance.patch(`/bookings/${bookingId}/cancel`);
    return response.data;
  },

  /**
   * Reschedule a booking.
   * PATCH /api/bookings/:id/reschedule
   */
  rescheduleBooking: async (bookingId, newStartTime) => {
    const response = await axiosInstance.patch(`/bookings/${bookingId}/reschedule`, {
      new_start_time: newStartTime,
    });
    return response.data;
  },

  /**
   * Create a Razorpay payment order.
   * POST /api/payments/create-order
   */
  createPaymentOrder: async (bookingId, amount) => {
    const response = await axiosInstance.post('/payments/create-order', {
      booking_id: bookingId,
      amount,
    });
    return response.data;
  },

  /**
   * Verify Razorpay payment.
   * POST /api/payments/verify
   */
  verifyPayment: async ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
    const response = await axiosInstance.post('/payments/verify', {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });
    return response.data;
  },
};
