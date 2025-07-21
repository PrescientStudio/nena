/**
 * Authentication error mapping utilities
 * Maps Firebase auth error codes to user-friendly messages
 */

export interface AuthError {
  code: string;
  message: string;
}

export const authErrorMessages: Record<string, string> = {
  // Email/Password Auth Errors
  'auth/user-not-found': 'No account found with this email address.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/user-disabled': 'This account has been disabled. Contact support for assistance.',
  'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/weak-password': 'Password should be at least 6 characters long.',
  'auth/operation-not-allowed': 'This sign-in method is not enabled.',
  'auth/invalid-credential': 'Invalid email or password. Please check your credentials.',
  'auth/account-exists-with-different-credential': 'An account already exists with the same email but different sign-in credentials.',
  
  // Google OAuth Errors
  'auth/popup-closed-by-user': 'Sign-in was cancelled. Please try again.',
  'auth/popup-blocked': 'Pop-up was blocked by your browser. Please allow pop-ups and try again.',
  'auth/cancelled-popup-request': 'Sign-in was cancelled. Please try again.',
  
  // Network Errors
  'auth/network-request-failed': 'Network error. Please check your connection and try again.',
  'auth/timeout': 'Request timed out. Please try again.',
  
  // Default fallback
  'default': 'An unexpected error occurred. Please try again.',
};

/**
 * Get user-friendly error message from Firebase auth error
 */
export const getAuthErrorMessage = (error: any): string => {
  if (!error) return '';
  
  // Extract error code from Firebase error
  const errorCode = error?.code || error?.message || '';
  
  // Return mapped message or default
  return authErrorMessages[errorCode] || authErrorMessages.default;
};

/**
 * Check if error is a network-related error
 */
export const isNetworkError = (error: any): boolean => {
  const code = error?.code || '';
  return code === 'auth/network-request-failed' || code === 'auth/timeout';
};

/**
 * Check if error suggests account doesn't exist
 */
export const isAccountNotFoundError = (error: any): boolean => {
  const code = error?.code || '';
  return code === 'auth/user-not-found' || code === 'auth/invalid-credential';
};