import { supabaseClient, encrypt } from '../../../../lib/supabase';

// GitHub OAuth API route

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const userId = searchParams.get('user_id'); // Assume user_id is passed in state or as param

    if (!code || !userId) {
      return new Response(JSON.stringify({ error: 'Missing code or user_id' }), { status: 400 });
    }

    // Exchange code for access token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
      }),
    });
    const tokenData = await tokenRes.json() as { access_token?: string; [key: string]: any };
    if (!tokenData.access_token) {
      return new Response(JSON.stringify({ error: 'Failed to get access token', details: tokenData }), { status: 500 });
    }

    // Store encrypted token in Supabase
    const { error } = await supabaseClient.from('user_tokens').upsert({
      user_id: userId,
      provider: 'github',
      encrypted_token: encrypt(tokenData.access_token),
    });
    if (error) {
      return new Response(JSON.stringify({ error: 'Failed to store token', details: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: 'Internal server error', details: err.message }), { status: 500 });
  }
} 