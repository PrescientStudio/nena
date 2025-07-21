/**
 * Professional Login Page for Nena Speech Coaching Platform
 * Features:
 * - Clean, centered layout with professional styling
 * - Nena branding integration
 * - Mobile responsive design
 * - Modern welcome experience
 * - Integration with existing LoginForm component
 * - TypeScript types for type safety
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mic2, ArrowLeft } from 'lucide-react';
import { LoginForm } from '@/components/auth/LoginForm';export default function LoginPage() {
  const router = useRouter();

  const handleSignUpClick = () => {
    router.push('/auth/register');
  };

  const handleForgotPasswordClick = () => {
    router.push('/auth/forgot-password');
  };

  const handleSuccessRedirect = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">{/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 via-transparent to-purple-100/20 opacity-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,_rgba(120,119,198,0.1),_transparent_50%)] opacity-70"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_rgba(255,255,255,0.5),_transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,_rgba(139,92,246,0.05),_transparent_50%)]"></div>
      </div>
      
      {/* Header Navigation */}
      <header className="relative z-10 p-4">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <Link 
            href="/"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to home</span>
          </Link>
          
          <div className="text-sm text-gray-600">
            Need help?{' '}
            <Link 
              href="/support" 
              className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
            >
              Contact support
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Nena Branding */}
          <div className="text-center mb-8">
            {/* Logo */}
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg mb-6 transform hover:scale-105 transition-transform">
              <Mic2 className="w-8 h-8 text-white" />
            </div>
            
            {/* Brand Name */}
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Nena
            </h1>
            
            {/* Tagline */}
            <p className="text-gray-600 text-lg font-medium mb-2">
              Welcome back
            </p>
            <p className="text-gray-500 text-sm">
              Continue your journey to confident communication
            </p>
          </div>

          {/* Login Form Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/50 to-purple-100/50 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-100/50 to-pink-100/50 rounded-full translate-y-12 -translate-x-12"></div>
            
            {/* Form Content */}
            <div className="relative z-10">
              <LoginForm
                onSuccessRedirect="/dashboard"
                onSignUpClick={handleSignUpClick}
                onForgotPasswordClick={handleForgotPasswordClick}
                className="space-y-6"
              />
            </div>
          </div>

          {/* Additional Links */}
          <div className="mt-8 text-center space-y-4">
            <div className="flex items-center justify-center space-x-6 text-sm">
              <Link 
                href="/privacy" 
                className="text-gray-500 hover:text-gray-700 hover:underline transition-colors"
              >
                Privacy Policy
              </Link>
              <span className="text-gray-300">•</span>
              <Link 
                href="/terms" 
                className="text-gray-500 hover:text-gray-700 hover:underline transition-colors"
              >
                Terms of Service
              </Link>
            </div>
            
            {/* Professional Trust Badge */}
            <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Secure & encrypted</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 p-4 text-center">
        <p className="text-sm text-gray-500">
          © 2024 Nena. Empowering voices, building confidence.
        </p>
      </footer>
    </div>
  );
}