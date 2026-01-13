import React, { useState } from 'react';
import type { User } from '../types';
import { Zap, Mail, ArrowRight, User as UserIcon } from 'lucide-react';
import { getOrRegisterUser } from '../services/storageService';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    // Retrieve existing user or register new one with the provided name
    const user = getOrRegisterUser(email, name);
    onLogin(user);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-yellow-100 rounded-full blur-3xl opacity-50"></div>

      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full relative z-10 border border-gray-100">
        <div className="flex justify-center mb-8">
          <div className="bg-gradient-to-tr from-yellow-400 to-yellow-500 p-4 rounded-2xl text-white shadow-lg shadow-yellow-200">
            <Zap size={40} fill="currentColor" />
          </div>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-500">Sign in to manage your family's utility usage</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">Your Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <UserIcon size={18} />
              </div>
              <input
                id="name"
                type="text"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white text-gray-900 placeholder-gray-400"
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Mail size={18} />
              </div>
              <input
                id="email"
                type="email"
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white text-gray-900 placeholder-gray-400"
                placeholder="dad@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-3.5 rounded-xl font-semibold hover:bg-black transition-colors shadow-lg shadow-gray-200 active:scale-[0.99]"
          >
            Sign in with Email
            <ArrowRight size={18} />
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400 mb-2">
            Try <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-gray-600">demo@gmail.com</span> to see sample data
          </p>
          <p className="text-xs text-gray-300">
            NairaPower Tracker • Family Sync Enabled
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
