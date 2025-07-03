# 🚀 Development Plan - LinkedPost Agent Desktop App

**Project:** Vibe-Post LinkedPost Agent (Desktop Edition)  
**Timeline:** 7-Day MVP Sprint  
**Architecture:** Tauri + React (TypeScript) + Rust Backend  
**Security:** Local-first with encrypted token storage

---

## 📋 Executive Summary

This plan outlines the 7-day development sprint to build a secure, desktop-native LinkedIn post generator for developers. The app will fetch GitHub activity, use AI to generate professional posts, and enable secure publishing through LinkedIn's API.

---

## 🏗️ Project Setup & Architecture

### Core Stack
- **Frontend:** React 18 + TypeScript + TailwindCSS
- **Backend:** Rust + Tauri v1.x
- **Storage:** `tauri-plugin-store` + `keyring` for secure token storage
- **HTTP Client:** `reqwest` with TLS enforcement
- **OAuth:** `oauth2` crate for GitHub/LinkedIn flows

### Project Structure
```
src-tauri/
├── src/
│   ├── main.rs              # Tauri app entry
│   ├── auth/                # OAuth handlers
│   ├── github/              # GitHub API integration
│   ├── linkedin/            # LinkedIn API integration
│   ├── ai/                  # AI prompt generation
│   ├── security/            # Input sanitization
│   └── storage/             # Secure token management
src/
├── components/              # React components
├── pages/                   # App screens (Welcome, Draft, etc.)
├── hooks/                   # Custom React hooks
├── types/                   # TypeScript interfaces
└── utils/                   # Frontend utilities
```

---

## 📅 7-Day Sprint Breakdown

### Day 1: Foundation & GitHub Integration
**Goal:** Set up project structure and implement GitHub authentication

#### Tasks:
- [ ] Initialize Tauri + React project with TypeScript
- [ ] Configure TailwindCSS and basic UI framework
- [ ] Implement GitHub Device Flow OAuth
- [ ] Set up secure token storage using `keyring`
- [ ] Create GitHub API client for commit fetching
- [ ] Basic error handling and logging setup

#### Key Files:
- `src-tauri/src/auth/github.rs`
- `src-tauri/src/github/api.rs`
- `src-tauri/src/storage/tokens.rs`

#### Security Implementation:
```rust
// Token encryption and storage
use keyring::Entry;

pub fn store_github_token(token: &str) -> Result<(), Box<dyn std::error::Error>> {
    let entry = Entry::new("vibe-post", "github_token")?;
    entry.set_password(token)?;
    Ok(())
}
```

---

### Day 2: Input Validation & UI Setup
**Goal:** Implement security measures and create core UI components

#### Tasks:
- [ ] Build input sanitization system (anti-prompt injection)
- [ ] Create Welcome Screen with GitHub auth flow
- [ ] Design Q&A interface for user context collection
- [ ] Implement character limits and validation
- [ ] Set up routing between screens

#### Security Implementation:
```rust
// Input sanitization
pub fn sanitize_user_input(input: &str) -> String {
    input
        .replace("```", "")
        .replace("System:", "")
        .replace("Assistant:", "")
        .chars()
        .filter(|c| c.is_alphanumeric() || " .,!?-_()[]{}".contains(*c))
        .take(500)
        .collect()
}
```

#### UI Components:
- Welcome screen with "Tell My Story" CTA
- GitHub consent prompt
- Adaptive Q&A interface

---

### Day 3-4: AI Integration & Post Generation
**Goal:** Implement AI prompt generation and response handling

#### Tasks:
- [ ] Create structured prompt template system
- [ ] Implement AI API integration (OpenAI/user-provided)
- [ ] Build JSON response validation
- [ ] Create post editor with live preview
- [ ] Add tone selection (Technical, Casual, Inspiring)
- [ ] Implement character count and LinkedIn formatting

#### AI Prompt Template:
```rust
let prompt = format!(
    "SYSTEM: You are a LinkedIn post generator. Generate professional posts only.\n\
    GITHUB_ACTIVITY: {}\n\
    USER_CONTEXT: {}\n\
    STYLE: {}\n\n\
    Respond with valid JSON: {{\"post\": \"...\", \"hashtags\": [\"...\"]}}",
    sanitize_user_input(&activity),
    sanitize_user_input(&context),
    style // enum: technical|casual|inspiring
);
```

#### Response Validation:
```rust
#[derive(Deserialize)]
struct AIResponse {
    post: String,     // max 1300 chars
    hashtags: Vec<String>,
}
```

---

### Day 5: LinkedIn Integration
**Goal:** Implement LinkedIn OAuth and post preview functionality

#### Tasks:
- [ ] Set up LinkedIn PKCE OAuth flow
- [ ] Create local callback server for auth redirect
- [ ] Implement LinkedIn API client for posting
- [ ] Build post preview with LinkedIn formatting
- [ ] Add scheduling functionality (date/time picker)
- [ ] Create confirmation dialog before posting

#### LinkedIn OAuth Implementation:
```rust
// PKCE flow with local server
use warp::Filter;

async fn start_oauth_server() -> Result<String, Box<dyn std::error::Error>> {
    let callback = warp::path("callback")
        .and(warp::query::<HashMap<String, String>>())
        .map(|params: HashMap<String, String>| {
            // Handle OAuth callback
            warp::reply::html("Authorization successful. You can close this window.")
        });
    
    warp::serve(callback)
        .run(([127, 0, 0, 1], 8080))
        .await;
        
    Ok("success".to_string())
}
```

---

### Day 6-7: Manual Publishing & Polish
**Goal:** Complete post workflow and add final polish

#### Tasks:
- [ ] Implement manual post publishing to LinkedIn
- [ ] Create post library/dashboard for drafts
- [ ] Add post status tracking (Draft/Scheduled/Posted)
- [ ] Implement post editing and duplication
- [ ] Add keyboard shortcuts and accessibility
- [ ] Final security audit and testing
- [ ] Create user documentation

#### Post Library Features:
- Filter by status/date
- Edit/duplicate/delete actions
- Search functionality
- Export drafts

---

## 🔐 Security Checklist

### Input Security:
- [ ] All user inputs sanitized before AI processing
- [ ] Prompt injection protection implemented
- [ ] Character limits enforced (500 chars user input, 1300 chars post)
- [ ] Structured prompt templates prevent manipulation

### Token Security:
- [ ] All tokens encrypted in system keychain
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
npm run tauri dev

# Production build
npm run tauri build

# Generate app bundles for macOS/Windows/Linux
```

### Distribution Channels:
1. **Primary:** GitHub Releases with signed binaries
2. **Secondary:** Package managers (Homebrew, Chocolatey)
3. **Documentation:** README with setup guides

---

## ✅ Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Setup Time | < 10 minutes | First post completion |
| Workflow Speed | < 2 minutes | Draft to publish |
| AI Response Time | < 10 seconds | Prompt to generated post |
| Security Score | Zero violations | Security audit results |
| User Satisfaction | > 90% positive | Beta user feedback |

---

## 🔄 Post-MVP Roadmap

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

## 📚 Resources & Dependencies

### Required APIs:
- GitHub API (Personal Access Token or OAuth)
- LinkedIn API (OAuth + Publishing)
- AI API (OpenAI/Anthropic/user-provided)

### Development Tools:
- Rust toolchain (1.70+)
- Node.js (18+)
- Tauri CLI
- GitHub OAuth App registration
- LinkedIn Developer App registration

---

*This plan ensures a secure, user-friendly desktop application that respects developer privacy while providing powerful LinkedIn content generation capabilities.* 