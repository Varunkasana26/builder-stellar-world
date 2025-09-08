import React, { createContext, useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

type User = { username: string; organization?: string; organizationLabel?: string; organizationState?: string } | null;

interface LoginMeta {
  organization?: string;
  organizationLabel?: string;
  organizationState?: string;
}

interface AuthContextValue {
  user: User;
  login: (username: string, password: string, meta?: LoginMeta) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "fra_auth_token";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed?.username) setUser({ username: parsed.username, organization: parsed.organization, organizationLabel: parsed.organizationLabel, organizationState: parsed.organizationState });
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const login = async (username: string, password: string, meta?: LoginMeta) => {
    // Mock authentication: accept any non-empty username/password
    if (!username || !password) throw new Error("Invalid credentials");

    // Create a deterministic token for demo purposes
    const token = btoa(`${username}:${Date.now()}`);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ username, token, organization: meta?.organization, organizationLabel: meta?.organizationLabel, organizationState: meta?.organizationState }));
    setUser({ username, organization: meta?.organization, organizationLabel: meta?.organizationLabel, organizationState: meta?.organizationState });
    // simulate network latency
    await new Promise((r) => setTimeout(r, 350));
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};
