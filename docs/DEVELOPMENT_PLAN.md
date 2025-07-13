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

#### Specific Deliverables:
- [x] Next.js 13+ project initialized with TypeScript, TailwindCSS, and ESLint
- [x] Supabase project created with authentication enabled
- [x] GitHub OAuth app registered and configured
- [x] `user_tokens` table created with RLS policies
- [x] GitHub OAuth flow implemented (`/api/auth/github/*` routes)
- [x] Token encryption functions implemented and tested
- [x] GitHub API client created (`/api/github/activity` endpoint)
- [x] Environment variable validation setup
- [ ] Basic error logging with Sentry integration
- [x] Unit tests for token encryption and GitHub OAuth flow

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

#### Specific Deliverables:
- [x] Input sanitization functions implemented with comprehensive testing
- [ ] Welcome screen component created with responsive design
- [ ] GitHub authentication flow integrated in UI
- [ ] Context input form with character limits (500 chars)
- [ ] Style selector dropdown (Technical, Casual, Inspiring)
- [ ] App routing setup with Next.js 13+ App Router
- [ ] Loading states and error boundaries implemented
- [ ] CORS configuration for API routes
- [x] Unit tests for input sanitization and validation functions

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

#### Specific Deliverables:
- [x] AI prompt template system with structured formatting
- [ ] AI API integration with multiple providers (OpenAI, Anthropic, Gemini)
- [x] JSON response validation with schema enforcement
- [ ] Post editor component with live preview
- [x] Character count display with LinkedIn limit validation (1300 chars)
- [x] Hashtag generation and validation
- [ ] Rate limiting middleware for AI API calls
- [ ] Error handling for AI API failures
- [x] Unit tests for AI response parsing and validation
- [ ] Integration tests for complete post generation workflow

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

#### Specific Deliverables:
- [ ] LinkedIn OAuth app registered and configured
- [ ] LinkedIn OAuth flow implemented (`/api/auth/linkedin/*` routes)
- [ ] LinkedIn API client for profile and posting (`/api/linkedin/*` endpoints)
- [ ] LinkedIn post preview component with accurate formatting
- [ ] Scheduling functionality with date/time picker
- [ ] Post confirmation dialog with preview
- [ ] Post status tracking (draft, scheduled, published)
- [ ] LinkedIn API rate limiting implementation
- [ ] Unit tests for LinkedIn OAuth and API integration
- [ ] Integration tests for complete LinkedIn posting workflow

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

#### Specific Deliverables:
- [ ] Manual and scheduled post publishing functionality
- [ ] Post dashboard with filtering and search
- [ ] Post status management (Draft/Scheduled/Posted/Failed)
- [ ] Post editing and duplication features
- [ ] Responsive design for mobile, tablet, and desktop
- [ ] Accessibility improvements (WCAG 2.1 AA compliance)
- [ ] Performance optimization (Core Web Vitals)
- [ ] Production deployment to Vercel with all environment variables
- [ ] Database migrations applied to production
- [ ] Security audit completed with penetration testing
- [ ] Load testing and performance benchmarking
- [ ] End-to-end testing across all major workflows
- [ ] Documentation updates and deployment guide

#### Post Dashboard Features:
- Filter by status/date
- Edit/duplicate/delete actions
- Search functionality
- Export drafts
- Scheduled post management

---

## 🔐 Security Checklist

### Input Security:
- [x] All user inputs sanitized before AI processing
- [x] Prompt injection protection implemented
- [x] Character limits enforced (500 chars user input, 1300 chars post)
- [x] Structured prompt templates prevent manipulation

### Token Security:
- [x] All tokens encrypted in Supabase database
- [x] No tokens logged or displayed in UI
- [x] Minimal OAuth scopes requested
- [ ] Token refresh handling implemented

### Network Security:
- [ ] HTTPS enforced for all external requests
- [ ] TLS certificate validation enabled
- [x] No sensitive data in request logs
- [ ] Rate limiting for API calls

### Output Security:
- [x] AI responses validated against JSON schema
- [x] Content filtering for suspicious outputs
- [x] Error sanitization before user display
- [x] No executable content in posts

---

## 🧪 Testing Strategy

### Unit Tests:
- [x] Input sanitization functions
- [x] Token encryption/decryption
- [x] AI response validation
- [x] OAuth flow components
### Specific Unit Tests Required:
- Token encryption/decryption functions
- Input sanitization against prompt injection
- OAuth callback validation
- AI response parsing and validation
- Rate limiting middleware
- Session management functions

### Integration Tests:
- GitHub API integration
- LinkedIn API integration
- End-to-end post workflow
- Error handling scenarios
### Specific Integration Tests Required:
- Complete GitHub OAuth flow (success/failure scenarios)
- Complete LinkedIn OAuth flow (success/failure scenarios)
- End-to-end post creation workflow
- AI API integration with fallback handling
- Database operations with RLS policies
- Error handling across all API endpoints

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

### Deployment Checklist:
- [ ] All environment variables configured in Vercel
- [ ] Supabase database migrations applied
- [ ] GitHub OAuth app configured with production URLs
- [ ] LinkedIn OAuth app configured with production URLs
- [ ] Domain DNS configured (if using custom domain)
- [ ] SSL certificates verified
- [ ] Error monitoring (Sentry) configured
- [ ] Analytics tracking enabled
- [ ] Rate limiting middleware tested
- [ ] Database RLS policies tested
- [ ] Backup and recovery procedures documented

### Environment-Specific Configurations:

#### Development
- `NEXT_PUBLIC_APP_URL=http://localhost:3000`
- `NODE_ENV=development`
- `LOG_LEVEL=debug`

#### Staging
- `NEXT_PUBLIC_APP_URL=https://staging-your-domain.vercel.app`
- `NODE_ENV=production`
- `LOG_LEVEL=info`

#### Production
- `NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app`
- `NODE_ENV=production`
- `LOG_LEVEL=error`

### Rollback Procedures:
1. **Immediate Rollback:** Use Vercel dashboard to revert to previous deployment
2. **Database Rollback:** Run migration rollback scripts if needed
3. **Monitoring:** Check error rates and user metrics post-deployment
4. **Communication:** Update status page and notify users if necessary

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
- AI API (user-provided OpenAI/Anthropic/Gemini key)

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