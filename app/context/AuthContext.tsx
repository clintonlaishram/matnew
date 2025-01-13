'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextProps {
  isLoggedIn: boolean;
  isEmployeeLoggedIn: boolean;
  login: (userType: 'user' | 'employee') => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isEmployeeLoggedIn, setIsEmployeeLoggedIn] = useState(false);

  useEffect(() => {
    // Check if 'user' or 'employee' exists in localStorage
    const userJson = localStorage.getItem('user');
    const employeeJson = localStorage.getItem('employee');
    
    // Update state based on the stored values
    setIsLoggedIn(!!userJson);
    setIsEmployeeLoggedIn(!!employeeJson);
  }, []);

  const login = (userType: 'user' | 'employee') => {
    if (userType === 'user') {
      localStorage.setItem('user', 'true');  // Set in localStorage
      setIsLoggedIn(true);
    }
    if (userType === 'employee') {
      localStorage.setItem('employee', 'true'); // Set in localStorage
      setIsEmployeeLoggedIn(true);
    }
  };

  const logout = () => {
    // Remove login state from localStorage when logging out
    localStorage.removeItem('user');
    localStorage.removeItem('employee');
    setIsLoggedIn(false);
    setIsEmployeeLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, isEmployeeLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};