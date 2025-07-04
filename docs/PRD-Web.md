# 📄 Product Requirements Document (PRD)

**Product Name:** "Vibe-Post" LinkedPost Agent (Web Edition)  
**Owner:** Nicholas Kasten  
**Date:** July 2025  
**Version:** 1.2

---

## 🎯 Objective

Build a fast, secure web app that lets developers generate polished LinkedIn posts from:
- Recent GitHub activity (commits, PRs)
- Optional personal context (e.g., what was built or learned)
- A selected writing style (technical, casual, inspiring)

The app provides inline editing and one-click publishing to LinkedIn using user-supplied API tokens. It prioritizes minimal setup, clean UX, and cloud convenience.

---

## 👥 Target Users

- Developers who:
  - Regularly commit code to GitHub
  - Want to increase visibility on LinkedIn
  - Prefer a frictionless, browser-based experience

---

## 🔐 Security Considerations

### Token Handling
- Tokens stored securely using Supabase (or localStorage with encryption)
- Tokens never logged or shared externally
- All sensitive interactions occur client-side or via secured backend endpoints

### Prompt Injection Protection
- Input sanitization
- Structured prompt formatting
- Output validation for hallucinations and safety

---

## 🧠 Core Features (Web MVP)

| Feature | Description |
|--------|-------------|
| GitHub OAuth | Authenticate and fetch latest commits |
| Context Input | Text field for optional user-added context |
| AI Post Generator | Uses OpenAI, Anthropic, or Gemini (user’s API key) to write drafts. If no key is provided, a default free model will be used. |
| Style Selector | Dropdown to choose tone (technical, casual, etc.) |
| Editor | Edit and preview the post |
| LinkedIn OAuth | Authenticate and post directly |
| Token Management | Store API tokens securely in Supabase or browser |

---

## 🧱 System Architecture

| Layer         | Tech Stack                        |
|---------------|------------------------------------|
| UI            | Next.js + TypeScript              |
| Styling       | TailwindCSS + Framer Motion       |
| Auth Flow     | Supabase Auth or Clerk (OAuth)    |
| AI API        | User-supplied OpenAI/Anthropic/Gemini API key (or default free model if none provided)      |
| Storage       | Supabase (or browser localStorage)|
| Backend Logic | Serverless functions (if needed)  |
| Deployment    | Vercel                            |

---

## 🧪 MVP Timeline

| Day | Focus |
|-----|-------|
| 1   | Setup GitHub Auth + fetch commits |
| 2   | Build UI with context input & style selector |
| 3-4 | Add OpenAI API integration + inline editor |
| 5   | LinkedIn Auth + token storage |
| 6-7 | UX polish + deploy to Vercel |

---

## ✅ Success Criteria

| Area | Metric |
|------|--------|
| Setup | Auth and onboarding in <5 minutes |
| UX | Post workflow under 2 minutes |
| Performance | Post generated in <10 seconds |
| Security | No token leaks or unvalidated inputs |
| Engagement | First post published by 70% of users on first session |

---

## 🧾 Summary

This version of *Vibe-Post* offers a rapid, cloud-first way for developers to turn commits into shareable content. It removes desktop setup friction while retaining security and editing control. The web app form accelerates MVP delivery and increases accessibility for users.
