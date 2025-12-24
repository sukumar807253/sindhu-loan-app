import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  let initialUser = null;

  try {
    const stored = localStorage.getItem("user");

    // ✅ SAFE CHECK
    if (stored && stored !== "undefined") {
      initialUser = JSON.parse(stored);
    }
  } catch (err) {
    console.error("Invalid user data in localStorage", err);
    localStorage.removeItem("user");
  }

  const [user, setUser] = useState(initialUser);

  const login = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("center");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
