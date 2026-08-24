-- ==============================================================================
-- SUPABASE DATABASE SCHEMA FOR ABDUR RAKIB PERSONAL WEBSITE
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor -> New query)
-- ==============================================================================

-- 1. POSTS TABLE (Blog Articles & Essays)
CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT,
    date TEXT NOT NULL,
    iso_date TEXT,
    read_time TEXT DEFAULT '6 min read',
    tag TEXT DEFAULT 'Systems & Leadership',
    cover_image TEXT,
    published BOOLEAN DEFAULT true,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. PODCASTS TABLE (YouTube Keynotes & Episodes)
CREATE TABLE IF NOT EXISTS podcasts (
    id TEXT PRIMARY KEY, -- YouTube Video ID (e.g. NeRnnnRP1c0)
    title TEXT NOT NULL,
    guest TEXT NOT NULL,
    date TEXT NOT NULL,
    tag TEXT DEFAULT 'Tech & Career',
    youtube_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. SITE INFO TABLE (Hero, Stats, Philosophy & Social Links)
CREATE TABLE IF NOT EXISTS site_info (
    id TEXT PRIMARY KEY DEFAULT 'default',
    name TEXT NOT NULL DEFAULT 'Abdur Rakib',
    role TEXT NOT NULL DEFAULT 'Chief Operating Officer',
    company TEXT NOT NULL DEFAULT 'Programming Hero',
    hero_headline TEXT NOT NULL,
    hero_bio TEXT NOT NULL,
    stats_caption TEXT NOT NULL,
    stats JSONB NOT NULL DEFAULT '[]'::jsonb,
    philosophy JSONB NOT NULL DEFAULT '{}'::jsonb,
    ecosystem_links JSONB NOT NULL DEFAULT '[]'::jsonb,
    social_links JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. EXPERIENCE TABLE (Career Timeline)
CREATE TABLE IF NOT EXISTS experience (
    id TEXT PRIMARY KEY,
    period TEXT NOT NULL,
    role TEXT NOT NULL,
    company TEXT NOT NULL,
    details JSONB NOT NULL DEFAULT '[]'::jsonb,
    sort_order INT DEFAULT 0
);

-- 5. SUBSCRIBERS TABLE (Monthly Newsletter Subscriptions)
CREATE TABLE IF NOT EXISTS subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all content
CREATE POLICY "Allow public read access on posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Allow public read access on podcasts" ON podcasts FOR SELECT USING (true);
CREATE POLICY "Allow public read access on site_info" ON site_info FOR SELECT USING (true);
CREATE POLICY "Allow public read access on experience" ON experience FOR SELECT USING (true);

-- Allow public to insert newsletter subscribers
CREATE POLICY "Allow public subscribe to newsletter" ON subscribers FOR INSERT WITH CHECK (true);

-- Allow all operations for service role & anon key (or customize with Supabase Auth)
CREATE POLICY "Allow full access for all operations on posts" ON posts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for all operations on podcasts" ON podcasts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for all operations on site_info" ON site_info FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for all operations on experience" ON experience FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access on subscribers" ON subscribers FOR ALL USING (true) WITH CHECK (true);
