import axiosInstance from './api/axiosInstance';

export const adminService = {
  getStats: async () => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      data: {
        totalUsers: 1250,
        totalBookings: 8432,
        activeServices: 45,
        revenue: 12540
      }
    };
  },

  getUsers: async () => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      data: [
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'customer', status: 'Active', joined: '2026-01-15' },
        { id: 2, name: 'Alice Smith', email: 'alice@organiser.com', role: 'organiser', status: 'Active', joined: '2026-02-20' },
        { id: 3, name: 'Bob Wilson', email: 'bob@example.com', role: 'customer', status: 'Inactive', joined: '2026-03-05' }
      ]
    };
  },

  getBookings: async () => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      data: [
        { id: 'BK-1001', service: 'Haircut', user: 'John Doe', date: '2026-05-10', status: 'Confirmed', amount: 50 },
        { id: 'BK-1002', service: 'Consultation', user: 'Jane Smith', date: '2026-05-11', status: 'Pending', amount: 0 },
        { id: 'BK-1003', service: 'Personal Training', user: 'Mike Ross', date: '2026-05-12', status: 'Cancelled', amount: 80 }
      ]
    };
  }
};
