
# 🔐 SECURITY.md

## Overview

This guide outlines the core security principles implemented in the LinkedPost Agent desktop app. It includes token handling, prompt injection protection, and response validation.

---

## Token Handling

All third-party tokens (GitHub, LinkedIn, AI APIs) are:

- Encrypted using the system keychain (`keyring` or `tauri-plugin-store`)
- Never logged, displayed, or transmitted externally
- Scoped with minimum necessary permissions

---

## Prompt Injection Protection

To prevent malicious inputs from manipulating the AI:

### ✅ Input Sanitization Example (Rust)
```rust
fn sanitize_user_input(input: &str) -> String {
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

### ✅ Structured Prompt Template

All prompts sent to the AI use a strict format:
```
SYSTEM: You are a LinkedIn post generator. Generate professional posts only.

GITHUB_ACTIVITY: [sanitized commit data]
USER_CONTEXT: [sanitized user input - max 500 chars]
STYLE: [predefined enum: technical|casual|inspiring]

Respond with valid JSON: {"post": "content", "hashtags": ["tag1", "tag2"]}
```

---

## Output Validation

To ensure AI responses are safe:

- All responses must match a JSON schema:
  ```json
  {
    "post": "string (max 1300 chars)",
    "hashtags": ["string", "string"]
  }
  ```
- Content filters flag suspicious responses
- Errors or invalid outputs are logged but sanitized

---

## HTTPS Enforcement

All external requests (GitHub, LinkedIn, AI APIs) use HTTPS. TLS certificate validation is enforced.

