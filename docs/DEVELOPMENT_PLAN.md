# 🚀 Development Plan - LinkedPost Agent Web App

**Project:** Vibe-Post LinkedPost Agent (Web Edition)  
**Timeline:** 7-Day MVP Sprint  
**Architecture:** Next.js + TypeScript + Supabase  
**Security:** Cloud-first with encrypted token storage

---

## 📋 Executive Summary

This plan outlines the 7-day development sprint to build a secure, web-based LinkedIn post generator for developers. The app will fetch GitHub activity, use AI to generate professional posts, and enable secure publishing through LinkedIn's API with cloud convenience.

---

## 🏗️ Project Setup & Architecture

### Core Stack
- **Frontend:** Next.js 13+ + TypeScript + TailwindCSS
- **Backend:** Next.js API Routes + Serverless Functions
- **Storage:** Supabase PostgreSQL with AES-256 encrypted token storage
- **Auth:** Supabase Auth for GitHub and LinkedIn OAuth flows
- **Deployment:** Vercel

### Project Structure
```
src/
├── app/                     # Next.js 13+ app directory
│   ├── api/                 # API routes
│   │   ├── github/          # GitHub API integration
│   │   ├── linkedin/        # LinkedIn API integration
│   │   └── ai/              # AI prompt generation
│   ├── auth/                # Auth callback pages
│   ├── dashboard/           # Post library/dashboard
│   └── globals.css          # Global styles
├── components/              # React components
├── hooks/                   # Custom React hooks
├── lib/                     # Utilities and configurations
├── types/                   # TypeScript interfaces
└── utils/                   # Helper functions
```

---

## 📅 7-Day Sprint Breakdown

### Day 1: Foundation & GitHub Integration
**Goal:** Set up project structure and implement GitHub authentication

#### Tasks:
- [ ] Initialize Next.js project with TypeScript and TailwindCSS
- [ ] Configure Supabase project and authentication
- [ ] Implement GitHub OAuth flow
- [ ] Set up secure token storage in Supabase
- [ ] Create GitHub API routes for commit fetching
- [ ] Basic error handling and logging setup

#### Key Files:
- `src/app/api/auth/github/route.ts`
- `src/app/api/github/activity/route.ts`
- `src/lib/supabase.ts`

#### Security Implementation:
```typescript
// Token encryption and storage
import { createClient } from '@supabase/supabase-js'

export const storeGitHubToken = async (userId: string, token: string) => {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  )
  
  const { error } = await supabase
    .from('user_tokens')
    .upsert({
      user_id: userId,
      provider: 'github',
      encrypted_token: encrypt(token)
    })
  
  if (error) throw error
}
```

---

### Day 2: Input Validation & UI Setup
**Goal:** Implement security measures and create core UI components

#### Tasks:
- [ ] Build input sanitization system (anti-prompt injection)
- [ ] Create Welcome Screen with GitHub auth flow
- [ ] Design context input interface for user-added context
- [ ] Implement character limits and validation
- [ ] Set up app routing and navigation

