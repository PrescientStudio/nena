"use client";

import React from 'react';
import Link from 'next/link';
import RegisterForm from '../../../components/auth/RegisterForm';

const RegisterPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo and Branding */}
        <div className="flex flex-col items-center">
          <div className="bg-white rounded-full p-3 shadow-lg mb-6">
            <svg
              className="h-12 w-12 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Nena</h1>
          <h2 className="text-2xl font-semibold text-gray-700 text-center">
            Join Your Speech Journey
          </h2>
          <p className="mt-3 text-base text-gray-600 text-center max-w-sm">
            Transform your communication skills with personalized AI-powered speech coaching.
            Start your journey to confident speaking today.
          </p>
        </div>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10 border border-gray-100">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
              Create Your Account
            </h3>
            <p className="text-sm text-gray-600 text-center">
              Ready to unlock your speaking potential?
            </p>
          </div>
          <RegisterForm />
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Already have an account?</span>
              </div>
            </div>
            <div className="mt-4 text-center">
              <Link
                href="/login"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
              >
                Sign in to your account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;