import { useState } from 'react';
import type { User, Family } from '../types';
import * as storageService from '../services/storageService';

interface FirebaseFamilyMember {
  id: string;
}

interface FirebaseFamilyData {
  familyCode: string;
  adminId: string;
  members: FirebaseFamilyMember[];
  createdAt: string;
}

interface UseFirebaseFamilyResult {
  createFamily: (familyName: string, userId: string) => Promise<string | null>;
  joinFamily: (inviteCode: string, userName: string, userId: string) => Promise<FirebaseFamilyData | null>;
  loading: boolean;
  error: string;
}

export const useFirebaseFamily = (): UseFirebaseFamilyResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const createFamily = async (familyName: string, userId: string): Promise<string | null> => {
    setLoading(true);
    setError('');

    try {
      const currentUser = storageService.getCurrentUserSession();
      if (!currentUser || currentUser.id !== userId) {
        throw new Error('Unable to find your account session. Please sign in again.');
      }

      const family: Family = storageService.createFamily(familyName, currentUser as User);
      return family.id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create family. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const joinFamily = async (
    inviteCode: string,
    _userName: string,
    userId: string
  ): Promise<FirebaseFamilyData | null> => {
    setLoading(true);
    setError('');

    try {
      const currentUser = storageService.getCurrentUserSession();
      if (!currentUser || currentUser.id !== userId) {
        throw new Error('Unable to find your account session. Please sign in again.');
      }

      const family = storageService.joinFamily(inviteCode, currentUser as User);
      if (!family) {
        setError('Invalid invite code. Please ask the family admin for the correct code.');
        return null;
      }

      return {
        familyCode: family.id,
        adminId: family.creatorId,
        members: family.memberIds.map((id) => ({ id })),
        createdAt: new Date(family.createdAt).toISOString(),
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not join family. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createFamily, joinFamily, loading, error };
};
