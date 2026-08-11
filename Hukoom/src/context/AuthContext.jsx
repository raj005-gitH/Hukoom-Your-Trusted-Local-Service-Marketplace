import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Initialize state synchronously from localStorage to prevent flash of "logged out" state
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("hukoom_user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      localStorage.removeItem("hukoom_user");
      return null;
    }
  });

  const [role, setRole] = useState(() => {
    return localStorage.getItem("hukoom_role") || null;
  });

  const [isLoading, setIsLoading] = useState(false); // No longer strictly needed for hydration, but useful for other async auth tasks

  const login = (userData, userRole) => {
    setUser(userData);
    setRole(userRole);
    localStorage.setItem("hukoom_user", JSON.stringify(userData));
    localStorage.setItem("hukoom_role", userRole);
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    localStorage.removeItem("hukoom_user");
    localStorage.removeItem("hukoom_role");
  };

  return (
    <AuthContext.Provider value={{ user, role, login, logout, isLoggedIn: !!user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
