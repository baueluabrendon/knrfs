import { useState } from 'react';
import { UserProfile } from '@/types/auth';

export function useAuthState() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  return {
    user,
    setUser,
    loading,
    setLoading,
  };
}