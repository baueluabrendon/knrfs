
import { useState, useEffect } from 'react';
import { UserProfile } from '@/types/auth';

export function useAuthState() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Debug user state changes
  useEffect(() => {
    console.log("useAuthState: User state updated:", user);
  }, [user]);

  const updateUser = (newUser: UserProfile | null) => {
    console.log("useAuthState: Setting new user:", newUser);
    setUser(newUser);
  };

  return {
    user,
    setUser: updateUser,
    loading,
    setLoading,
  };
}
