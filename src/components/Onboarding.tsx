import React, { useState } from 'react';
import type { User, Family } from '../types';
import { Users, Home, ArrowRight, UserPlus } from 'lucide-react';
import { useFirebaseFamily } from '../hooks/useFirebaseFamily';

interface OnboardingProps {
  user: User;
  onComplete: (user: User, family: Family) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ user, onComplete }) => {
  const { createFamily, joinFamily, loading, error: firebaseError } = useFirebaseFamily();

  const [view, setView] = useState<'selection' | 'create' | 'join'>('selection');
  const [familyName, setFamilyName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!familyName.trim()) return;

    const code = await createFamily(familyName, user.id);

    if (code) {
      const updatedUser = { ...user, familyId: code };

      const family: Family = {
        id: code,
        name: familyName,
        inviteCode: code,
        creatorId: user.id,
        memberIds: [user.id],
        createdAt: Date.now(),
      };

      onComplete(updatedUser, family);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;

    const familyData = await joinFamily(inviteCode, user.name, user.id);

    if (familyData) {
      const updatedUser = { ...user, familyId: inviteCode };

      const family: Family = {
        id: familyData.familyCode,
        name: familyData.familyCode,
        inviteCode: familyData.familyCode,
        creatorId: familyData.adminId,
        memberIds: familyData.members.map((m) => m.id),
        createdAt: new Date(familyData.createdAt).getTime(),
      };

      onComplete(updatedUser, family);
    } else {
      setError(firebaseError || 'Invalid invite code. Please ask the family admin for the correct code.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-xl w-full">
        {view === 'selection' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Hello, {user.name}!</h1>
              <p className="text-gray-500 mt-2">To get started, let's set up your family workspace.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setView('create')}
                className="bg-white p-6 rounded-2xl shadow-sm border-2 border-transparent hover:border-blue-500 hover:shadow-md transition-all text-left group"
              >
                <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-blue-600 group-hover:scale-110 transition-transform">
                  <Home size={24} />
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-1">Create Family</h3>
                <p className="text-sm text-gray-500">I am the first one here. I'll set up the account.</p>
              </button>

              <button
                onClick={() => setView('join')}
                className="bg-white p-6 rounded-2xl shadow-sm border-2 border-transparent hover:border-purple-500 hover:shadow-md transition-all text-left group"
              >
                <div className="bg-purple-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-purple-600 group-hover:scale-110 transition-transform">
                  <Users size={24} />
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-1">Join Family</h3>
                <p className="text-sm text-gray-500">I have an invite code from a family member.</p>
              </button>
            </div>
          </div>
        )}

        {view === 'create' && (
          <div className="bg-white p-8 rounded-2xl shadow-xl animate-in fade-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Name your Household</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Family Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. The Smiths, Abuja House"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900 placeholder-gray-400"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  disabled={loading}
                />
              </div>
              {loading && <p className="text-blue-600 text-sm">Processing...</p>}
              {firebaseError && <p className="text-red-600 text-sm">{firebaseError}</p>}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setView('selection')}
                  className="px-6 py-3 text-gray-600 font-medium hover:bg-gray-50 rounded-xl transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Profile'} {!loading && <ArrowRight size={18} />}
                </button>
              </div>
            </form>
          </div>
        )}

        {view === 'join' && (
          <div className="bg-white p-8 rounded-2xl shadow-xl animate-in fade-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Enter Invite Code</h2>
            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Family Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. X8J29A"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none uppercase tracking-widest font-mono bg-white text-gray-900 placeholder-gray-400"
                  value={inviteCode}
                  onChange={(e) => {
                    setInviteCode(e.target.value.toUpperCase());
                    setError('');
                  }}
                  disabled={loading}
                />
                {(error || firebaseError) && <p className="text-red-500 text-sm mt-2">{error || firebaseError}</p>}
              </div>
              {loading && <p className="text-blue-600 text-sm">Processing...</p>}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setView('selection')}
                  className="px-6 py-3 text-gray-600 font-medium hover:bg-gray-50 rounded-xl transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-purple-600 text-white font-bold py-3 rounded-xl hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 disabled:bg-purple-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Joining...' : 'Join Family'} {!loading && <UserPlus size={18} />}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
