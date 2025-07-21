/**
 * Professional LoginForm component for Nena speech coaching app
 * Features:
 * - Email and password validation using react-hook-form and zod
 * - Google OAuth integration
 * - Error handling and loading states
 * - Accessibility features (ARIA labels, keyboard navigation)
 * - Mobile responsive design
 * - Professional styling with Tailwind CSS
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, AlertCircle, Chrome } from 'lucide-react';
import Link from 'next/link';

import { useAuth } from '@/contexts/AuthContext';
import { loginSchema, type LoginFormData } from '@/lib/validation-schemas';
import { getAuthErrorMessage, isAccountNotFoundError } from '@/lib/auth-errors';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface LoginFormProps {
  onSuccessRedirect?: string;
  onSignUpClick?: () => void;
  onForgotPasswordClick?: () => void;
  className?: string;
}

export function LoginForm({
  onSuccessRedirect,
  onSignUpClick,
  onForgotPasswordClick,
  className = ''
}: LoginFormProps) {
  const { signIn, signInWithGoogle, loading, error, setError } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError: setFormError,
    clearErrors,
    getValues
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur'
  });

  // Clear auth errors when user starts typing
  const handleInputChange = () => {
    if (error) {
      setError(null);
    }
    clearErrors();
  };

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null);
      await signIn(data.email, data.password);
      
      // Redirect or handle successful login
      if (onSuccessRedirect) {
        window.location.href = onSuccessRedirect;
      }
    } catch (err: any) {
      const errorMessage = getAuthErrorMessage(err);
      
      // Show account not found suggestion
      if (isAccountNotFoundError(err)) {
        setFormError('email', {
          type: 'manual',
          message: errorMessage
        });
      } else {
        setError(err);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      setError(null);
      await signInWithGoogle();
      
      // Redirect or handle successful login
      if (onSuccessRedirect) {
        window.location.href = onSuccessRedirect;
      }
    } catch (err: any) {
      setError(err);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (onForgotPasswordClick) {
      onForgotPasswordClick();
    }
  };

  const handleSignUpClick = () => {
    if (onSignUpClick) {
      onSignUpClick();
    }
  };

  // Get current email for forgot password functionality
  const currentEmail = getValues('email');

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Lock className="w-6 h-6 text-blue-600" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back to Nena
        </h1>
        <p className="text-sm text-gray-600">
          Sign in to continue your speech coaching journey
        </p>
      </div>

      {/* Error Alert */}
      {error && !errors.email && (
        <div 
          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-start space-x-3"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800 mb-1">
              Sign in failed
            </h3>
            <p className="text-sm text-red-700">
              {getAuthErrorMessage(error)}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Email Field */}
        <div>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" aria-hidden="true" />
            <Input
              {...register('email')}
              type="email"
              label="Email address"
              placeholder="Enter your email"
              error={errors.email?.message}
              className="pl-10"
              onChange={handleInputChange}
              autoComplete="email"
              autoFocus
              aria-describedby="email-description"
              required
            />
          </div>
          <div id="email-description" className="sr-only">
            Enter the email address associated with your account
          </div>
        </div>

        {/* Password Field */}
        <div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" aria-hidden="true" />
            <Input
              {...register('password')}
              type="password"
              label="Password"
              placeholder="Enter your password"
              error={errors.password?.message}
              className="pl-10"
              onChange={handleInputChange}
              autoComplete="current-password"
              aria-describedby="password-description"
              required
            />
          </div>
          <div id="password-description" className="sr-only">
            Enter your account password
          </div>
        </div>

        {/* Forgot Password Link */}
        <div className="text-right">
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
            aria-label={currentEmail ? `Reset password for ${currentEmail}` : 'Reset password'}
          >
            Forgot your password?
          </button>
        </div>

        {/* Sign In Button */}
        <Button
          type="submit"
          size="lg"
          loading={isSubmitting}
          disabled={isSubmitting || googleLoading}
          className="w-full"
          aria-describedby="signin-button-description"
        >
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </Button>
        
        <div id="signin-button-description" className="sr-only">
          Sign in to your Nena account with email and password
        </div>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        {/* Google OAuth Button */}
        <Button
          type="button"
          variant="outline"
          size="lg"
          loading={googleLoading}
          disabled={isSubmitting || googleLoading}
          onClick={handleGoogleSignIn}
          className="w-full"
          aria-describedby="google-signin-description"
        >
          <Chrome className="w-5 h-5 mr-2 text-gray-500" aria-hidden="true" />
          {googleLoading ? 'Signing in...' : 'Sign in with Google'}
        </Button>
        
        <div id="google-signin-description" className="sr-only">
          Sign in to your Nena account using Google OAuth
        </div>
      </form>

      {/* Sign Up Link */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <button
            onClick={handleSignUpClick}
            className="text-blue-600 hover:text-blue-800 hover:underline font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
            aria-label="Create a new Nena account"
          >
            Sign up instead
          </button>
        </p>
      </div>

      {/* Additional Help */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          Having trouble signing in?{' '}
          <Link
            href="/support"
            className="text-blue-600 hover:text-blue-800 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
          >
            Contact support
          </Link>
        </p>
      </div>
    </div>
  );
}