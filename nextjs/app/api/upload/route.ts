import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize filename
    const ext = path.extname(file.name) || '.jpg';
    const cleanName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;

    // 1. Try Uploading to Supabase Storage if configured
    if (isSupabaseConfigured() && supabaseAdmin) {
      try {
        const bucketName = 'blog-images';

        // Check or create bucket if needed
        const { data: buckets } = await supabaseAdmin.storage.listBuckets();
        const bucketExists = buckets?.some((b) => b.name === bucketName);

        if (!bucketExists) {
          await supabaseAdmin.storage.createBucket(bucketName, {
            public: true,
          });
        }

        const { data, error } = await supabaseAdmin.storage
          .from(bucketName)
          .upload(cleanName, buffer, {
            contentType: file.type || 'image/jpeg',
            upsert: true,
          });

        if (!error && data) {
          const { data: publicUrlData } = supabaseAdmin.storage
            .from(bucketName)
            .getPublicUrl(cleanName);

          return NextResponse.json({
            success: true,
            url: publicUrlData.publicUrl,
            filename: cleanName,
          });
        } else {
          console.warn('Supabase storage upload note, falling back to local/base64:', error?.message);
        }
      } catch (e) {
        console.warn('Supabase storage exception, falling back:', e);
      }
    }

    // 2. Try saving to /public/uploads/ for local development
    try {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const filePath = path.join(uploadDir, cleanName);
      fs.writeFileSync(filePath, buffer);
      return NextResponse.json({
        success: true,
        url: `/uploads/${cleanName}`,
        filename: cleanName,
      });
    } catch (fsErr) {
      // In serverless / read-only environment without Supabase Storage bucket,
      // return as Base64 Data URL so the image displays perfectly!
      const mimeType = file.type || 'image/jpeg';
      const base64Url = `data:${mimeType};base64,${buffer.toString('base64')}`;
      return NextResponse.json({
        success: true,
        url: base64Url,
        filename: cleanName,
      });
    }
  } catch (error: any) {
    console.error('Image upload handler error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to upload image' },
      { status: 500 }
    );
  }
}
