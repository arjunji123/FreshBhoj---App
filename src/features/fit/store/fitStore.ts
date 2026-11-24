import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { mmkvZustandStorage } from '@utils/mmkvStorage';
import type { FitGoal } from '../fit.constants';
import { calcTargets, type FitProfile, type FitTargets } from '../fit.utils';

export const WATER_GOAL = 8;

const todayKey = () => new Date().toDateString();

interface FitState {
  profile: FitProfile | null;
  targets: FitTargets | null;
  /** The goal chip last picked on the Fit tab. */
  goal: FitGoal;
  water: { day: string; glasses: number };
  saveProfile: (profile: FitProfile) => void;
  clearProfile: () => void;
  setGoal: (goal: FitGoal) => void;
  setWater: (glasses: number) => void;
}

export const useFitStore = create<FitState>()(
  persist(
    (set) => ({
      profile: null,
      targets: null,
      goal: 'ALL',
      water: { day: todayKey(), glasses: 0 },
      saveProfile: (profile) => set({ profile, targets: calcTargets(profile), goal: profile.goal }),
      clearProfile: () => set({ profile: null, targets: null }),
      setGoal: (goal) => set({ goal }),
      setWater: (glasses) =>
        set({ water: { day: todayKey(), glasses: Math.max(0, Math.min(WATER_GOAL, glasses)) } }),
    }),
    { name: 'fit-store', storage: createJSONStorage(() => mmkvZustandStorage) },
  ),
);

/** Today's glasses; a new day starts from zero without any cleanup job. */
export function useWaterToday(): number {
  return useFitStore((s) => (s.water.day === todayKey() ? s.water.glasses : 0));
}
