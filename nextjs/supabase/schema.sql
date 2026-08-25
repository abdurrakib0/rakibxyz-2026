-- ==============================================================================
-- 🚀 SUPABASE DATABASE SCHEMA & COMPLETE SEED DATA FOR RAKIB.XYZ
-- Run this complete script in your Supabase SQL Editor:
-- Supabase Dashboard -> SQL Editor -> New query -> Paste & Click "Run"
-- ==============================================================================

-- 1. DROP EXISTING TABLES (Clean Re-creation)
DROP TABLE IF EXISTS subscribers CASCADE;
DROP TABLE IF EXISTS recommendations CASCADE;
DROP TABLE IF EXISTS experience CASCADE;
DROP TABLE IF EXISTS podcasts CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS site_info CASCADE;

-- ==============================================================================
-- 2. CREATE DATABASE TABLES
-- ==============================================================================

-- SITE INFO TABLE
CREATE TABLE site_info (
    id TEXT PRIMARY KEY DEFAULT 'default',
    name TEXT NOT NULL DEFAULT 'Abdur Rakib',
    role TEXT NOT NULL DEFAULT 'Chief Operating Officer',
    company TEXT NOT NULL DEFAULT 'Programming Hero',
    avatar_url TEXT DEFAULT '/img/Hero image.png',
    hero_headline TEXT NOT NULL,
    hero_bio TEXT NOT NULL,
    stats_caption TEXT NOT NULL,
    stats JSONB NOT NULL DEFAULT '[]'::jsonb,
    philosophy JSONB NOT NULL DEFAULT '{}'::jsonb,
    ecosystem_links JSONB NOT NULL DEFAULT '[]'::jsonb,
    social_links JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- POSTS TABLE (Essays & Articles)
CREATE TABLE posts (
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

-- PODCASTS TABLE (YouTube Episodes)
CREATE TABLE podcasts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    guest TEXT NOT NULL,
    date TEXT NOT NULL,
    tag TEXT DEFAULT 'Tech & Career',
    youtube_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- EXPERIENCE TABLE (Career Timeline)
CREATE TABLE experience (
    id TEXT PRIMARY KEY,
    period TEXT NOT NULL,
    role TEXT NOT NULL,
    company TEXT NOT NULL,
    details JSONB NOT NULL DEFAULT '[]'::jsonb,
    sort_order INT DEFAULT 0
);

-- RECOMMENDATIONS TABLE (Endorsements)
CREATE TABLE recommendations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    company TEXT NOT NULL,
    avatar_url TEXT,
    content TEXT NOT NULL,
    linkedin_url TEXT,
    relation TEXT,
    date TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SUBSCRIBERS TABLE (Newsletter)
CREATE TABLE subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 3. ENABLE ROW LEVEL SECURITY (RLS) & ACCESS POLICIES
-- ==============================================================================

ALTER TABLE site_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Public Read Policies
CREATE POLICY "Allow public read on site_info" ON site_info FOR SELECT USING (true);
CREATE POLICY "Allow public read on posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Allow public read on podcasts" ON podcasts FOR SELECT USING (true);
CREATE POLICY "Allow public read on experience" ON experience FOR SELECT USING (true);
CREATE POLICY "Allow public read on recommendations" ON recommendations FOR SELECT USING (true);

-- Public Subscribe Policy
CREATE POLICY "Allow public newsletter subscription" ON subscribers FOR INSERT WITH CHECK (true);

-- Full Access for Service Role / Admin Operations
CREATE POLICY "Allow full access on site_info" ON site_info FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access on posts" ON posts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access on podcasts" ON podcasts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access on experience" ON experience FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access on recommendations" ON recommendations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access on subscribers" ON subscribers FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- 4. INSERT COMPLETE PRODUCTION SEED DATA
-- ==============================================================================

-- 1. Insert Site Info
INSERT INTO site_info (
    id, name, role, company, avatar_url, hero_headline, hero_bio, stats_caption, stats, philosophy, ecosystem_links, social_links
) VALUES (
    'default',
    'Abdur Rakib',
    'Chief Operating Officer',
    'Programming Hero',
    '/img/Hero image.png',
    'Careers are built <br>by <em>systems</em>, not motivation.',
    'Started programming at 15. Ten years across software engineering, project management, and strategic leadership. Contributing to <strong>150+ tech job placements every month, 6,300+ overall</strong>, Alhamdulillah.',
    'As of August 2026. 150+ new placements every month, Alhamdulillah.',
    '[
        {"number": "6,300+", "label": "developers placed"},
        {"number": "57", "label": "countries"},
        {"number": "1,400+", "label": "trained per year"},
        {"number": "130+", "label": "team"}
    ]'::jsonb,
    '{
        "quote": "AI raised the bar for junior developers. Motivation does not clear it. Systems do.",
        "reflection": "I love meeting inspiring people, learning from them, and passing their wisdom to the next generation through repeatable engineering frameworks.",
        "tags": ["Deliberate Practice", "Architectural Judgement", "Feedback Loops"],
        "decadeTarget": "10,000",
        "decadeTargetLabel": "Global tech placements / year",
        "decadeNote": "In Sha'' Allah. Building high-throughput vocational corridors across 57+ countries to help disciplined talent cross the hiring bar.",
        "placedToDate": "6,300+ placed to date",
        "targetRate": "10,000 / yr"
    }'::jsonb,
    '[
        {"title": "Programming Hero", "url": "https://www.programming-hero.com/"},
        {"title": "Graduation Ceremony", "url": "https://web.programming-hero.com/hero-union"},
        {"title": "Programming Hero Impact", "url": "https://www.programming-hero.com/ph-phitron-success"},
        {"title": "Phitron.io", "url": "https://phitron.io/"}
    ]'::jsonb,
    '{
        "linkedin": "https://www.linkedin.com/in/abdurrakib0/",
        "facebook": "https://www.facebook.com/abdurrakibzero",
        "github": "https://github.com/abdurrakib129",
        "youtube": "https://www.youtube.com/@abdurrakib0",
        "email": "abdur.rakib@programming-hero.com"
    }'::jsonb
);

