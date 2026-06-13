-- Add social_links JSONB column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '[]'::jsonb;

-- social_links format: [{ "platform": "twitter", "url": "https://twitter.com/username" }, ...]
-- Valid platforms: twitter, instagram, linkedin, github, youtube, tiktok, facebook, whatsapp, discord, website
