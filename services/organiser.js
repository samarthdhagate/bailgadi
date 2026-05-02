import axiosInstance from './api/axiosInstance';

export const organiserService = {
  getAppointments: async () => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      data: [
        {
          id: 1,
          title: 'Haircut & Styling',
          duration: 45,
          resources: ['Dr. John Smith', 'Sarah Wilson'],
          status: 'Published',
          bookings: 12
        },
        {
          id: 2,
          title: 'Deep Tissue Massage',
          duration: 60,
          resources: ['Emily Brown'],
          status: 'Draft',
          bookings: 0
        }
      ]
    };
  }
};
