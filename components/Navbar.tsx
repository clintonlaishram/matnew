// components/Navbar.tsx
'use client';

import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/login'); // Redirect to login on logout
  };

  return (
    <nav style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
      <Link href="/">Home</Link>
      {user ? (
        <>
          <Link href="/dashboard">Dashboard</Link>
          <button onClick={handleLogout} style={{ marginLeft: '10px' }}>
            Log Out
          </button>
        </>
      ) : (
        <>
          <Link href="/login">Login</Link>
          <Link href="/signup" style={{ marginLeft: '10px' }}>Signup</Link>
        </>
      )}
    </nav>
  );
}
