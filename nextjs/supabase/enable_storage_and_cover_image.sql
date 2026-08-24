-- ==============================================================================
-- SUPABASE SQL SCRIPT: ENABLE COVER IMAGES & STORAGE BUCKET
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ==============================================================================

-- 1. Add cover_image column to posts table if not exists
ALTER TABLE posts ADD COLUMN IF NOT EXISTS cover_image TEXT;

-- 2. Create the blog-images storage bucket for direct image uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 3. Allow public read access to all images in blog-images bucket
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Public Read Access on blog-images'
    ) THEN
        CREATE POLICY "Public Read Access on blog-images"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'blog-images');
    END IF;
END $$;

-- 4. Allow upload and update access on blog-images bucket
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Public Upload Access on blog-images'
    ) THEN
        CREATE POLICY "Public Upload Access on blog-images"
        ON storage.objects FOR INSERT
        WITH CHECK (bucket_id = 'blog-images');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Public Update Access on blog-images'
    ) THEN
        CREATE POLICY "Public Update Access on blog-images"
        ON storage.objects FOR UPDATE
        USING (bucket_id = 'blog-images');
    END IF;
END $$;
