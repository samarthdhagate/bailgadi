import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Building2 } from 'lucide-react';
import Input from '../../components/Input';
import Button from '../../components/Button';
import ErrorMessage from '../../components/ErrorMessage';
import { authService } from '@services/auth';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';

const SignupPage = () => {
  const [role, setRole] = useState('customer'); // 'customer' or 'organiser'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    businessName: '',
    category: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await authService.googleLogin(credentialResponse.credential);
      if (response.success) {
        login(response.data);
        navigate('/dashboard');
      } else {
        setError('Google login failed.');
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Google login failed.');
    } finally {
      setIsLoading(false);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await authService.signup({
        full_name: formData.name,
        email: formData.email,
        password: formData.password,
        role: role
      });

      if (response.success) {
        setSuccess(response.data.message || 'Account created successfully. You can log in now.');
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setError(response.error?.message || 'Signup failed. Please try again.');
      }
    } catch (err) {
      const message = err.response?.data?.error?.message || 'Failed to create account. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const response = await authService.getGoogleAuthUrl();
      if (response.success && response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (err) {
      setError('Could not initiate Google login. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="mb-2">
        <h2 className="text-2xl font-bold text-gray-800">Create Account</h2>
        <p className="text-gray-500 font-medium">Choose your account type to get started</p>
      </div>
      <ErrorMessage message={error} />
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
          {success}
        </div>
      )}

      {/* Role Toggle */}
      <div className="flex p-1 bg-gray-50 rounded-2xl border border-gray-100">
        <button
          type="button"
          onClick={() => setRole('customer')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${role === 'customer' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          <User className="w-4 h-4" />
          Individual
        </button>
        <button
          type="button"
          onClick={() => setRole('organiser')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${role === 'organiser' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          <Building2 className="w-4 h-4" />
          Organiser
        </button>
      </div>

      <div className="space-y-4">
        {role === 'organiser' && (
          <Input
            label="Business Name"
            placeholder="Acme Scheduling Inc."
            value={formData.businessName}
            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
            required
          />
        )}

        <Input
          label={role === 'organiser' ? "Owner Full Name" : "Full Name"}
          placeholder="John Doe"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="name@example.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />

        {role === 'organiser' && (
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Business Category</label>
            <select
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-primary focus:bg-white transition-all text-sm font-medium"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            >
              <option value="">Select a category</option>
              <option value="healthcare">Healthcare</option>
              <option value="education">Education</option>
              <option value="sports">Sports & Fitness</option>
              <option value="business">Business Services</option>
              <option value="other">Other</option>
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          <Input
            label="Confirm"
            type="password"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
          />
        </div>
      </div>

      <Button type="submit" isLoading={isLoading} className="w-full py-4 text-lg">
        Create {role === 'organiser' ? 'Organiser' : 'User'} Account
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

          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </form>
        );
};

        export default SignupPage;