-- 2. Insert Experience Timeline
INSERT INTO experience (id, period, role, company, details, sort_order) VALUES
('1', '2020 — Present', 'Chief Operating Officer', 'Programming Hero & Phitron', '["5,500+ job placements across 57 countries", "Scaled team from 13 to 130+ in 5 years", "1,400+ junior developers trained annually", "Built transparent OKR systems and servant leadership culture"]'::jsonb, 1),
('2', '2024 — Present', 'Strategic Advisor', 'Exprovia (Web Agency)', '["350+ projects delivered across 20+ countries", "4.9★ rating on Fiverr & Upwork", "Scaling team 15 → 100 members over 3 years", "Building global software development wing"]'::jsonb, 2),
('3', '2022 — 2023', 'Strategic Assistant to COO', 'Brain Station 23', '["Led Dubai & Japan market expansion", "Strategic initiatives for executive team & board", "Tracked strategic performance and market reports", "Coordinated international growth partnerships"]'::jsonb, 3),
('4', '2020 — 2021', 'Technical Project Manager', 'MetLife Bangladesh (via Brain Station 23)', '["Led digital transformation with bKash integration", "Developed eKYC system for trust and safety", "Built customer portal and payment systems"]'::jsonb, 4),
('5', 'Feb — Jun 2020', 'Product Manager', 'Sheba.xyz (Service Marketplace)', '["Managed Bondhu Fintech product", "Reduced mobile topup failure from 7-8% to <1%", "Implemented eKYC for customer trust and fraud prevention", "17% GMV growth during COVID-19 pandemic"]'::jsonb, 5),
('6', '2018 — 2020', 'Software Project Coordinator & Engineer', 'Brain Station 23 (Engineering)', '["ACI Fosholi: 70K+ active users - agritech platform", "Esho Shikhi: 33K users in 3 months - EdTech pioneer", "Lazz Pharma digitalization: online delivery & e-pharma system", "Led 2-12 developer teams on 3+ concurrent projects"]'::jsonb, 6);

