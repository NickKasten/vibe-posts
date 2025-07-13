-- Vibe Posts Supabase Schema
-- This file contains the complete database schema for the Vibe Posts application

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Tokens Table
-- Stores encrypted OAuth tokens for various providers (GitHub, LinkedIn, AI providers)
CREATE TABLE IF NOT EXISTS user_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- GitHub user ID (as string) or other provider user ID
  provider VARCHAR(50) NOT NULL, -- 'github', 'linkedin', 'openai', 'anthropic', 'gemini'
  encrypted_token TEXT NOT NULL, -- AES-256 encrypted access token
  refresh_token TEXT, -- Encrypted refresh token (if applicable)
  github_user_id BIGINT, -- Original GitHub user ID as integer (for GitHub provider)
  expires_at TIMESTAMPTZ, -- Token expiration timestamp
  scopes TEXT[], -- Array of OAuth scopes granted
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider) -- One token per user per provider
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_tokens_user_id ON user_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tokens_provider ON user_tokens(provider);
CREATE INDEX IF NOT EXISTS idx_user_tokens_github_id ON user_tokens(github_user_id) WHERE provider = 'github';

-- Posts Table (Optional - for storing generated posts)
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- References user_tokens.user_id
  title TEXT,
  content TEXT NOT NULL, -- The generated LinkedIn post content
  hashtags TEXT[], -- Array of hashtags
  github_activity_summary TEXT, -- Summary of GitHub activity used
  ai_provider VARCHAR(50), -- Which AI provider generated this post
  style VARCHAR(50), -- Post style (Professional, Casual, Technical, etc.)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for posts
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);

-- Row Level Security (RLS) Policies
-- Note: Currently disabled for simplicity since we're using service key
-- Enable when implementing user authentication

-- Enable RLS on user_tokens (commented out for now)
-- ALTER TABLE user_tokens ENABLE ROW LEVEL SECURITY;

-- Policy for service role to access all tokens
-- CREATE POLICY "Service role can manage all tokens" ON user_tokens
--   FOR ALL USING (true);

-- Policy for authenticated users to access only their tokens
-- CREATE POLICY "Users can access their own tokens" ON user_tokens
--   FOR ALL USING (auth.uid()::text = user_id);

-- Enable RLS on posts (commented out for now)
-- ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Policy for users to access only their posts
-- CREATE POLICY "Users can access their own posts" ON posts
--   FOR ALL USING (auth.uid()::text = user_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to both tables
CREATE TRIGGER update_user_tokens_updated_at 
  BEFORE UPDATE ON user_tokens 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at 
  BEFORE UPDATE ON posts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some initial data (optional)
-- This could include default AI provider configurations, etc.

-- Comments for documentation
COMMENT ON TABLE user_tokens IS 'Stores encrypted OAuth tokens for various external providers';
COMMENT ON COLUMN user_tokens.user_id IS 'User identifier (GitHub user ID for GitHub OAuth)';
COMMENT ON COLUMN user_tokens.encrypted_token IS 'AES-256 encrypted access token';
COMMENT ON COLUMN user_tokens.provider IS 'OAuth provider name (github, linkedin, openai, etc.)';

COMMENT ON TABLE posts IS 'Generated LinkedIn posts and their metadata';
COMMENT ON COLUMN posts.content IS 'The generated LinkedIn post content';
COMMENT ON COLUMN posts.github_activity_summary IS 'Summary of GitHub activity that inspired this post';