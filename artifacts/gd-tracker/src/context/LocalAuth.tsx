import { createContext, useContext, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  clearCurrentUser,
  getCurrentUser,
  setCurrentUser,
} from "@/lib/localStore";

interface LocalAuthValue {
  user: string | null;
  login: (username: string) => void;
  logout: () => void;
}

const LocalAuthContext = createContext<LocalAuthValue | null>(null);

export function LocalAuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<string | null>(() => getCurrentUser());

  const login = (username: string) => {
    const name = username.trim();
    if (!name) return;
    setCurrentUser(name);
    // Drop any cached data from a previous profile before showing this one's.
    queryClient.clear();
    // Reset the URL to the app root so the router always mounts on the
    // dashboard after login — even if the user arrived on a deep/unknown link.
    try {
      window.history.replaceState({}, "", import.meta.env.BASE_URL);
    } catch {
      /* ignore navigation failures */
    }
    setUser(name);
  };

  const logout = () => {
    clearCurrentUser();
    queryClient.clear();
    // Return to the app root so a later login starts cleanly on the dashboard.
    try {
      window.history.replaceState({}, "", import.meta.env.BASE_URL);
    } catch {
      /* ignore navigation failures */
    }
    setUser(null);
  };

  return (
    <LocalAuthContext.Provider value={{ user, login, logout }}>
      {children}
    </LocalAuthContext.Provider>
  );
}

export function useLocalAuth(): LocalAuthValue {
  const ctx = useContext(LocalAuthContext);
  if (!ctx) {
    throw new Error("useLocalAuth must be used within a LocalAuthProvider");
  }
  return ctx;
}