-- 3. Insert Podcasts / Keynotes
INSERT INTO podcasts (id, title, guest, date, tag, youtube_url) VALUES
('NeRnnnRP1c0', 'CGPA নাকি Portfolio? AI যুগে Company গুলো আপনার থেকে কী Expect করে? | Nahid Bin Azhar', 'Nahid Bin Azhar', 'Oct 15, 2025', 'Tech Hiring & Portfolio', 'https://www.youtube.com/watch?v=NeRnnnRP1c0&t=1s'),
('PCqCy94S5nI', 'যে কারণে চাকরি হারাচ্ছেন সফটওয়্যার ইঞ্জিনিয়াররা | Shah Ali Newaj Topu', 'Shah Ali Newaj Topu', 'Nov 02, 2025', 'Career Resilience', 'https://www.youtube.com/watch?v=PCqCy94S5nI'),
('oo6aI0HC0OQ', 'কোডিং জানলেও চাকরি জুটবে না? | Hasan Shahriar Masud', 'Hasan Shahriar Masud', 'Nov 20, 2025', 'Industry Competence', 'https://www.youtube.com/watch?v=oo6aI0HC0OQ'),
('o4sLGPZMxkc', 'আগামী ৫ বছরে কোন চাকরিগুলো থাকবে? | Sadman Sadik', 'Sadman Sadik', 'Dec 05, 2025', 'Future of Careers', 'https://www.youtube.com/watch?v=o4sLGPZMxkc&t=108s'),
('OZSgWq_OKr8', 'এই ১ টা এপিসোড বাংলাদেশের প্রত্যেক ইউনিভার্সিটি স্টুডেন্টের দেখা উচিত | Omar Faroque', 'Omar Faroque', 'Jan 10, 2026', 'University & Roadmaps', 'https://www.youtube.com/watch?v=OZSgWq_OKr8'),
('Fowv2UMF2_s', 'ফেসবুকের চাকরি কেন ছেড়ে দিলেন? টাকা কী জীবনের সব? | Omar AL Zabir', 'Omar AL Zabir (Ex-Meta)', 'Feb 14, 2026', 'Tech Leadership', 'https://www.youtube.com/watch?v=Fowv2UMF2_s&t=173s');

