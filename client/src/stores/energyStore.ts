import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface EnergyStatePersisted {
  energyPoints: number;
  totalDistanceMeters: number;
  lastUpdated: number | null;
}

interface EnergyPublicState extends EnergyStatePersisted {
  readonly MAX_ENERGY: number;
  readonly METERS_PER_REWARD: number;
  readonly ENERGY_PER_CHUNK: number;
  addDistance: (meters: number) => void; // adds distance and awards energy
  resetEnergy: () => void;
  setEnergyDirect: (points: number) => void; // optional manual override
}

export const useEnergyStore = create<EnergyPublicState>()(
  persist(
    (set, get) => ({
      energyPoints: 0,
      totalDistanceMeters: 0,
      lastUpdated: null,
      MAX_ENERGY: 500,
      METERS_PER_REWARD: 10,
      ENERGY_PER_CHUNK: 5,
      addDistance: (meters: number) => {
        if (meters <= 0) return;
        // Filter tiny jitter and huge jumps redundantly (guard if caller forgets)
        if (meters < 0.3 || meters > 100) return;
        const { METERS_PER_REWARD, ENERGY_PER_CHUNK, MAX_ENERGY } = get();
        let { totalDistanceMeters, energyPoints } = get();
        totalDistanceMeters += meters;
        const chunksEarned = Math.floor(
          totalDistanceMeters / METERS_PER_REWARD
        );
        const expectedEnergy = Math.min(
          chunksEarned * ENERGY_PER_CHUNK,
          MAX_ENERGY
        );
        if (expectedEnergy > energyPoints) {
          energyPoints = expectedEnergy;
        }
        set({ totalDistanceMeters, energyPoints, lastUpdated: Date.now() });
      },
      resetEnergy: () => {
        set({
          energyPoints: 0,
          totalDistanceMeters: 0,
          lastUpdated: Date.now(),
        });
      },
      setEnergyDirect: (points: number) => {
        const { MAX_ENERGY } = get();
        set({
          energyPoints: Math.min(points, MAX_ENERGY),
          lastUpdated: Date.now(),
        });
      },
    }),
    {
      name: "bloxland-energy",
      partialize: (state) => ({
        energyPoints: state.energyPoints,
        totalDistanceMeters: state.totalDistanceMeters,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);
