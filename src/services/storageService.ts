import type { UtilityLog, User, Family } from '../types';

const LOGS_KEY = 'naira_power_logs_v2';
const CURRENT_USER_KEY = 'naira_power_current_user';
const USERS_DB_KEY = 'naira_power_users_db';
const FAMILIES_KEY = 'naira_power_families';

// --- Helpers to manage "Database" in LocalStorage ---

const getDB = <T>(key: string): T[] => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : [];
};

const saveDB = <T>(key: string, data: T[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// --- Family Management ---

const generateInviteCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const createFamily = (name: string, creator: User): Family => {
  const families = getDB<Family>(FAMILIES_KEY);
  
  const newFamily: Family = {
    id: Date.now().toString(),
    name: name,
    creatorId: creator.id,
    inviteCode: generateInviteCode(),
    memberIds: [creator.id],
    createdAt: Date.now()
  };

  families.push(newFamily);
  saveDB(FAMILIES_KEY, families);
  
  // Update creator's familyId
  updateUser({ ...creator, familyId: newFamily.id });
  
  return newFamily;
};

export const joinFamily = (inviteCode: string, user: User): Family | null => {
  const families = getDB<Family>(FAMILIES_KEY);
  const family = families.find(f => f.inviteCode === inviteCode.trim().toUpperCase());
  
  if (!family) return null;
  
  if (!family.memberIds.includes(user.id)) {
    family.memberIds.push(user.id);
    saveDB(FAMILIES_KEY, families);
  }

  // Update user's familyId
  updateUser({ ...user, familyId: family.id });
  
  return family;
};

export const getFamily = (familyId: string): Family | null => {
  const families = getDB<Family>(FAMILIES_KEY);
  return families.find(f => f.id === familyId) || null;
};

// --- User Management ---

export const getOrRegisterUser = (email: string, name?: string): User => {
  const users = getDB<User>(USERS_DB_KEY);
  const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (existingUser) {
    return existingUser;
  }

  // Create new user if doesn't exist
  let displayName = name;
  if (!displayName || !displayName.trim()) {
      const namePart = email.split('@')[0];
      displayName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
  }
  
  const newUser: User = {
    id: email.toLowerCase(),
    email: email.toLowerCase(),
    name: displayName,
    avatar: `https://ui-avatars.com/api/?name=${displayName}&background=random&color=fff&bold=true`,
    familyId: null
  };
  
  // Special case for demo user: Auto-create demo family
  if (email === 'demo@gmail.com') {
    const families = getDB<Family>(FAMILIES_KEY);
    let demoFamily = families.find(f => f.name === 'Demo Household');
    
    if (!demoFamily) {
        demoFamily = {
            id: 'demo-family-id',
            name: 'Demo Household',
            creatorId: newUser.id,
            inviteCode: 'DEMO123',
            memberIds: [newUser.id],
            createdAt: Date.now()
        };
        saveDB(FAMILIES_KEY, [...families, demoFamily]);
        
        // Seed logs for demo family
        const initialLogs: UtilityLog[] = [
          {
            id: '1',
            familyId: 'demo-family-id',
            userId: 'demo@gmail.com',
            userName: 'Dad',
            date: '2023-10-01',
            units: 150,
            amount: 15000,
            previousReading: 12400,
            createdAt: 1696118400000
          },
          {
            id: '2',
            familyId: 'demo-family-id',
            userId: 'mom@gmail.com',
            userName: 'Mom',
            date: '2023-10-15',
            units: 120,
            amount: 12000,
            previousReading: 12550,
            createdAt: 1697328000000
          }
        ];
        saveDB(LOGS_KEY, initialLogs);
    }
    newUser.familyId = demoFamily.id;
  }

  users.push(newUser);
  saveDB(USERS_DB_KEY, users);
  return newUser;
};

export const updateUser = (user: User) => {
  const users = getDB<User>(USERS_DB_KEY);
  const index = users.findIndex(u => u.id === user.id);
  if (index !== -1) {
    users[index] = user;
    saveDB(USERS_DB_KEY, users);
  }
  // Also update session if it matches
  const currentUser = getCurrentUserSession();
  if (currentUser && currentUser.id === user.id) {
    saveUserSession(user);
  }
};

export const getUsers = (userIds: string[]): User[] => {
  const users = getDB<User>(USERS_DB_KEY);
  return users.filter(u => userIds.includes(u.id));
};

// --- Session Management ---

export const saveUserSession = (user: User) => {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
};

export const getCurrentUserSession = (): User | null => {
  const stored = localStorage.getItem(CURRENT_USER_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const clearUserSession = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

// --- Logs Management ---

export const getLogs = (familyId: string): UtilityLog[] => {
  const allLogs = getDB<UtilityLog>(LOGS_KEY);
  return allLogs
    .filter(log => log.familyId === familyId)
    .sort((a, b) => b.createdAt - a.createdAt); // Newest first
};

export const addLog = (log: UtilityLog): UtilityLog[] => {
  const allLogs = getDB<UtilityLog>(LOGS_KEY);
  const updatedAll = [log, ...allLogs];
  saveDB(LOGS_KEY, updatedAll);
  return updatedAll.filter(l => l.familyId === log.familyId).sort((a, b) => b.createdAt - a.createdAt);
};

export const deleteLog = (id: string, familyId: string): UtilityLog[] => {
  const allLogs = getDB<UtilityLog>(LOGS_KEY);
  const updatedAll = allLogs.filter(l => l.id !== id);
  saveDB(LOGS_KEY, updatedAll);
  return updatedAll.filter(l => l.familyId === familyId).sort((a, b) => b.createdAt - a.createdAt);
};
