import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const exchangeToken = async () => {
      try {
        const response = await authService.refresh();
        if (response.success && response.data) {
          login(response.data);
          // Redirect is handled by login function
        } else {
          throw new Error('Refresh failed');
        }
      } catch (err) {
        console.error('OAuth callback error:', err);
        navigate('/login?error=google_failed');
      }
    };

    exchangeToken();
  }, [login, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-600 font-medium italic">Finalizing Google Sign-in...</p>
    </div>
  );
};

export default GoogleCallback;
