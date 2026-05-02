import axiosInstance from './api/axiosInstance';

// Toggle this to true to force mock mode if your backend is not ready
const FORCE_MOCK = true;

export const authService = {
  login: async (credentials) => {
    if (FORCE_MOCK) {
      return mockLogin(credentials);
    }
    
    try {
      const response = await axiosInstance.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      console.warn("Backend login failed, falling back to mock mode:", error.message);
      return mockLogin(credentials);
    }
  },
  
  register: async (userData) => {
    if (FORCE_MOCK) {
      return { success: true, message: "Mock registration successful" };
    }
    const response = await axiosInstance.post('/auth/register', userData);
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  }
};

// Helper for Mock Login logic
async function mockLogin(credentials) {
  await new Promise(resolve => setTimeout(resolve, 800));
  const { email } = credentials;
  
  let role = 'customer';
  if (email.includes('organiser')) role = 'organiser';
  if (email.includes('admin')) role = 'admin';

  return {
    data: {
      token: 'mock-jwt-token-' + Math.random(),
      user: {
        id: 'mock-id',
        full_name: email.split('@')[0],
        email: email,
        role: role
      }
    }
  };
}
