import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import api from "../api/api";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  
  initializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (patch: Partial<Pick<User, "name">>) => Promise<void>;
}

const STORAGE_KEY = "zabatet_user";

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored: string | null) => {
        if (stored) setUser(JSON.parse(stored));
      })
      .catch(() => {})
      .finally(() => setInitializing(false));
  }, []);

  useEffect(() => {
    if (initializing) return; 
    if (user) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user)).catch(() => {});
    } else {
      AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
    }
  }, [user, initializing]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      await AsyncStorage.setItem("zabatet_token", data.data.token);
      setUser(data.data.user);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        throw new Error(err.response?.data?.message ?? "Login failed");
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", {
        name,
        email,
        password,
      });
      await AsyncStorage.setItem("zabatet_token", data.data.token);
      setUser(data.data.user);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        throw new Error(err.response?.data?.message ?? "Sign up failed");
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      
    } finally {
      await AsyncStorage.removeItem("zabatet_token");
      setUser(null);
    }
  };

  const updateUser = async (patch: Partial<Pick<User, "name">>) => {
    try {
      const { data } = await api.patch("/users/me", patch);
      setUser((prev) => (prev ? { ...prev, ...data.data } : prev));
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          await logout();
        }
        throw new Error(
          err.response?.data?.message ?? "Failed to update profile",
        );
      }
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, initializing, login, signup, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
