import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@services/auth';

const AuthContext = createContext(null);
const getStoredUser = () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  if (!token || !role) {
    return null;
  }

  const storedUser = localStorage.getItem('user');
  if (!storedUser) {
    return { token, role };
  }

  try {
    const parsedUser = JSON.parse(storedUser);
    return {
      ...parsedUser,
      name: parsedUser.full_name || parsedUser.name || '',
    };
  } catch {
    return { token, role };
  }
};

export const AuthProvider = ({ children }) => {
  const isDev = import.meta.env.MODE === 'development';

  const [token, setToken] = useState(() => localStorage.getItem('token') || (isDev ? 'bypass-token' : null));
  const [role, setRole] = useState(() => localStorage.getItem('role') || (isDev ? 'organiser' : null));
  const [user, setUser] = useState(() => {
    const stored = getStoredUser();
    if (stored) return stored;
    if (isDev) {
      return {
        id: 'bypass-id',
        name: 'Bypass Admin',
        email: 'admin@zilla.dev',
        role: 'organiser'
      };
    }
    return null;
  });
  const [isLoading] = useState(false);
  const navigate = useNavigate();

  /**
   * Login with real API. Stores tokens and user data.
   */
  const login = (authData) => {
    const { access_token, user: userData } = authData;
    const userRole = userData.role;
    const normalizedUser = {
      ...userData,
      name: userData.full_name || userData.name || '',
    };

    localStorage.setItem('token', access_token);
    localStorage.setItem('role', userRole);
    localStorage.setItem('user', JSON.stringify(normalizedUser));

    setToken(access_token);
    setRole(userRole);
    setUser(normalizedUser);

    // Redirect based on role
    if (userRole === 'customer') navigate('/dashboard');
    else if (userRole === 'organiser') navigate('/organiser');
    else if (userRole === 'admin') navigate('/admin');
  };

  /**
   * Logout — calls backend to clear refresh cookie, then clears local state.
   */
  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      // Logout even if API call fails
      console.warn('Logout API call failed:', err.message);
    }

    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    setToken(null);
    setRole(null);
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, role, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
