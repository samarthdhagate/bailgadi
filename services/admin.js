import axiosInstance from './api/axiosInstance';

export const adminService = {
  /**
   * Get admin dashboard stats.
   * Derives stats from the bookings list since there's no dedicated stats endpoint.
   * GET /api/bookings/all
   */
  getStats: async () => {
    try {
      const response = await axiosInstance.get('/bookings/all');
      const bookings = response.data.data || [];

      const stats = {
        totalUsers: new Set(bookings.map((b) => b.user_id)).size,
        totalBookings: bookings.length,
        activeServices: new Set(bookings.map((b) => b.service_id)).size,
        revenue: bookings
          .filter((b) => b.status === 'booked')
          .reduce((sum, b) => sum + (b.amount || 0), 0),
      };

      return { data: stats };
    } catch (err) {
      // Fallback to zeros if endpoint fails
      return {
        data: { totalUsers: 0, totalBookings: 0, activeServices: 0, revenue: 0 },
      };
    }
  },

  /**
   * Get all users.
   * Note: No dedicated admin user-list endpoint in backend yet.
   * This is a placeholder that returns an empty list.
   * TODO: Add GET /api/admin/users endpoint to the backend.
   */
  getUsers: async () => {
    // Placeholder — backend does not have a user-listing endpoint yet
    return { data: [] };
  },

  /**
   * Get all bookings (admin view).
   * GET /api/bookings/all
   */
  getBookings: async () => {
    const response = await axiosInstance.get('/bookings/all');
    const bookings = (response.data.data || []).map((b) => ({
      id: b.confirmation_code || b.id,
      service: b.service_name,
      user: b.customer_name,
      date: new Date(b.start_time).toLocaleDateString(),
      status: b.status.charAt(0).toUpperCase() + b.status.slice(1),
      amount: b.amount || 0,
    }));
    return { data: bookings };
  },
};
