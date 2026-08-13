"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "../types/api";
import { api } from "../lib/api";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
  clearUser: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = async () => {
    try {
      setLoading(true);
      const currentUser = await api.getCurrentUser();
      setUser(currentUser);
    } catch {
      console.error("Failed to fetch authenticated user");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const clearUser = () => {
    setUser(null);
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      console.error("Logout failed");
    } finally {
      clearUser();
      router.push("/login");
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        refreshUser,
        clearUser,
        logout,
      }}
    >
      {loading ? (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-400">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#e5e5e5] border-t-[#1cb0f6]"></div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
