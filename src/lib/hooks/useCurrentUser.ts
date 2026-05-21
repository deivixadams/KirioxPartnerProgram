import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { AuthAPI } from '@/lib/api';

export interface CurrentUser {
  id: string;
  email: string;
  roleName: 'ADMINISTRADOR' | 'SOCIO';
  partner: any | null;
}

export function useCurrentUser() {
  const { data: session, status } = useSession();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (status === 'unauthenticated') {
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await AuthAPI.me();
        setCurrentUser(res.data);
      } catch (error) {
        console.error('Error fetching current user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [status]);

  const isAdmin = currentUser?.roleName === 'ADMINISTRADOR';
  const isPartner = currentUser?.roleName === 'SOCIO';
  const partnerId = currentUser?.partner?.id;

  return {
    user: currentUser,
    isAdmin,
    isPartner,
    partnerId,
    partnerData: currentUser?.partner,
    loading: loading || status === 'loading',
  };
}
