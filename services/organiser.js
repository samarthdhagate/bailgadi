import axiosInstance from './api/axiosInstance';

export const organiserService = {
  /**
   * Get organiser's own services.
   * GET /api/services/my
   */
  getServices: async () => {
    const response = await axiosInstance.get('/services/my');
    return response.data;
  },

  getResources: async (serviceId) => {
    const response = await axiosInstance.get(`/resources/${serviceId}`);
    return response.data;
  },

  createResource: async (serviceId, data) => {
    const response = await axiosInstance.post(`/resources/${serviceId}`, data);
    return response.data;
  },

  /**
   * Compatibility alias for AppointmentList.
   */
  getAppointments: async () => {
    const response = await axiosInstance.get('/services/my');
    return response.data;
  },

  /**
   * Fetch a single service by ID.
   */
  getServiceById: async (id) => {
    const response = await axiosInstance.get(`/services/${id}`);
    return response.data;
  },

  /**
   * Create a new service.
   * POST /api/services
   */
  createService: async (data) => {
    const response = await axiosInstance.post('/services', data);
    return response.data;
  },

  /**
   * Update a service.
   * PUT /api/services/:id
   */
  updateService: async (id, data) => {
    const response = await axiosInstance.put(`/services/${id}`, data);
    return response.data;
  },

  deleteService: async (id) => {
    const response = await axiosInstance.delete(`/services/${id}`);
    return response.data;
  },

  /**
   * Toggle publish status.
   * PATCH /api/services/:id/publish
   */
  togglePublish: async (id) => {
    const response = await axiosInstance.patch(`/services/${id}/publish`);
    return response.data;
  },

  /**
   * Get provider's bookings.
   * GET /api/bookings/provider
   */
  getBookings: async () => {
    const response = await axiosInstance.get('/bookings/provider');
    return response.data;
  },

  /**
   * Manually confirm a booking.
   */
  confirmBooking: async (id) => {
    const response = await axiosInstance.patch(`/bookings/${id}/confirm`);
    return response.data;
  },

  updateMeetingStatus: async (id, status) => {
    const normalizedStatus = String(status || '').toLowerCase().replace(/\s+/g, '_');
    const response = await axiosInstance.patch(`/bookings/${id}/status`, {
      status: normalizedStatus,
    });
    return response.data;
  },

  /**
   * Set working hours.
   */
  setWorkingHours: async (workingHours) => {
    const response = await axiosInstance.post('/availability/working-hours', {
      working_hours: workingHours,
    });
    return response.data;
  },

  /**
   * Get working hours.
   */
  getWorkingHours: async () => {
    const response = await axiosInstance.get('/availability/working-hours');
    return response.data;
  },

  // Mocked/Placeholder methods for new UI features from main
  getMeetings: async () => {
    // Redirect to getBookings for now as "Meetings" = "Bookings" in this context
    const response = await axiosInstance.get('/bookings/provider');
    return response.data;
  },
  
};
