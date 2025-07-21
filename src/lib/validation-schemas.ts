/**
 * Validation schemas using Zod
 * Centralized validation logic for auth forms
 */

import { z } from 'zod';

// Common email validation
const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .max(320, 'Email is too long');

// Common password validation
const passwordSchema = z
  .string()
  .min(1, 'Password is required')
  .min(6, 'Password must be at least 6 characters long')
  .max(128, 'Password is too long');

// Login form validation schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters long'),
});

// Sign up form validation schema
export const signUpSchema = z.object({
  displayName: z
    .string()
    .min(1, 'Display name is required')
    .min(2, 'Display name must be at least 2 characters long')
    .max(50, 'Display name is too long')
    .regex(/^[a-zA-Z\s-']+$/, 'Display name can only contain letters, spaces, hyphens, and apostrophes'),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Password reset form validation schema
export const passwordResetSchema = z.object({
  email: emailSchema,
});

// Export types for TypeScript
export type LoginFormData = z.infer<typeof loginSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type PasswordResetFormData = z.infer<typeof passwordResetSchema>;