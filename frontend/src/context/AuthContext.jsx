import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@services/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (token && role) {
      // Restore user state from localStorage on mount
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          setUser({ token, role });
        }
      } else {
        setUser({ token, role });
      }
    }
  }, [token, role]);

  /**
   * Login with real API. Stores tokens and user data.
   */
  const login = (authData) => {
    const { access_token, user: userData } = authData;
    const userRole = userData.role;

    localStorage.setItem('token', access_token);
    localStorage.setItem('role', userRole);
    localStorage.setItem('user', JSON.stringify(userData));

    setToken(access_token);
    setRole(userRole);
    setUser(userData);

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
