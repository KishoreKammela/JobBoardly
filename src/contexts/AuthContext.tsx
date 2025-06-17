
"use client";
import type { UserProfile, UserRole } from '@/types';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface AuthContextType {
  user: UserProfile | null;
  login: (userData: UserProfile) => void;
  logout: () => void;
  updateUser: (updatedData: Partial<UserProfile>) => void;
  setUserRole: (role: UserRole) => void; // Allow role to be set, e.g. after registration
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('jobboardly-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (userData: UserProfile) => {
    setUser(userData);
    localStorage.setItem('jobboardly-user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('jobboardly-user');
  };
  
  const updateUser = (updatedData: Partial<UserProfile>) => {
    setUser(prevUser => {
      if (prevUser) {
        const newUser = { ...prevUser, ...updatedData };
        localStorage.setItem('jobboardly-user', JSON.stringify(newUser));
        return newUser;
      }
      return null;
    });
  };

  const setUserRole = (role: UserRole) => {
    if (user) {
      updateUser({ role });
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, setUserRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
