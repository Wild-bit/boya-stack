/**
 * 全局应用状态
 * 仅用于真正需要全局共享的状态
 */

import { getTeamListApi } from '@/api/organization';
import { TeamInfo } from '@/api/organization/types';
import { USER_LOCAL_STORAGE_KEY } from '@/contants';
import { UserInfo } from '@/types/common';
import { create } from 'zustand';

function getUserFromStorage(): UserInfo | null {
  try {
    const stored = localStorage.getItem(USER_LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

interface AppState {
  user: UserInfo | null;
  isLoading: boolean;
  teams: TeamInfo[];
  currentTeam: TeamInfo | null;
  setTeams: (teams: TeamInfo[]) => void;
  setCurrentTeam: (team: TeamInfo | null) => void;
  updateCurrentTeam: (partial: Partial<TeamInfo>) => void;
  setUser: (user: UserInfo | null) => void;
  updateUser: (partial: Partial<UserInfo>) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
  fetchTeams: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: getUserFromStorage(),
  isLoading: false,
  teams: [],
  currentTeam: null,
  setUser: (user) => {
    if (user) {
      localStorage.setItem(USER_LOCAL_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_LOCAL_STORAGE_KEY);
    }
    set({ user });
  },
  updateUser: (partial) => {
    const current = get().user;
    if (!current) return;
    const updated = { ...current, ...partial };
    localStorage.setItem(USER_LOCAL_STORAGE_KEY, JSON.stringify(updated));
    set({ user: updated });
  },
  setCurrentTeam: (team) => set({ currentTeam: team }),
  updateCurrentTeam: (partial) => {
    const current = get().currentTeam;
    if (!current) return;
    const updated = { ...current, ...partial };
    const teams = get().teams.map((t) => (t.id === current.id ? updated : t));
    set({ currentTeam: updated, teams });
  },
  setLoading: (isLoading) => set({ isLoading }),
  setTeams: (teams: TeamInfo[]) => set({ teams }),
  clearTeams: () => set({ teams: [] }),
  clearUser: () => {
    localStorage.removeItem(USER_LOCAL_STORAGE_KEY);
    set({ user: null });
  },

  fetchTeams: async () => {
    try {
      const teamList = await getTeamListApi();
      set({ teams: teamList.data.items });
    } catch (error) {
      console.error('fetchTeams error:', error);
    }
  },
}));
