'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { Profile, getCurrentProfile } from './profile';

type UserContextType = {
  user: User | null;
  profile: Profile | null;
  role: string | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
};

const UserContext = createContext<UserContextType>({
  user: null,
  profile: null,
  role: null,
  loading: true,
  refreshProfile: async () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    const p = await getCurrentProfile();
    setProfile(p);
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        getCurrentProfile().then((p) => {
          setProfile(p);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        getCurrentProfile().then(setProfile);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, profile, role: profile?.role ?? null, loading, refreshProfile }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
