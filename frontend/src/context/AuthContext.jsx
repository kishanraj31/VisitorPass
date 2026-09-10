import { createContext, useContext, useState, useEffect } from "react";
import { login as apiLogin, getMe } from "../api/authApi";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("vps_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      if (token) {
        try {
          const res = await getMe();
          setUser(res.data);
        } catch {
          // Token is invalid or expired — clear session
          localStorage.removeItem("vps_token");
          setToken(null);
        }
      }
      setLoading(false);
    };
    restoreSession();
  }, [token]);

  const login = async (email, password, role) => {
    const res = await apiLogin({ email, password, role });
    const { user: userData, token: jwt } = res.data;
    localStorage.setItem("vps_token", jwt);
    setToken(jwt);
    setUser(userData);
    return userData;
  };



  const logout = () => {
    localStorage.removeItem("vps_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
