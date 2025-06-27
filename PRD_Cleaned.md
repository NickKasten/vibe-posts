
# 📄 Product Requirements Document (PRD)

**Product Name:** LinkedPost Agent (Desktop Edition)  
**Owner:** Nicholas Kasten  
**Date:** June 2025  
**Version:** 1.1

---

## 🎯 Objective

Build a secure, local desktop app for developers to generate LinkedIn posts based on:
- Recent GitHub activity (commits, PRs)
- Optional user-provided context (e.g., project highlights)
- A selected writing style (technical, casual, inspiring)

The app allows post preview and editing before manually publishing via LinkedIn, using user-provided API tokens. It prioritizes fast setup, security, and offline capability.

---

## 👥 Target Users

- Developers and technical professionals who:
  - Push code regularly to GitHub
  - Want to summarize work for professional visibility
  - Prefer a cost-free, desktop-native experience

---

## 🔐 Security Features

### Prompt Injection Protection
- Input sanitization for all user-generated content
- Structured prompt formatting
- JSON response schema enforcement
- Output validation and filtering

### Token Handling
- All API tokens encrypted and stored using system keychain
- Tokens never logged or shown in UI
- No cloud storage or remote APIs involved in token processing

---

## 🧠 Core Features (1-Week MVP)

| Feature | Description |
|--------|-------------|
| GitHub OAuth + commit fetch | Authenticate and fetch commit summaries |
| User context input | Optional message or event description |
| AI API integration | Uses provided API key for post generation |
| Inline editor | Editable preview before posting |
| LinkedIn OAuth + posting | Authenticate and publish from desktop |
| Secure local storage | Tokens saved via keyring or secure store |

---

## 🧱 System Architecture

| Layer         | Tech                  |
|---------------|------------------------|
| UI            | Tauri + React (TypeScript) |
| Styling       | TailwindCSS             |
| Backend Logic | Rust + Tauri APIs       |
| API Calls     | `reqwest` (Rust)        |
| Storage       | `keyring` / `tauri-plugin-store` |
| Auth Flow     | GitHub & LinkedIn OAuth |
| AI API        | User-supplied (OpenAI, etc.) |

---

## 📦 Distribution Plan

- **Primary**: GitHub Releases
- **Optional**: Homebrew, Chocolatey, AUR
- Setup guides included in README
- No dependency on cloud-hosted backend

---

## 🧪 MVP Timeline

| Day | Focus |
|-----|-------|
| 1   | GitHub auth + commit fetch |
| 2   | Input validation, UI setup |
| 3-4 | AI prompt gen + editor |
| 5   | LinkedIn auth + preview |
| 6-7 | Manual post + polish |

---

## ✅ Success Criteria

| Area | Metric |
|------|--------|
| Setup | Full onboarding in <10 minutes |
| UX | Post workflow under 2 minutes |
| Performance | Post generated in <10 seconds |
| Security | No token leaks or injection risk |

---

## 🧾 Summary

This MVP delivers a lightweight, secure LinkedIn post generator tailored to developers. It runs fully locally, with user-provided API keys and full control over post editing and publishing. Built with modern desktop tooling for a low-friction, self-contained experience.
