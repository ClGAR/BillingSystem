import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { AuthContextValue, AuthUser } from "./authTypes";
import { clearStoredUser, getStoredUser, setStoredUser } from "./authStorage";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredUser();
    setUser(stored);
    setIsLoading(false);
  }, []);

  const signIn: AuthContextValue["signIn"] = async (email, password) => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      return { ok: false, error: "Email and password are required." };
    }

    const nextUser: AuthUser = {
      id: `user_${Math.random().toString(36).slice(2, 10)}`,
      email: trimmedEmail,
      displayName: trimmedEmail.split("@")[0] || "User",
      role: "admin"
    };

    setStoredUser(nextUser);
    setUser(nextUser);
    return { ok: true };
  };

  const signOut: AuthContextValue["signOut"] = async () => {
    clearStoredUser();
    setUser(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      signIn,
      signOut
    }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
