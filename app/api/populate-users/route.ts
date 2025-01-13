// app/api/populate-users/route.ts
import { supabase } from '../../../lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function GET() {
  const users = [
    {
      name: 'Alice',
      email: 'alice@example.com',
      password: 'password123', // Example password; handle securely in production
      address: '123 Main St, Springfield',
      phone: '123-456-7890',
      is_business_owner: false,
      business_name: null,
      business_address: null,
      business_type: null,
      product_service: null,
      business_experience: null,
      business_description: null,
      is_registered: false,
    },
    {
      name: 'Bob',
      email: 'bob@example.com',
      password: 'password123',
      address: '456 Elm St, Springfield',
      phone: '987-654-3210',
      is_business_owner: true,
      business_name: 'Bob\'s Bakery',
      business_address: '456 Elm St, Springfield',
      business_type: 'Food & Beverage',
      product_service: 'Bakery Products',
      business_experience: '5 years',
      business_description: 'A local bakery offering fresh bread and pastries.',
      is_registered: true,
    },
    {
      name: 'Charlie',
      email: 'charlie@example.com',
      password: 'password123',
      address: '789 Oak St, Springfield',
      phone: '555-555-5555',
      is_business_owner: false,
      business_name: null,
      business_address: null,
      business_type: null,
      product_service: null,
      business_experience: null,
      business_description: null,
      is_registered: false,
    },
    // Add more sample users as needed
  ];

  const { data, error } = await supabase.from('users').insert(users);

  if (error) {
    return NextResponse.json({ success: false, error: error.message });
  }

  return NextResponse.json({ success: true, data });
}
