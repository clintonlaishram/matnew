// components/AuthGuard.tsx
'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';
import { User } from '@supabase/supabase-js';

interface AuthGuardProps {
  children: ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUser(data.user);
      } else {
        router.push('/login'); // Redirect to login if not authenticated
      }
    };

    checkUser();
  }, [router]);

  // Show loading state until user is fetched
  if (!user) {
    return <p>Loading...</p>;
  }

  return <>{children}</>; // Render children if authenticated
}
