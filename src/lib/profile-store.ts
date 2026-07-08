import { useEffect, useState } from "react";
import { loadJSON, saveJSON } from "./storage";

export type Profile = {
  name: string;
  email: string;
  role: string;
  timezone: string;
  initials: string;
};

const KEY = "workplace.profile.v1";

const DEFAULT_PROFILE: Profile = {
  name: "Alex Nguyen",
  email: "alex@work.com",
  role: "Product Manager",
  timezone: "America/Los_Angeles",
  initials: "AN",
};

function computeInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

type Listener = (p: Profile) => void;
const listeners = new Set<Listener>();
let current: Profile | null = null;

function read(): Profile {
  if (current) return current;
  const loaded = loadJSON<Profile>(KEY, DEFAULT_PROFILE);
  current = { ...DEFAULT_PROFILE, ...loaded };
  return current;
}

export function getProfile(): Profile {
  return read();
}

export function updateProfile(patch: Partial<Profile>) {
  const next = { ...read(), ...patch };
  next.initials = computeInitials(next.name);
  current = next;
  saveJSON(KEY, next);
  listeners.forEach((l) => l(next));
}

export function useProfile(): Profile {
  const [p, setP] = useState<Profile>(() => read());
  useEffect(() => {
    setP(read());
    const l: Listener = (n) => setP(n);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);
  return p;
}
