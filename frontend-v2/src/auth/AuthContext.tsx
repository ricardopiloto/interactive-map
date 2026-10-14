import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { ApiError, api } from "@/api/client";

export interface User {
  id: number;
  email: string;
  is_admin: boolean;
}
interface AuthState {
  user: User | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}
const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setUser(await api.get<User>("/api/auth/me"));
      setError(null);
    } catch (reason) {
      setUser(null);
      setError(reason instanceof ApiError && reason.status === 401 ? null : (reason as Error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const expired = () => {
      setUser(null);
      setError(null);
    };
    window.addEventListener("codex:auth-expired", expired);
    return () => window.removeEventListener("codex:auth-expired", expired);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      await api.post("/api/auth/login", { email, password });
      await refresh();
    },
    [refresh],
  );

  const logout = useCallback(async () => {
    try {
      await api.post("/api/auth/logout");
    } finally {
      setUser(null);
      setError(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error, refresh, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth requires AuthProvider");
  return value;
}
