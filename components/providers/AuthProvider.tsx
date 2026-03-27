'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  profile: any | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const profileRef = doc(db, 'profiles', user.uid);
    
    const unsubscribe = onSnapshot(profileRef, (docSnap) => {
      if (docSnap.exists()) {
        setProfile({ id: docSnap.id, ...docSnap.data() });
      } else {
        setProfile(null);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `profiles/${user.uid}`);
      setProfile(null);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
