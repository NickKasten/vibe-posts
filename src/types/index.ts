export interface GitHubActivity {
  id: string
  type: string
  repo: string
  message: string
  timestamp: string
  url: string
}

export interface PostStyle {
  id: string
  name: string
  description: string
}

export interface AIResponse {
  post: string
  hashtags: string[]
}

export interface UserProfile {
  id: string
  github_username: string
  linkedin_connected: boolean
  preferred_style: string
  ai_provider: string
  api_key_configured: boolean
}

export interface PostDraft {
  id: string
  content: string
  hashtags: string[]
  style: string
  created_at: string
  scheduled_for?: string
  published: boolean
}