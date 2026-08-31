import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local if exists
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach((line) => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["'](.*)["']$/, '$1');
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey || !supabaseUrl.startsWith('https://')) {
  console.error('\x1b[31m%s\x1b[0m', 'Error: Supabase environment variables missing in .env.local');
  console.log('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY).');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('\x1b[36m%s\x1b[0m', '🚀 Seeding local site-data.json into Supabase...');

  const dataPath = path.join(__dirname, '..', 'data', 'site-data.json');
  const db = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  // 1. Seed Site Info
  console.log('Inserting site_info...');
  const { error: siteInfoErr } = await supabase.from('site_info').upsert({
    id: 'default',
    name: db.siteInfo.name,
    role: db.siteInfo.role,
    company: db.siteInfo.company,
    hero_headline: db.siteInfo.heroHeadline,
    hero_bio: db.siteInfo.heroBio,
    stats_caption: db.siteInfo.statsCaption,
    stats: db.siteInfo.stats,
    philosophy: db.siteInfo.philosophy,
    ecosystem_links: db.siteInfo.ecosystemLinks,
    social_links: db.siteInfo.socialLinks,
    updated_at: new Date().toISOString(),
  });

  if (siteInfoErr) console.error('Error inserting site_info:', siteInfoErr.message);
  else console.log('✓ site_info seeded successfully');

  // 2. Seed Posts
  console.log(`Inserting ${db.posts.length} posts...`);
  for (const post of db.posts) {
    const { error: postErr } = await supabase.from('posts').upsert({
      id: post.id,
      slug: post.slug,
      title: post.title,
      subtitle: post.subtitle,
      date: post.date,
      iso_date: post.isoDate,
      read_time: post.readTime,
      tag: post.tag,
      published: post.published,
      content: post.content,
      updated_at: new Date().toISOString(),
    });
    if (postErr) console.error(`Error inserting post ${post.id}:`, postErr.message);
  }
  console.log('✓ posts seeded successfully');

  // 3. Seed Podcasts
  console.log(`Inserting ${db.podcasts.length} podcasts...`);
  for (const pod of db.podcasts) {
    const { error: podErr } = await supabase.from('podcasts').upsert({
      id: pod.id,
      title: pod.title,
      guest: pod.guest,
      date: pod.date,
      tag: pod.tag,
      youtube_url: pod.youtubeUrl,
    });
    if (podErr) console.error(`Error inserting podcast ${pod.id}:`, podErr.message);
  }
  console.log('✓ podcasts seeded successfully');

  // 4. Seed Experience
  console.log(`Inserting ${db.experience.length} experience entries...`);
  for (let i = 0; i < db.experience.length; i++) {
    const exp = db.experience[i];
    const { error: expErr } = await supabase.from('experience').upsert({
      id: exp.id,
      period: exp.period,
      role: exp.role,
      company: exp.company,
      details: exp.details,
      sort_order: i,
    });
    if (expErr) console.error(`Error inserting experience ${exp.id}:`, expErr.message);
  }
  console.log('✓ experience seeded successfully');

  // 5. Seed Recommendations
  if (db.recommendations && db.recommendations.length > 0) {
    console.log(`Inserting ${db.recommendations.length} recommendations...`);
    for (let i = 0; i < db.recommendations.length; i++) {
      const rec = db.recommendations[i];
      const { error: recErr } = await supabase.from('recommendations').upsert({
        id: rec.id,
        name: rec.name,
        role: rec.role,
        company: rec.company,
        avatar_url: rec.avatarUrl,
        content: rec.content,
        linkedin_url: rec.linkedinUrl,
        relation: rec.relation,
        date: rec.date,
        sort_order: rec.sortOrder ?? i + 1,
      });
      if (recErr) console.error(`Error inserting recommendation ${rec.id}:`, recErr.message);
    }
    console.log('✓ recommendations seeded successfully');
  }

  // 6. Seed Subscribers
  if (db.subscribers && db.subscribers.length > 0) {
    console.log(`Inserting ${db.subscribers.length} subscribers...`);
    for (const sub of db.subscribers) {
      const { error: subErr } = await supabase.from('subscribers').upsert({
        id: sub.id,
        email: sub.email,
        created_at: sub.createdAt || new Date().toISOString(),
      });
      if (subErr) console.error(`Error inserting subscriber ${sub.email}:`, subErr.message);
    }
    console.log('✓ subscribers seeded successfully');
  }

  console.log('\x1b[32m%s\x1b[0m', '✨ Supabase database seeding complete!');
}

seed().catch(console.error);
