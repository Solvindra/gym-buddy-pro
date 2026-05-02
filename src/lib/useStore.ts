import { useEffect, useState } from "react";
import { subscribe, getSession, getGym } from "./store";
import type { Gym, Session } from "./types";

export function useSession(): Session {
  const [s, setS] = useState<Session>(() => getSession());
  useEffect(() => subscribe(() => setS(getSession())), []);
  return s;
}

export function useGym(gymId: string | undefined): Gym | null {
  const [g, setG] = useState<Gym | null>(() => (gymId ? getGym(gymId) : null));
  useEffect(() => {
    setG(gymId ? getGym(gymId) : null);
    return subscribe(() => setG(gymId ? getGym(gymId) : null));
  }, [gymId]);
  return g;
}
