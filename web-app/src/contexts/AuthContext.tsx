'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { User, UserRole, AuthState } from '@/types/auth';

interface AuthContextType extends AuthState {
  login: (role?: UserRole) => void;
  logout: () => void;
  setUserRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { publicKey, connected, disconnect } = useWallet();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (connected && publicKey) {
      // Check localStorage for existing user data
      const storedUser = localStorage.getItem(`user_${publicKey.toString()}`);
      
      if (storedUser) {
        const user: User = JSON.parse(storedUser);
        setAuthState({
          user,
          isAuthenticated: true,
          loading: false,
          error: null,
        });
      } else {
        // Create default user profile
        const defaultUser: User = {
          id: publicKey.toString(),
          name: 'User',
          email: '',
          role: UserRole.USER,
          walletAddress: publicKey.toString(),
        };
        
        localStorage.setItem(`user_${publicKey.toString()}`, JSON.stringify(defaultUser));
        setAuthState({
          user: defaultUser,
          isAuthenticated: true,
          loading: false,
          error: null,
        });
      }
    } else {
      setAuthState({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      });
    }
  }, [connected, publicKey]);

  const login = (role: UserRole = UserRole.USER) => {
    if (!publicKey) {
      setAuthState(prev => ({
        ...prev,
        error: 'Please connect your wallet first',
      }));
      return;
    }

    const user: User = {
      id: publicKey.toString(),
      name: 'User',
      email: '',
      role,
      walletAddress: publicKey.toString(),
    };

    localStorage.setItem(`user_${publicKey.toString()}`, JSON.stringify(user));
    setAuthState({
      user,
      isAuthenticated: true,
      loading: false,
      error: null,
    });
  };

  const logout = () => {
    if (publicKey) {
      localStorage.removeItem(`user_${publicKey.toString()}`);
    }
    disconnect();
    setAuthState({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,
    });
  };

  const setUserRole = (role: UserRole) => {
    if (!publicKey || !authState.user) return;

    const updatedUser: User = {
      ...authState.user,
      role,
    };

    localStorage.setItem(`user_${publicKey.toString()}`, JSON.stringify(updatedUser));
    setAuthState(prev => ({
      ...prev,
      user: updatedUser,
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        setUserRole,
      }}
    >
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
