import { supabaseClient, decrypt } from '../../../../lib/storage/supabase';

// GitHub activity fetch API route

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    if (!userId) {
      return new Response(JSON.stringify({ error: 'Missing user_id' }), { status: 400 });
    }

    // Retrieve encrypted token from Supabase
    const { data, error } = await supabaseClient
      .from('user_tokens')
      .select('encrypted_token')
      .eq('user_id', userId)
      .eq('provider', 'github')
      .single();
    if (error || !data) {
      return new Response(JSON.stringify({ error: 'Token not found', details: error?.message }), { status: 404 });
    }

    const accessToken = decrypt(data.encrypted_token);

    // Fetch user activity from GitHub
    const ghRes = await fetch('https://api.github.com/user/events', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!ghRes.ok) {
      return new Response(JSON.stringify({ error: 'Failed to fetch GitHub activity', status: ghRes.status }), { status: 502 });
    }
    const activity = await ghRes.json();
    return new Response(JSON.stringify({ activity }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: 'Internal server error', details: err.message }), { status: 500 });
  }
} 