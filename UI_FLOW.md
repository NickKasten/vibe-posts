
# 🧭 UI_FLOW.md – First-Time User Flow (Vibe-Post Desktop App)

## 🎯 Goal
Guide the user through a conversational, assistant-led onboarding experience that collects context, drafts a post, allows editing, and publishes (or schedules) it to LinkedIn.

---

## 🔄 High-Level Flow

```
Welcome Screen
   ↓
GitHub Activity Scan Consent
   ↓
AI-led Adaptive Q&A (3–5 questions)
   ↓
Live Post Draft + Editing Assistant
   ↓
LinkedIn Auth + Post/Schedule
   ↓
Personal Dashboard (Post Library)
```

---

## 🖥️ 1. Welcome Screen

**Text:**
> _“The new way to keep up with and share your career.”_

**CTA:**
- Button: `Tell My Story →`
- Keyboard: `Enter` key listener

---

## 🔐 2. GitHub Activity Scan Prompt

**Text:**
> “Want me to take a quick look at your GitHub activity from this week to help you get started?”

**Options:**
- `Yes, analyze my activity`
- `Skip, I’ll tell you myself`

**If Yes →**
- Trigger GitHub API scan
- Extract meaningful commit messages (filter noise)

---

## 🤖 3. AI-Led Adaptive Questions (Max 5)

### If GitHub data found:
**AI opens with:**
> “Looks like you pushed a big update to `vibe-agent` and merged a CI fix. What was that about?”

### If no data or skipped:
> “What’s something you worked on or learned this week?”

### Follow-ups (conditional):
1. “Did you work with anyone you'd like to highlight?”
2. “Any big decisions, launches, or lessons?”
3. “Where did this work happen — at a company, project, school?”
4. “Anything you’d like people to take away from this?”

Allow user to:
- Type directly
- Skip any question
- See running context building on side

---

## 📝 4. Post Draft + Editor Assistant

**Layout:**
- Left: Editable LinkedIn post
- Right: Agent chat (Q&A with LLM)
- Toolbar: Tone dropdown (Technical, Inspiring, Casual), Character count

**Agent prompt:**
> “Here’s a draft based on what you told me. Feel free to make edits or ask me to reword anything.”

User can:
- Type directly in the draft
- Ask agent to rephrase, expand, shorten, or stylize

---

## 🔗 5. Post Confirmation + LinkedIn Auth

**CTA:**
- `Share My Story →`

**Flow:**
- Redirect to LinkedIn OAuth (PKCE)
- On success:
    - Ask: “Post now or schedule for later?”
    - Schedule option: simple date/time picker

---

## 🏠 6. Personal Dashboard (Post Library)

**Content:**
- List of previous drafts/posts
- Status tags: Draft / Scheduled / Posted
- Options: View / Edit / Duplicate / Delete
- Filter by tag or date

---

## 🔐 Security Reminders

- All data stays local
- No posting happens without approval
- Tokens are stored securely via system keychain

---

## ✅ MVP UI Success Criteria

- Complete flow in < 2 minutes
- All screens navigable by keyboard or mouse
- AI uses GitHub data intelligently if available
- Draft is editable with AI assistance
- No content is posted without user review and sign-in
