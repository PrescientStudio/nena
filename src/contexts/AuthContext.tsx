'use client'

import { createContext, useContext, ReactNode, useState, useEffect } from 'react'
import {
  signInWithEmailAndPassword,
  User,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  updateEmail,
  updatePassword,
  signOut,
  GoogleAuthProvider,
  UserCredential,
  onAuthStateChanged,
  signInWithPopup,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
export type BasicRole = 'basic';
export type PremiumRole = 'premium';
export type EnterpriseRole = 'enterprise';
export type UserRole = BasicRole | PremiumRole | EnterpriseRole;

export type SupportRole = 'support';
export type AdminRole = 'admin';
export type SuperAdminRole = 'super_admin';
export type AdminRoleType = SupportRole | AdminRole | SuperAdminRole;
export type Role = UserRole | AdminRoleType;

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  role: Role;
  createdAt: Date;
  lastLogin: Date;
}
interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  initialLoading: boolean;
  error: Error | null;
  signUp: (email: string, password: string, displayName: string) => Promise<UserCredential>;
  registerUser: (email: string, password: string, displayName: string) => Promise<UserCredential>;
  signIn: (email: string, password: string) => Promise<UserCredential>;
  signInWithGoogle: () => Promise<UserCredential>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  verifyEmail: () => Promise<void>;
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
  updateUserEmail: (email: string) => Promise<void>;
  updateUserPassword: (password: string) => Promise<void>;
  setError: (error: Error | null) => void;
  isAdmin: () => boolean;
  hasRole: (role: Role) => boolean;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState({
    user: null as UserProfile | null,
    loading: false,
    initialLoading: true,
    error: null as Error | null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userProfile = await getUserProfile(user);
          setAuthState(prev => ({
            ...prev,
            user: userProfile,
            initialLoading: false,
          }));

          // Update last login
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, { lastLogin: new Date() });
        } catch (error) {
          setAuthState(prev => ({
            ...prev,
            error: error as Error,
            initialLoading: false,
          }));
        }
      } else {
        setAuthState(prev => ({
          ...prev,
          user: null,
          initialLoading: false,
        }));
      }
    });

    return () => unsubscribe();
  }, []);

  const getUserProfile = async (user: User): Promise<UserProfile> => {
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    } else {
      // Create default profile if not exists
      const newProfile: UserProfile = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
        role: 'basic',
        createdAt: new Date(),
        lastLogin: new Date(),
      };

      await setDoc(userRef, newProfile);
      return newProfile;
    }
  };

  const signUp = async (email: string, password: string, displayName: string): Promise<UserCredential> => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Update display name
      await updateProfile(userCredential.user, { displayName });

      // Create user profile in Firestore
      const userProfile: UserProfile = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName,
        photoURL: userCredential.user.photoURL,
        emailVerified: userCredential.user.emailVerified,
        role: 'basic',
        createdAt: new Date(),
        lastLogin: new Date(),
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), userProfile);

      // Send email verification
      await sendEmailVerification(userCredential.user);

      setAuthState(prev => ({
        ...prev,
        user: userProfile,
        loading: false
      }));

      return userCredential;
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        error: error as Error,
        loading: false
      }));
      throw error;
    }
  };

  // Alias for signUp for more intuitive usage
  const registerUser = signUp;

  const signIn = async (email: string, password: string): Promise<UserCredential> => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userProfile = await getUserProfile(userCredential.user);

      setAuthState(prev => ({
        ...prev,
        user: userProfile,
        loading: false
      }));

      return userCredential;
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        error: error as Error,
        loading: false
      }));
      throw error;
    }
  };

  const signInWithGoogle = async (): Promise<UserCredential> => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const userProfile = await getUserProfile(userCredential.user);

      setAuthState(prev => ({
        ...prev,
        user: userProfile,
        loading: false
      }));

      return userCredential;
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        error: error as Error,
        loading: false
      }));
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await signOut(auth);
      setAuthState(prev => ({
        ...prev,
        user: null,
        loading: false
      }));
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        error: error as Error,
        loading: false
      }));
      throw error;
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await sendPasswordResetEmail(auth, email);
      setAuthState(prev => ({ ...prev, loading: false }));
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        error: error as Error,
        loading: false
      }));
      throw error;
    }
  };

  const verifyEmail = async (): Promise<void> => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
      } else {
        throw new Error('No user is signed in');
      }
      setAuthState(prev => ({ ...prev, loading: false }));
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        error: error as Error,
        loading: false
      }));
      throw error;
    }
  };

  const updateUserProfile = async (profile: Partial<UserProfile>): Promise<void> => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    try {
      if (!auth.currentUser || !authState.user) {
        throw new Error('No user is signed in');
      }

      // Update Firebase Auth profile if needed
      if (profile.displayName || profile.photoURL) {
        await updateProfile(auth.currentUser, {
          displayName: profile.displayName || auth.currentUser.displayName,
          photoURL: profile.photoURL || auth.currentUser.photoURL,
        });
      }

      // Update Firestore profile
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, { ...profile });

      // Update local state
      const updatedProfile = { ...authState.user, ...profile };
      setAuthState(prev => ({
        ...prev,
        user: updatedProfile as UserProfile,
        loading: false
      }));
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        error: error as Error,
        loading: false
      }));
      throw error;
    }
  };

  const updateUserEmail = async (email: string): Promise<void> => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    try {
      if (!auth.currentUser) {
        throw new Error('No user is signed in');
      }

      await updateEmail(auth.currentUser, email);

      // Update Firestore profile
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, { email });

      // Update local state
      setAuthState(prev => ({
        ...prev,
        user: prev.user ? { ...prev.user, email } : null,
        loading: false
      }));
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        error: error as Error,
        loading: false
      }));
      throw error;
    }
  };

  const updateUserPassword = async (password: string): Promise<void> => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    try {
      if (!auth.currentUser) {
        throw new Error('No user is signed in');
      }

      await updatePassword(auth.currentUser, password);
      setAuthState(prev => ({ ...prev, loading: false }));
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        error: error as Error,
        loading: false
      }));
      throw error;
    }
  };

  const setError = (error: Error | null) => {
    setAuthState(prev => ({ ...prev, error }));
  };

  const isAdmin = (): boolean => {
    if (!authState.user) return false;
    const adminRoles: Role[] = ['support', 'admin', 'super_admin'];
    return adminRoles.includes(authState.user.role);
  };

  const hasRole = (role: Role): boolean => {
    if (!authState.user) return false;
    return authState.user.role === role;
  };

  const authValue: AuthContextType = {
    user: authState.user,
    loading: authState.loading,
    initialLoading: authState.initialLoading,
    error: authState.error,
    signUp,
    registerUser,
    signIn,
    signInWithGoogle,
    logout,
    resetPassword,
    verifyEmail,
    updateUserProfile,
    updateUserEmail,
    updateUserPassword,
    setError,
    isAdmin,
    hasRole,
  }
  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthProvider
