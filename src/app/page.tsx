'use client'

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useCallback, useState, useEffect } from "react";

const GITHUB_CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
const GITHUB_REDIRECT_URI = process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URI || (typeof window !== 'undefined' ? `${window.location.origin}/api/auth/github` : undefined);

function generateState(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Check if user just completed authentication
    const urlParams = new URLSearchParams(window.location.search);
    const authStatus = urlParams.get('auth');
    const userParam = urlParams.get('user');
    
    if (authStatus === 'success' && userParam) {
      setIsAuthenticated(true);
      setUserId(userParam);
      // Clean up URL
      window.history.replaceState({}, '', '/');
    }
  }, []);

  const handleGitHubAuth = useCallback(() => {
    if (!GITHUB_CLIENT_ID || !GITHUB_REDIRECT_URI) {
      alert('GitHub OAuth is not configured.');
      return;
    }
    const state = generateState();
    const params = new URLSearchParams({
      client_id: GITHUB_CLIENT_ID,
      redirect_uri: GITHUB_REDIRECT_URI,
      scope: 'read:user user:email',
      state,
    });
    const authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;
    console.log('GitHub OAuth URL:', authUrl);
    console.log('Redirect URI being sent:', GITHUB_REDIRECT_URI);
    window.location.href = authUrl;
  }, []);

  if (isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted p-4">
        <Card className="w-full max-w-md mx-auto shadow-lg">
          <CardHeader>
            <CardTitle>Welcome back! 🎉</CardTitle>
            <CardDescription>Your GitHub account is connected successfully.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-base text-muted-foreground mb-4">
              GitHub User ID: <code className="bg-muted px-2 py-1 rounded">{userId}</code>
            </p>
            <p className="text-base text-muted-foreground mb-4">
              Ready to generate your next LinkedIn post! The post generation interface is coming soon.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" size="lg" variant="outline" disabled>
              Post Generator (Coming Soon)
            </Button>
          </CardFooter>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader>
          <CardTitle>Vibe-Post</CardTitle>
          <CardDescription>Generate polished LinkedIn posts from your GitHub activity.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-base text-muted-foreground mb-4">
            Connect your GitHub account and let AI craft professional posts for you. Stay active on LinkedIn with zero hassle.
          </p>
        </CardContent>
        <CardFooter>
          <Button className="w-full" size="lg" variant="default" onClick={handleGitHubAuth}>
            Tell My Story
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}