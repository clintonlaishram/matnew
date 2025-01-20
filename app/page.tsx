'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/home'); // Redirect to /home page
  }, [router]);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-black text-white">
      <div className="text-center">
        <p className="text-xl font-semibold">Loading...</p>
      </div>

    </div>
  );
}
