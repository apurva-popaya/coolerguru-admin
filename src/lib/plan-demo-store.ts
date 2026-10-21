"use client";

import { useEffect, useSyncExternalStore } from "react";
import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";

import { demoPlans, type Plan } from "@/lib/billing-demo";

interface PlanStore {
  plans: Plan[];
  save: (plan: Plan) => void;
  toggle: (id: string) => void;
}

const memory = new Map<string, string>();
// Defer browser access so the store also renders safely on the server.
// If browser storage is unavailable, changes remain usable for this session.
const storage: StateStorage = {
  getItem: (name) => {
    try {
      const value = typeof window === "undefined" ? null : window.localStorage.getItem(name);
      if (value) JSON.parse(value);
      return value ?? memory.get(name) ?? null;
    } catch {
      return memory.get(name) ?? null;
    }
  },
  setItem: (name, value) => {
    memory.set(name, value);
    try {
      if (typeof window !== "undefined") window.localStorage.setItem(name, value);
    } catch {
      // The in-memory copy keeps the prototype usable when persistence is blocked.
    }
  },
  removeItem: (name) => {
    memory.delete(name);
    try {
      if (typeof window !== "undefined") window.localStorage.removeItem(name);
    } catch {
      // In-memory data has already been removed.
    }
  },
};

const usePlanStore = create<PlanStore>()(
  persist(
    (set) => ({
      plans: demoPlans,
      save: (plan) =>
        set((state) => ({
          plans: state.plans.some((p) => p.id === plan.id)
            ? state.plans.map((p) => (p.id === plan.id ? plan : p))
            : [...state.plans, plan],
        })),
      toggle: (id) =>
        set((state) => ({ plans: state.plans.map((p) => (p.id === id ? { ...p, active: !p.active } : p)) })),
    }),
    {
      name: "coolerguru-demo-plans-v1",
      storage: createJSONStorage(() => storage),
      skipHydration: true,
    },
  ),
);

function subscribeHydration(listener: () => void) {
  const unsubscribeStart = usePlanStore.persist.onHydrate(listener);
  const unsubscribeEnd = usePlanStore.persist.onFinishHydration(listener);
  return () => {
    unsubscribeStart();
    unsubscribeEnd();
  };
}

export function useDemoPlans() {
  const store = usePlanStore();
  const ready = useSyncExternalStore(subscribeHydration, usePlanStore.persist.hasHydrated, () => false);
  useEffect(() => {
    void usePlanStore.persist.rehydrate();
  }, []);
  return { ...store, ready };
}
