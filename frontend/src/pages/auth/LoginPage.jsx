import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import ErrorMessage from '../../components/ErrorMessage';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Mock API call
      // In a real app: const response = await authService.login({ email, password });
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock roles based on email for testing
      let role = 'customer';
      if (email.includes('organiser')) role = 'organiser';
      if (email.includes('admin')) role = 'admin';

      login({
        token: 'mock-jwt-token',
        role,
        user: { email, name: email.split('@')[0] }
      });
    } catch (err) {
      setError('Invalid email or password');
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
