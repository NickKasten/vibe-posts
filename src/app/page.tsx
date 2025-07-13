'use client'

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useCallback } from "react";

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
    window.location.href = `https://github.com/login/oauth/authorize?${params.toString()}`;
  }, []);

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