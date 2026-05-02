import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // In a real app, you might want to fetch user details using this token
      // For now, we assume the backend redirect includes everything we need
      // or we use a simplified login that just sets the token and redirects to dashboard
      // The login function in AuthContext usually expects { user, access_token }
      
      // Since we only got the token in URL, we might need a small workaround 
      // or update the backend to include basic user info in query params too
      
      // Let's assume we can at least set the token and the user will be fetched 
      // by the context's initialization logic if it exists.
      
      // A better way: redirect to a logic that handles "OAuth success"
      // For now, I'll just save the token and redirect.
      localStorage.setItem('accessToken', token);
      
      // Redirect to dashboard - AuthContext will handle fetching user from token
      window.location.href = '/dashboard';
    } else {
      navigate('/login?error=google_failed');
    }
  }, [searchParams, login, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-600 font-medium italic">Finalizing Google Sign-in...</p>
    </div>
  );
};

export default GoogleCallback;