-- 4. Insert Essays & Articles
INSERT INTO posts (id, slug, title, subtitle, date, iso_date, read_time, tag, cover_image, published, content) VALUES
('1', 'the-quiet-advantage-of-a-system', 'The quiet advantage of a system', 'Why deliberate, boring systems outperform motivation when it comes to learning to code and hiring junior developers.', 'Aug 19, 2026', '2026-08-19', '6 min read', 'Leadership & Systems', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80', true, 'Every year a few thousand students tell me the same thing: they lost momentum. Almost none of them tell me their process failed, because almost none of them had one.

I started programming at fifteen, on a shared computer, with a textbook that was already out of date. What carried me was not enthusiasm. Enthusiasm was abundant and cheap; it arrived every Sunday and left by Tuesday. What carried me was a small set of rules I could follow on a bad day — write code before checking messages, finish the exercise even if the solution is ugly, submit something every week whether or not it is ready.

None of those rules are clever. Their only virtue is that they do not require me to feel a certain way before they work.

Ten years later I watch the same pattern at scale. We have placed more than six thousand developers into jobs, and the students who make it are rarely the most talented ones in the first month. They are the ones who built a container for their effort: a fixed hour, a visible queue of tasks, one person who notices when they disappear. Talent decides how fast you move. A system decides whether you are still moving in month five.

When AI entered the picture, people told me coding education was over. What actually happened is that the floor rose. Anyone can generate a React component in four seconds. What companies pay for now is the developer who can read what the model generated, notice the edge case it missed, and stay with a broken build until it passes the test suite. That is not a technical skill; it is an attentional habit. You cannot download an attentional habit. You can only practice one until it becomes your default response to frustration.

That is what we build. Not a curriculum that promises ease, but an environment that makes discipline slightly easier to repeat than avoidance. The students who finish are not the ones who found it effortless. They are the ones who made peace with the effort and kept the calendar.'),

('2', 'hiring-junior-engineers-when-ai-writes-the-code', 'Hiring junior engineers when AI writes the code', 'What we look for when code generation is free, and why debugging stamina is the new filter.', 'Jul 28, 2026', '2026-07-28', '8 min read', 'Hiring & Talent', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80', true, 'When Copilot and generative AI tools became ubiquitous, engineering managers feared that evaluating junior engineers would become impossible. If an applicant can generate a complete full-stack app with a single prompt, what does a take-home assignment actually measure?

Over the past two years, placing thousands of developers in engineering organizations worldwide, we noticed the opposite: AI did not obscure talent, it polarized it.

Junior candidates now fall into two distinct groups:

1. **The Assembers**: They copy prompts, glue libraries together, and panic when an unhandled runtime exception appears. They cannot explain the state lifecycle of their own application.
2. **The Systems Thinkers**: They use AI as an accelerator for syntax, but maintain complete mental models of their data flow, architecture boundaries, and failure modes.

In our placement interviews, we stopped asking candidates to write boilerplate from scratch. Instead, we give them a running application with a subtle, race-condition bug and ask them to debug it live with access to AI tools. The candidates who succeed are those with high **debugging stamina** — the ability to form a hypothesis, instrument logs, inspect network payloads, and verify assumptions systematically.'),

('3', 'scaling-placement-operations-across-57-countries', 'Scaling placement operations across 57 countries', 'The operational architecture behind placing 150+ engineers every month across time zones and cultures.', 'Jun 14, 2026', '2026-06-14', '11 min read', 'Operations & Scale', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80', true, 'Placing 150+ software engineers into remote and on-site roles every month is not an HR function; it is a supply chain and QA challenge.

When we crossed our first 1,000 placements, we realized that manual coordination would collapse under volume. To scale across 57 countries, we had to build an institutional placement corridor founded on three operational pillars:

### 1. The Production Readiness Gateway
Before any candidate is presented to hiring partners, they must pass through an internal staging review. This is not a LeetCode quiz — it is a rigorous production audit: PR review etiquette, Dockerized environment setup, API schema validation, and CI/CD pipelines.

### 2. Employer-Calibrated Matching
A startup in Berlin has completely different latency expectations than an enterprise in Singapore. We built operational taxonomy matrices that map hiring partner interview styles to candidate strengths.

### 3. The 90-Day Post-Placement Retention Loop
A placement is only successful if the engineer thrives past probation. Our operations team monitors 30, 60, and 90-day retention checkpoints with both candidate and engineering lead, continuously feeding performance data back into our training curriculum.');

-- 5. Insert Recommendations (Endorsements)
INSERT INTO recommendations (id, name, role, company, avatar_url, content, linkedin_url, relation, date, sort_order) VALUES
('rec_1', 'Jhankar Mahbub', 'Founder & CEO', 'Programming Hero', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 'Abdur Rakib is a rare blend of deep technical architecture and disciplined operational execution. Under his operational leadership, our placement corridor grew into a global engine helping thousands of developers enter the industry. He builds systems that scale predictably.', 'https://www.linkedin.com', 'Managed Abdur directly at Programming Hero', '2024', 1),
('rec_2', 'Tanvir Hasan', 'VP of Engineering', 'Tech Innovations Ltd', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', 'Working with Rakib on high-throughput talent development opened my eyes to what rigorous engineering training looks like. His focus on feedback loops, deliberate practice, and operational excellence sets him apart as an exceptional tech leader.', 'https://www.linkedin.com', 'Worked with Abdur on strategic workforce initiatives', '2023', 2),
('rec_3', 'Farhana Yasmin', 'Head of People & Culture', 'Global Dev Talent', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', 'Rakib has an uncanny ability to identify bottlenecks in complex team operations and solve them with elegance. His mentorship style inspires young engineers to strive for craft and discipline.', 'https://www.linkedin.com', 'Collaborated on tech hiring and placement corridors', '2024', 3),
('rec_4', 'Arifur Rahman', 'Lead Architect', 'CloudScale Systems', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', 'Rakib approaches every technical and managerial challenge with incredible clarity. His ability to align distributed teams toward quantifiable milestones made working alongside him a privilege.', 'https://www.linkedin.com', 'Worked with Abdur on engineering system architecture', '2023', 4),
('rec_5', 'Mahmudul Karim', 'Chief Technology Officer', 'NextGen Ventures', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80', 'A leader who leads by example. Abdur Rakib has built an unparalleled operational model for tech workforce development. His dedication to craft, systems thinking, and execution speed is truly world-class.', 'https://www.linkedin.com', 'Advised on tech operations and executive scaling', '2024', 5);
