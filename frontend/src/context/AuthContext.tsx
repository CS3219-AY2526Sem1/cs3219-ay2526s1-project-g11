import { createContext, useContext, useEffect, useState } from "react";
import { verifyToken } from "../api/UserService";
import type { LoginResponse, User } from "../types/types";

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (user: LoginResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkToken = async () => {
    const token = localStorage.getItem("authToken");

    if (token) {
      try {
        const verification = await verifyToken();
        setIsAuthenticated(true);
        setUser(verification.data);
      } catch {
        setLoading(false);
      }
    }
    setLoading(false);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: This effect should only run once on mount
  useEffect(() => {
    checkToken();
  }, []);

  const login = (user: LoginResponse) => {
    localStorage.setItem("authToken", user.data.accessToken);
    setIsAuthenticated(true);
    setUser(user.data);
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setIsAuthenticated(false);
    setUser(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
