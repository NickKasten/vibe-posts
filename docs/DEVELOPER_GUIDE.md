
# 🛠 DEVELOPER_GUIDE.md

## Overview

This guide provides implementation notes for building and extending the LinkedPost Agent web app. It assumes you're using Next.js + TypeScript + Supabase.

---

## OAuth Integration

### GitHub OAuth (Web)
Use Supabase Auth or next-auth for GitHub OAuth:
```typescript
// Using Supabase Auth
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// GitHub OAuth
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'github',
  options: {
    scopes: 'read:user repo'
  }
})
```

### LinkedIn OAuth (Web)
Implement OAuth flow with PKCE:
```typescript
// LinkedIn OAuth setup
const linkedinAuth = {
  clientId: process.env.LINKEDIN_CLIENT_ID,
  redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/auth/linkedin/callback`,
  scope: 'r_liteprofile w_member_social'
}
```

---

## GitHub API Fetching
Use GitHub REST API with user's OAuth token:
```typescript
const fetchGitHubActivity = async (accessToken: string) => {
  const response = await fetch('/api/github/activity', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })
  return response.json()
}
```

---

## AI Prompt Example
```typescript
interface AIPrompt {
  system: string
  github_activity: string
  user_context: string
  style: 'technical' | 'casual' | 'inspiring'
  // model: 'openai' | 'anthropic' | 'gemini' | 'default-free'
}

const prompt = {
  system: "You are a LinkedIn post generator.",
  github_activity: "Added webhook to CI/CD pipeline",
  user_context: "Deployed auto-rollback to production",
  style: "technical"
  // model: "openai" // or "anthropic", "gemini", or "default-free"
}
```

---

## Example Prompt Generation Code
```typescript
const generatePrompt = (activity: string, context: string, style: string) => {
  return `SYSTEM: You are a LinkedIn post generator. Generate professional posts only.
GITHUB_ACTIVITY: ${sanitizeInput(activity)}
USER_CONTEXT: ${sanitizeInput(context)}
STYLE: ${style}

Respond with valid JSON: {"post": "...", "hashtags": ["..."]}`
}
```

---

## Response Handling
- Validate JSON before rendering in UI
- Trim whitespace, enforce char limits
- Show user a clear editing preview
- Handle API errors gracefully
