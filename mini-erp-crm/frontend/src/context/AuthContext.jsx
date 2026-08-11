import { useEffect, useMemo, useState } from "react";
import { AuthContext } from "./auth";
import { loginUser, registerUser } from "../services/authService";

const readStoredAuth = () => {
  const storedToken = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");

  if (!storedToken || !storedUser) {
    return { token: null, user: null };
  }

  try {
    return { token: storedToken, user: JSON.parse(storedUser) };
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return { token: null, user: null };
  }
};

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(readStoredAuth);
  const [loading] = useState(false);

  useEffect(() => {
    if (!auth.token || !auth.user) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }, [auth]);

  const login = async (email, password) => {
    const data = await loginUser(email, password);
    if (data.success) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setAuth({ token: data.token, user: data.user });
    }
    return data;
  };

  const register = async (name, email, password, role) => {
    return registerUser(name, email, password, role);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuth({ token: null, user: null });
  };

  const value = useMemo(() => {
    const isAuthenticated = !!auth.token && !!auth.user;

    return {
      user: auth.user,
      token: auth.token,
      loading,
      login,
      register,
      logout,
      isAuthenticated,
      hasRole: (role) => auth.user?.role === role,
      hasAnyRole: (roles) => roles.includes(auth.user?.role),
    };
  }, [auth, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
