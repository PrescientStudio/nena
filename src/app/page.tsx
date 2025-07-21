'use client'
import Header from '../components/Header';
import { auth, db } from '../lib/firebase';

export default function Home() {
  const testFirebase = () => {
    console.log('Firebase Auth:', auth);
    console.log('Firebase DB:', db);
    alert('Firebase connected! Check the console for details.');
  };

  return (
    <div>
      <Header />
      <div className="p-8">
        <h1 className="text-4xl font-bold">Welcome to Nena</h1>
        <p className="mt-4 text-gray-600">AI-powered speech analysis and coaching platform</p>
        <button 
          onClick={testFirebase}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Test Firebase Connection
        </button>
      </div>
    </div>
  );
}