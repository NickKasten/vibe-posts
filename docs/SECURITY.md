
# 🔐 SECURITY.md

## Overview

This guide outlines the core security principles implemented in the LinkedPost Agent web app. It includes token handling, prompt injection protection, and response validation.

---

## Token Handling

All third-party tokens (GitHub, LinkedIn, AI APIs) are:

- Encrypted and stored in Supabase database with row-level security
- Never logged, displayed, or transmitted externally
- Scoped with minimum necessary permissions
- User-provided OpenAI, Anthropic, or Gemini API keys stored securely or in encrypted localStorage. If no key is provided, a default free model is used.

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

