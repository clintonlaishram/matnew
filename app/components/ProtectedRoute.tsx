'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      // Redirect to login if no user is found
      router.push(`/login?redirectTo=${encodeURIComponent(window.location.pathname)}`);
    } else {
      try {
        const parsedUser = JSON.parse(user);
        if (!parsedUser || !parsedUser.user_id) {
          localStorage.removeItem('user'); // Clear invalid data
          router.push(`/login?redirectTo=${encodeURIComponent(window.location.pathname)}`);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('Invalid session data:', err);
        router.push(`/login?redirectTo=${encodeURIComponent(window.location.pathname)}`);
      }
    }
  }, [router]);

  if (loading) {
    return <div>Loading...</div>; // You can display a loader here
  }

  return <>{children}</>;
}
