
# 🛠 DEVELOPER_GUIDE.md

## Overview

This guide provides implementation notes for building and extending the LinkedPost Agent desktop app. It assumes you're using Tauri + React + Rust.

---

## OAuth Integration

### GitHub Device Flow
Use `oauth2` crate for GitHub auth:
```rust
let client = BasicClient::new(
    ClientId::new(GITHUB_CLIENT_ID),
    Some(ClientSecret::new(GITHUB_CLIENT_SECRET)),
    AuthUrl::new("https://github.com/login/device/code").unwrap(),
    Some(TokenUrl::new("https://github.com/login/oauth/access_token").unwrap())
);
```

### LinkedIn PKCE Flow
Implement local redirect with embedded server:
- Start auth in browser
- Redirect to `http://localhost:PORT/callback`
- Handle response and exchange code for token

---

## GitHub API Fetching
Use personal access token (PAT) or OAuth to fetch activity:
```rust
GET /repos/:owner/:repo/commits
Authorization: Bearer <token>
```

---

## AI Prompt Example
```json
{
  "system": "You are a LinkedIn post generator.",
  "github_activity": "Added webhook to CI/CD pipeline",
  "user_context": "Deployed auto-rollback to production",
  "style": "technical"
}
```

---

## Example Prompt Generation Code
```rust
let prompt = format!(
    "SYSTEM: You are a LinkedIn post generator. Generate professional posts only.\n    GITHUB_ACTIVITY: {}\nUSER_CONTEXT: {}\nSTYLE: {}\n    Respond with valid JSON: {{\"post\": \"...\", \"hashtags\": [\"...\"]}}",
    activity, context, style
);
```

---

## Response Handling
- Validate JSON before rendering in UI
- Trim whitespace, enforce char limits
- Show user a clear editing preview

