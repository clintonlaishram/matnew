'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export type UserDetails = {
  name: string;
  phone: string;
  address: string;
  email?: string; // Add this if missing
};

export const useUserDetails = () => {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const user = JSON.parse(sessionStorage.getItem('user') || '{}');
      if (!user?.email) return;

      const { data, error } = await supabase
        .from('users')
        .select('name, phone, address')
        .eq('email', user.email)
        .single();

      if (!error) {
        setUserDetails(data);
      }
    };

    fetchUserDetails();
  }, []);

  return userDetails;
};