#### Security Implementation:
```typescript
// Input sanitization
export const sanitizeUserInput = (input: string): string => {
  return input
    .replace(/```/g, '')
    .replace(/System:/g, '')
    .replace(/Assistant:/g, '')
    .replace(/[^\w\s.,!?-_()[\]{}]/g, '')
    .slice(0, 500)
}
```

#### UI Components:
- Welcome screen with "Tell My Story" CTA
- GitHub consent and auth flow
- Context input form with style selector

---

### Day 3-4: AI Integration & Post Generation
**Goal:** Implement AI prompt generation and response handling

#### Tasks:
- [ ] Create structured prompt template system
- [ ] Implement AI API integration (user-provided OpenAI/Anthropic/Gemini key or Groq Llama 3.1 free tier as fallback)
- [ ] Build JSON response validation
- [ ] Create post editor with live preview
- [ ] Add tone selection (Technical, Casual, Inspiring)
- [ ] Implement character count and LinkedIn formatting

#### AI Prompt Template:
```typescript
const generatePrompt = (activity: string, context: string, style: string) => {
  return `SYSTEM: You are a LinkedIn post generator. Generate professional posts only.
GITHUB_ACTIVITY: ${sanitizeUserInput(activity)}
USER_CONTEXT: ${sanitizeUserInput(context)}
STYLE: ${style}

Respond with valid JSON: {"post": "...", "hashtags": ["..."]}`
}
```

#### Response Validation:
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

---

### Day 5: LinkedIn Integration
**Goal:** Implement LinkedIn OAuth and post preview functionality

#### Tasks:
- [ ] Set up LinkedIn OAuth flow with callback handling
- [ ] Create LinkedIn API routes for posting
- [ ] Implement LinkedIn API client for posting
- [ ] Build post preview with LinkedIn formatting
- [ ] Add scheduling functionality (date/time picker)
- [ ] Create confirmation dialog before posting

#### LinkedIn OAuth Implementation:
```typescript
// LinkedIn OAuth callback handler
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  
  if (!code || !state) {
    return Response.json({ error: 'Missing code or state' }, { status: 400 })
  }
  
  // Exchange code for access token
  const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.LINKEDIN_REDIRECT_URI!,
      client_id: process.env.LINKEDIN_CLIENT_ID!,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET!
    })
  })
  
  const tokens = await tokenResponse.json()
  // Store tokens securely and redirect
}
```

---

### Day 6-7: Publishing & Polish
**Goal:** Complete post workflow and add final polish

#### Tasks:
- [ ] Implement manual and scheduled post publishing to LinkedIn
- [ ] Create post dashboard for drafts and published posts
- [ ] Add post status tracking (Draft/Scheduled/Posted)
- [ ] Implement post editing and duplication
- [ ] Add responsive design and accessibility
- [ ] Deploy to Vercel with environment variables
- [ ] Final security audit and testing

#### Post Dashboard Features:
- Filter by status/date
- Edit/duplicate/delete actions
- Search functionality
- Export drafts
- Scheduled post management

---

## 🔐 Security Checklist

### Input Security:
- [ ] All user inputs sanitized before AI processing
- [ ] Prompt injection protection implemented
- [ ] Character limits enforced (500 chars user input, 1300 chars post)
- [ ] Structured prompt templates prevent manipulation

### Token Security:
- [ ] All tokens encrypted in Supabase database
- [ ] No tokens logged or displayed in UI
- [ ] Minimal OAuth scopes requested
- [ ] Token refresh handling implemented

### Network Security:
- [ ] HTTPS enforced for all external requests
- [ ] TLS certificate validation enabled
- [ ] No sensitive data in request logs
- [ ] Rate limiting for API calls

### Output Security:
- [ ] AI responses validated against JSON schema
- [ ] Content filtering for suspicious outputs
- [ ] Error sanitization before user display
- [ ] No executable content in posts

---

## 🧪 Testing Strategy

### Unit Tests:
- Input sanitization functions
- Token encryption/decryption
- AI response validation
- OAuth flow components

### Integration Tests:
- GitHub API integration
- LinkedIn API integration
- End-to-end post workflow
- Error handling scenarios

### Security Tests:
- Prompt injection attempts
- Token leakage scenarios
- Network security validation
- Input boundary testing

---

## 📦 Deployment & Distribution

### Build Process:
```bash
# Development
npm run dev

# Production build
npm run build

# Deploy to Vercel
vercel --prod
```

### Distribution Channels:
1. **Primary:** Vercel deployment with custom domain
2. **Secondary:** GitHub Pages for documentation
3. **Documentation:** README with setup guides

---

## ✅ Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Setup Time | < 5 minutes | First post completion |
| Workflow Speed | < 2 minutes | Draft to publish |
| AI Response Time | < 10 seconds | Prompt to generated post |
| Security Score | Zero violations | Security audit results |
| User Satisfaction | > 90% positive | Beta user feedback |

---

## 🔄 Post-MVP Roadmap

### Groq Llama 3.1 Free Tier Details:
- **Model:** Llama 3.1 70B Instruct
- **Rate Limit:** 30 requests/minute, 6000 requests/day
- **Context Length:** 128k tokens
- **Cost:** Free tier available
- **Fallback Strategy:** When user has no API key, use Groq with rate limiting UI

### Phase 2 Features:
- Multi-platform templates (Twitter, Medium)
- Team collaboration features
- Analytics and post performance tracking
- Custom AI model fine-tuning
- Browser extension companion

### Technical Debt:
- Comprehensive error recovery
- Offline mode improvements
- Performance optimizations
- Accessibility enhancements

---

## Error Logging & Monitoring
- Integrate error/event logging (auth failures, AI errors, post API errors).
- Use Vercel logs, Sentry, or LogRocket.
- Add env variables: `LOG_LEVEL`, `SENTRY_DSN`.

## Rate Limiting
- Implement throttling for OpenAI/LinkedIn API calls to avoid token issues or bans.

## Analytics
- Track basic usage metrics (e.g., Vercel Analytics, Plausible).

## Day 6: Testing & QA
- Test mobile responsiveness across devices and browsers.

## Post-MVP Enhancements
- AI Prompt History: Users can view/reuse past prompts.
- Export as Markdown: Allow exporting posts for external editing.
- LinkedIn Card Preview: Show accurate preview for trust/UX.

---

## 📚 Resources & Dependencies

### Required APIs:
- GitHub API (OAuth)
- LinkedIn API (OAuth + Publishing)
- AI API (user-provided OpenAI/Anthropic/Gemini key or Groq Llama 3.1 free tier as fallback)

### Environment Variables:
```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
LINKEDIN_REDIRECT_URI=https://your-app.vercel.app/api/auth/linkedin/callback

# AI APIs (Groq free tier for fallback)
GROQ_API_KEY=your-groq-key

# Encryption
ENCRYPTION_KEY=your-32-byte-encryption-key
```

### Development Tools:
- Node.js (18+)
- Next.js CLI
- Supabase CLI
- Vercel CLI
- GitHub OAuth App registration
- LinkedIn Developer App registration

---

*This plan ensures a secure, user-friendly web application that respects developer privacy while providing powerful LinkedIn content generation capabilities.* 