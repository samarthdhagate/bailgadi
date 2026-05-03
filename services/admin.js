import axiosInstance from './api/axiosInstance';

export const adminService = {
  // ─── Stats ────────────────────────────────────────────────────────
  getStats: async () => {
    const response = await axiosInstance.get('/admin/stats');
    return response.data;
  },

  // ─── Users ────────────────────────────────────────────────────────
  getUsers: async () => {
    const response = await axiosInstance.get('/admin/users');
    return response.data;
  },

  updateUser: async (id, data) => {
    const response = await axiosInstance.put(`/admin/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await axiosInstance.delete(`/admin/users/${id}`);
    return response.data;
  },

  // ─── Facilities ───────────────────────────────────────────────────
  getFacilities: async () => {
    const response = await axiosInstance.get('/admin/facilities');
    return response.data;
  },

  getFacility: async (id) => {
    const response = await axiosInstance.get(`/admin/facilities/${id}`);
    return response.data;
  },

  updateFacility: async (id, data) => {
    const response = await axiosInstance.put(`/admin/facilities/${id}`, data);
    return response.data;
  },

  deleteFacility: async (id) => {
    const response = await axiosInstance.delete(`/admin/facilities/${id}`);
    return response.data;
  },

  // ─── Time Slots ───────────────────────────────────────────────────
  getSlots: async (facilityId, date) => {
    const params = date ? { date } : {};
    const response = await axiosInstance.get(`/admin/facilities/${facilityId}/slots`, { params });
    return response.data;
  },

  createSlot: async (facilityId, data) => {
    const response = await axiosInstance.post(`/admin/facilities/${facilityId}/slots`, data);
    return response.data;
  },

  bulkCreateSlots: async (facilityId, data) => {
    const response = await axiosInstance.post(`/admin/facilities/${facilityId}/slots/bulk`, data);
    return response.data;
  },

  updateSlot: async (slotId, data) => {
    const response = await axiosInstance.put(`/admin/slots/${slotId}`, data);
    return response.data;
  },

  deleteSlot: async (slotId) => {
    const response = await axiosInstance.delete(`/admin/slots/${slotId}`);
    return response.data;
  },

  // ─── Bookings ─────────────────────────────────────────────────────
  getBookings: async () => {
    const response = await axiosInstance.get('/admin/bookings');
    return response.data;
  },

  updateBookingStatus: async (id, status) => {
    const response = await axiosInstance.put(`/admin/bookings/${id}/status`, { status });
    return response.data;
  },

  createBooking: async (data) => {
    const response = await axiosInstance.post('/admin/bookings', data);
    return response.data;
  },

  deleteBooking: async (id) => {
    const response = await axiosInstance.delete(`/admin/bookings/${id}`);
    return response.data;
  },
};
