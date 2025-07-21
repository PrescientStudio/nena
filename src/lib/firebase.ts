import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBoj6nMfpx8eXtIMhoNzdFmm6yiJjTyxNI",
  authDomain: "nena-11bfa.firebaseapp.com",
  projectId: "nena-11bfa",
  storageBucket: "nena-11bfa.firebasestorage.app",
  messagingSenderId: "392802293726",
  appId: "1:392802293726:web:650fd4071fc705def36f4f"
};

// Prevent multiple initialization
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
