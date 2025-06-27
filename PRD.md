# 📄 Product Requirements Document (PRD)

**Product Name:** LinkedPost Agent (Desktop Edition)  
**Owner:** Nicholas Kasten  
**Date:** June 2025  
**Version:** 1.0

---

## 🎯 Objective

Build a secure, offline-capable **desktop app** that helps users create personalized LinkedIn posts based on:
- Recent GitHub activity (commits, PRs)
- Optional user-provided context (event highlights, milestones)
- A specified stylistic tone (e.g., technical, casual, inspiring)

The application previews posts and, upon approval, publishes them to LinkedIn using the user's authenticated account.

---

## 👥 Target Users

- Developers, founders, and engineers who:
  - Regularly push code or updates to GitHub
  - Want to share meaningful updates on LinkedIn without the friction
  - Prefer a desktop-native experience over cloud apps

---

## 🧠 Core Features

| Feature | Description |
|--------|-------------|
| **GitHub Integration** | Authenticates user with GitHub and fetches recent commit/PR history |
| **LinkedIn Integration** | Authenticates user with LinkedIn and posts on their behalf securely |
| **Style Configuration** | User can define preferred tone, post length, and hashtag usage |
| **Event Context Input** | Freeform text input describing recent activities or announcements |
| **AI-Powered Post Generator** | Synthesizes post content from GitHub activity + context + style using a configurable AI API |
| **Post Preview & Approval** | User reviews and approves the generated post before publishing |
| **Local Scheduling** | User can schedule weekly generation tasks locally (e.g., every Friday at 12pm) |
| **Secure Local Storage** | OAuth tokens and settings stored securely on device using system keychain |

---

## 🧱 System Architecture

### **Frontend/UI Layer**
- Built with **Tauri** and **React (TypeScript)**
- Cross-platform compatibility (macOS, Windows, Linux)
- Handles user interaction, settings, and preview workflows

### **Backend Logic (Local)**
- Written in **Rust**, integrated via Tauri
- Handles GitHub/LinkedIn API requests, token encryption, post generation scheduling

### **AI Integration Layer**
- Calls to an **unspecified AI API** for post generation
- API should accept structured input (GitHub activity + user context + tone) and return post text
- Key is stored securely and not exposed to UI

### **Scheduling Layer**
- Uses a local task scheduler (e.g., `tokio_cron_scheduler` in Rust)
- Triggers post generation jobs at user-defined intervals

### **Token Security**
- Uses `keyring` or Tauri secure storage plugin to store OAuth tokens encrypted
- Never writes tokens to plain files or logs
- Auto-refreshes LinkedIn tokens if needed

---

## 🔐 Authentication

| Provider | Method |
|----------|--------|
| **GitHub** | OAuth 2.0 Device Flow or Browser Redirect |
| **LinkedIn** | OAuth 2.0 PKCE Flow with Localhost or Custom URI Redirect |

Token data is never exposed to the UI or saved in plain text.

---

## 📦 Data Storage

| Data | Storage Method |
|------|----------------|
| OAuth Tokens | Encrypted via system keychain or Tauri store |
| Preferences | Encrypted or saved in local config file |
| Post History | Local JSON or lightweight local DB (optional) |

---

## 🚀 MVP Scope (1 Week)

### Included:
- GitHub + LinkedIn OAuth login
- GitHub commit history fetch
- Style/context input UI
- AI post generation
- Post preview + manual LinkedIn post
- Secure token storage

### Deferred:
- Auto-post scheduling
- Token refresh logic
- Post history log
- Multi-user support

---

## 🧪 Future Enhancements

- Auto-scheduling with background daemon
- Email/slack preview notifications
- Webhook-based GitHub triggers
- Multi-style templates
- Post performance tracking (LinkedIn insights)

---

## 🧩 Recommended Tech Stack

| Layer            | Tech                          |
|------------------|-------------------------------|
| UI               | React (TypeScript)            |
| Desktop shell    | Tauri                         |
| Core logic       | Rust                          |
| OAuth            | `oauth2` crate + local redirect handler |
| Token storage    | `tauri-plugin-store` or `keyring` |
| Scheduling       | `tokio_cron_scheduler`        |
| AI Integration   | Unspecified AI API (via HTTPS from backend) |

---

## 🧾 Summary

A secure, cross-platform, LLM-assisted LinkedIn post assistant that runs entirely on the user’s machine, with no plaintext tokens, limited online dependencies, and full user control of style and timing.

