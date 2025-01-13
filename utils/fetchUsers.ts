// utils/fetchUsers.ts

export async function fetchUsers() {
    const response = await fetch('https://mdxeolqfiosscdommyhc.supabase.co/rest/v1/users', {
      method: 'GET',
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
        'Content-Type': 'application/json',
      },
    });
  
    if (!response.ok) {
      throw new Error(`Error fetching users: ${response.statusText}`);
    }
  
    return await response.json();
  }
  