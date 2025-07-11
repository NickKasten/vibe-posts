
# 🔐 SECURITY.md

## Overview

This guide outlines the core security principles implemented in the LinkedPost Agent web app. It includes token handling, prompt injection protection, and response validation.

---

## Token Handling

All third-party tokens (GitHub, LinkedIn, AI APIs) are:

- Encrypted and stored in Supabase database with row-level security
- Never logged, displayed, or transmitted externally
- Scoped with minimum necessary permissions
- User-provided OpenAI, Anthropic, or Gemini API keys encrypted and stored in Supabase database. If no key is provided, a default free model is used.

---

## Token Expiration & Refresh Flow
- Access tokens have a limited lifetime; implement refresh token flow to maintain sessions securely.
- On token expiration, prompt user to re-authenticate or use refresh token to obtain a new access token.
- Store refresh tokens securely (httpOnly cookies or secure storage).

---

## Prompt Injection Protection

To prevent malicious inputs from manipulating the AI:

### ✅ Input Sanitization Example (TypeScript)
```typescript
export const sanitizeUserInput = (input: string): string => {
  return input
    .replace(/```/g, '')
    .replace(/System:/g, '')
    .replace(/Assistant:/g, '')
    .replace(/[^\w\s.,!?-_()[\]{}]/g, '')
    .slice(0, 500)
}
```

### ✅ Structured Prompt Template

All prompts sent to the AI use a strict format:
```typescript
const generatePrompt = (activity: string, context: string, style: string) => {
  return `SYSTEM: You are a LinkedIn post generator. Generate professional posts only.

GITHUB_ACTIVITY: ${sanitizeUserInput(activity)}
USER_CONTEXT: ${sanitizeUserInput(context)}
STYLE: ${style}

Respond with valid JSON: {"post": "content", "hashtags": ["tag1", "tag2"]}`
}
```

---

## Output Validation

To ensure AI responses are safe:

- All responses must match a JSON schema:
  ```typescript
  interface AIResponse {
    post: string      // max 1300 chars
    hashtags: string[]
  }
  
  const validateAIResponse = (response: any): AIResponse => {
    if (!response.post || typeof response.post !== 'string') {
      throw new Error('Invalid post content')
    }
    if (response.post.length > 1300) {
      throw new Error('Post exceeds character limit')
    }
    return response as AIResponse
  }
  ```
- Content filters flag suspicious responses
- Errors or invalid outputs are logged but sanitized

---

## HTTPS Enforcement

All external requests (GitHub, LinkedIn, AI APIs) use HTTPS. TLS certificate validation is enforced in production deployment.

---

## Rate Limiting

### API Rate Limits
- **GitHub API:** 5000 requests/hour per authenticated user
- **LinkedIn API:** 500 requests/day per user (publishing), 100 requests/hour (profile data)
- **AI API:** Varies by provider
  - OpenAI: 90,000 tokens/minute (varies by tier)
  - Anthropic: 4,000 requests/minute (varies by tier)

### Client-Side Rate Limiting
```typescript
// Rate limiting middleware
export const rateLimitMiddleware = {
  github: { max: 10, window: '1m' },
  linkedin: { max: 5, window: '1m' },
  ai: { max: 20, window: '1m' }
}
```

---

## CORS Configuration

### Allowed Origins
- Production: `https://your-domain.vercel.app`
- Development: `http://localhost:3000`
- Staging: `https://staging-your-domain.vercel.app`

### CORS Headers
```typescript
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.vercel.app']
    : ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
}
```

---

## Session Management Security

### Session Configuration
- **Duration:** 1 hour of inactivity
- **Storage:** Encrypted session tokens in Supabase
- **Refresh:** Automatic token refresh before expiry
- **Logout:** Immediate token invalidation

### Session Security Implementation
```typescript
// Session validation middleware
export const validateSession = async (req: NextRequest) => {
  const sessionToken = req.cookies.get('session-token')?.value
  
  if (!sessionToken) {
    return new Response('Unauthorized', { status: 401 })
  }
  
  const session = await validateSessionToken(sessionToken)
  if (!session || session.expires_at < new Date()) {
    return new Response('Session expired', { status: 401 })
  }
  
  return session
}
```

---

## Database Security

### Row-Level Security (RLS)
```sql
-- Enable RLS on user_tokens table
ALTER TABLE user_tokens ENABLE ROW LEVEL SECURITY;

-- Users can only access their own tokens
CREATE POLICY "Users can only access their own tokens" ON user_tokens
  FOR ALL USING (auth.uid() = user_id);

-- Admins can access all tokens (for debugging)
CREATE POLICY "Admins can access all tokens" ON user_tokens
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
```

### Token Encryption
```typescript
import crypto from 'crypto'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY! // 32 bytes
const ALGORITHM = 'aes-256-gcm'

export const encryptToken = (token: string): string => {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY)
  cipher.setAAD(Buffer.from('token-encryption'))
  
  let encrypted = cipher.update(token, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  const authTag = cipher.getAuthTag()
  return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`
}

export const decryptToken = (encryptedToken: string): string => {
  const [iv, encrypted, authTag] = encryptedToken.split(':')
  const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY)
  
  decipher.setAAD(Buffer.from('token-encryption'))
  decipher.setAuthTag(Buffer.from(authTag, 'hex'))
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}
```

