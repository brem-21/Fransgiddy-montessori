"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import type { User } from "@/types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AUTH_KEYS = ["token", "user", "authToken", "jwt", "auth_token", "user_token", "access_token", "userToken", "auth", "session"];

function clearAllAuthKeys() {
  AUTH_KEYS.forEach((key) => localStorage.removeItem(key));
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore — token may already be expired
    } finally {
      clearAllAuthKeys();
      setUser(null);
      setToken(null);
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    const init = async () => {
      try {
        const storedToken = localStorage.getItem("token");
        if (!storedToken) {
          setLoading(false);
          return;
        }
        setToken(storedToken);
        const res = await authApi.me();
        if (res.data.success) {
          setUser(res.data.data);
        } else {
          logout();
        }
      } catch {
        clearAllAuthKeys();
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [logout]);

  const login = async (phone: string, password: string) => {
    const res = await authApi.login(phone, password);
    const { id, token: newToken, name, phone: userPhone, role } = res.data.data as {
      id: number; token: string; name: string; phone: string; role: "PRINCIPAL" | "TEACHER";
    };
    const newUser: User = { id: id ?? 0, name, phone: userPhone, role, active: true, createdAt: "" };
    clearAllAuthKeys();
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
