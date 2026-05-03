import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useAuth } from '../../context/useAuth';
import ErrorMessage from '../../components/ErrorMessage';
import { authService } from '@services/auth';
import { GoogleLogin } from '@react-oauth/google';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, token, role } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await authService.googleLogin(credentialResponse.credential);
      if (response.success) {
        login(response.data);
      } else {
        setError('Google login failed.');
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Google login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token && token !== 'bypass-token') {
      if (role === 'customer') navigate('/dashboard');
      else if (role === 'organiser') navigate('/organiser');
      else if (role === 'admin') navigate('/admin');
    }
  }, [token, role, navigate]);

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

      <div className="flex justify-center w-full">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setError('Google Login Failed')}
          useOneTap
          theme="outline"
          shape="pill"
          width="100%"
        />
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
