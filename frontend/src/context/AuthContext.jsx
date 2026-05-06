import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("oss_token"));
  const [user, setUser] = useState(localStorage.getItem("oss_user"));

  useEffect(() => {
    if (token) {
      localStorage.setItem("oss_token", token);
    } else {
      localStorage.removeItem("oss_token");
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("oss_user", user);
    } else {
      localStorage.removeItem("oss_user");
    }
  }, [user]);

  const login = async (username, password) => {
    const { data } = await api.post("/auth/login", { username, password });
    setToken(data.token);
    setUser(data.user.username);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(token),
      token,
      user,
      login,
      logout,
    }),
    [token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
