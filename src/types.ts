export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  familyId: string | null; // Link to the family group
}

export interface Family {
  id: string;
  name: string;
  creatorId: string;
  inviteCode: string; // The code Dad shares with the family
  memberIds: string[];
  createdAt: number;
}

export interface UtilityLog {
  id: string;
  familyId: string; // Logs now belong to a family, not just a user
  userId: string;
  userName: string;
  date: string; // ISO string YYYY-MM-DD
  units: number; // kWh
  amount: number; // Naira
  previousReading: number;
  createdAt: number;
}

export interface AnalysisResult {
  summary: string;
  tips: string[];
}
