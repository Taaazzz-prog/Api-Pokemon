import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { RegisterRequest } from '../../services/api/auth';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { EyeIcon, EyeSlashIcon, UserIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useUser();
  
  const [formData, setFormData] = useState<RegisterRequest>({
    email: '',
    password: '',
    username: '',
  });
  
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<RegisterRequest & { confirmPassword: string }>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterRequest & { confirmPassword: string }> = {};
    
    // Username validation
    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (formData.username.length > 20) {
      newErrors.username = 'Username must be less than 20 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email format is invalid';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }
    
    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof RegisterRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    
    // Clear error when user starts typing
    if (errors.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await register(formData.email, formData.password, formData.username);
      navigate('/dashboard');
    } catch (error) {
      // Error is handled by AuthContext with toast
      console.error('Registration failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-white">✨</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Join Pokemon Tactics Arena
          </h1>
          <p className="text-purple-200">
            Start your journey as a Pokemon Trainer!
          </p>
        </div>

        {/* Registration Form */}
        <Card className="p-6 bg-white/10 backdrop-blur-lg border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-white mb-2">
                Trainer Name
              </label>
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="Choose your trainer name"
                error={errors.username}
                disabled={isLoading}
                leftIcon={<UserIcon className="h-5 w-5" />}
                className="bg-white/20 border-white/30 text-white placeholder-white/60"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="trainer@pokemon.com"
                error={errors.email}
                disabled={isLoading}
                leftIcon={<EnvelopeIcon className="h-5 w-5" />}
                className="bg-white/20 border-white/30 text-white placeholder-white/60"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Create a strong password"
                  error={errors.password}
                  disabled={isLoading}
                  className="bg-white/20 border-white/30 text-white placeholder-white/60 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                  placeholder="Confirm your password"
                  error={errors.confirmPassword}
                  disabled={isLoading}
                  className="bg-white/20 border-white/30 text-white placeholder-white/60 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="text-sm text-white/80">
              <p className="mb-2">Password requirements:</p>
              <ul className="space-y-1 text-xs text-white/60">
                <li className={formData.password.length >= 8 ? 'text-green-300' : ''}>
                  ✓ At least 8 characters
                </li>
                <li className={/(?=.*[a-z])/.test(formData.password) ? 'text-green-300' : ''}>
                  ✓ One lowercase letter
                </li>
                <li className={/(?=.*[A-Z])/.test(formData.password) ? 'text-green-300' : ''}>
                  ✓ One uppercase letter
                </li>
                <li className={/(?=.*\d)/.test(formData.password) ? 'text-green-300' : ''}>
                  ✓ One number
                </li>
              </ul>
            </div>

            <Button
              type="submit"
              fullWidth
              disabled={isLoading}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <LoadingSpinner size="sm" className="mr-2" />
                  Creating account...
                </div>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/80">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-purple-300 hover:text-purple-200 font-medium transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </Card>

        {/* Terms and Privacy */}
        <div className="mt-6 text-center text-xs text-white/60">
          <p>
            By creating an account, you agree to our{' '}
            <Link to="/terms" className="text-purple-300 hover:text-purple-200">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-purple-300 hover:text-purple-200">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;