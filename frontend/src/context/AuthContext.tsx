import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { MOCK_USERS } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  switchUser: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to Dr. Elena Vance (Lead Radiologist) for immediate rich exploration
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('medivision_user');
    if (saved) {
      try { return JSON.parse(saved); } catch { }
    }
    return MOCK_USERS[1]; // Dr. Elena Vance
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('medivision_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('medivision_user');
    }
  }, [user]);

  const login = async (email: string): Promise<boolean> => {
    const found = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase()) || MOCK_USERS[1];
    setUser(found);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  const switchUser = (role: UserRole) => {
    const matched = MOCK_USERS.find(u => u.role === role) || MOCK_USERS[0];
    setUser(matched);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, switchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

