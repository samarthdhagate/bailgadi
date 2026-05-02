import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import ErrorMessage from '../../components/ErrorMessage';
import { authService } from '@services/auth';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, token, role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (token && token !== 'bypass-token') {
      if (role === 'customer') navigate('/dashboard');
      else if (role === 'organiser') navigate('/organiser');
      else if (role === 'admin') navigate('/admin');
    }
  }, [token, role, navigate]);

  const handleDemoAccess = (roleType) => {
    login({
      access_token: 'bypass-token',
      user: {
        id: 'bypass-id',
        full_name: `Demo ${roleType.charAt(0).toUpperCase() + roleType.slice(1)}`,
        email: `${roleType}@zilla.com`,
        role: roleType
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await authService.login({ email, password });

      if (response.success) {
        login(response.data);
      } else {
        setError(response.error?.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      const message = err.response?.data?.error?.message || 'Invalid email or password.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">Login</h2>
      <ErrorMessage message={error} />
      <Input
        label="Email Address"
        type="email"
        placeholder="name@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <div className="flex items-center justify-between mt-2">
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
          Remember me
        </label>
        <a href="#" className="text-sm text-primary hover:underline">Forgot password?</a>
      </div>
      <Button type="submit" isLoading={isLoading} className="mt-2 w-full">
        Sign In
      </Button>

      <div className="flex items-center gap-4 my-2">
        <div className="flex-1 h-px bg-gray-100"></div>
        <span className="text-xs font-bold text-gray-400 uppercase">Or</span>
        <div className="flex-1 h-px bg-gray-100"></div>
      </div>

      <button
        type="button"
        className="w-full py-3 bg-white border border-gray-100 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-center gap-3 shadow-sm"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.83z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.83c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        Sign in with Google
      </button>

      <div className="grid grid-cols-3 gap-2 mt-2">
        <button type="button" onClick={() => handleDemoAccess('customer')} className="py-2 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-100 hover:bg-blue-100 transition-all">Customer</button>
        <button type="button" onClick={() => handleDemoAccess('organiser')} className="py-2 bg-purple-50 text-purple-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-purple-100 hover:bg-purple-100 transition-all">Organiser</button>
        <button type="button" onClick={() => handleDemoAccess('admin')} className="py-2 bg-red-50 text-red-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-red-100 hover:bg-red-100 transition-all">Admin</button>
      </div>
      <p className="text-center text-sm text-gray-600 mt-4">
        Don't have an account?{' '}
        <Link to="/signup" className="text-primary font-medium hover:underline">
          Create one
        </Link>
      </p>
    </form>
  );
};

export default LoginPage;
