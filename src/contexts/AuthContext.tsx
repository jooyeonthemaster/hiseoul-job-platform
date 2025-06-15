'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { User } from '@/types';
import { onAuthChange, getUserData } from '@/lib/auth';

interface AuthContextType {
  user: FirebaseUser | null;
  userData: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUserData = async () => {
    if (user) {
      try {
        const data = await getUserData(user.uid);
        setUserData(data);
      } catch (error) {
        console.error('Error refreshing user data:', error);
      }
    }
  };

  useEffect(() => {
    let isSubscribed = true; // cleanup을 위한 플래그
    
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (!isSubscribed) return; // 이미 cleanup된 경우 무시
      
      console.log('🔄 AuthContext - Auth state changed:', !!firebaseUser);
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          console.log('📋 AuthContext - Fetching user data for:', firebaseUser.uid);
          const data = await getUserData(firebaseUser.uid);
          if (isSubscribed) {
            console.log('✅ AuthContext - User data loaded:', data);
            setUserData(data);
          }
        } catch (error) {
          console.error('❌ AuthContext - Error fetching user data:', error);
          if (isSubscribed) {
            setUserData(null);
          }
        }
      } else {
        console.log('🚫 AuthContext - No user, clearing data');
        if (isSubscribed) {
          setUserData(null);
        }
      }
      
      if (isSubscribed) {
        setLoading(false);
        console.log('🏁 AuthContext - Loading complete');
      }
    });

    return () => {
      isSubscribed = false; // cleanup 플래그 설정
      unsubscribe();
    };
  }, []); // 빈 의존성 배열로 한 번만 실행

  const value: AuthContextType = {
    user,
    userData,
    loading,
    isAuthenticated: !!user,
    refreshUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 