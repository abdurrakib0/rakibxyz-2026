import React from 'react';
import { getDatabase, SiteInfo, Post, Podcast } from '@/lib/data';

interface JsonLdProps {
  siteInfo?: SiteInfo;
  posts?: Post[];
  podcasts?: Podcast[];
}

export default function JsonLd(props: JsonLdProps) {
  const db = getDatabase();
  const siteInfo = props.siteInfo || db.siteInfo;
  const podcasts = props.podcasts || db.podcasts;

  const schemaGraph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": "https://rakib.xyz/#person",
        "name": siteInfo.name,
        "alternateName": ["Rakib Vai", "Abdur Rakib Zero"],
        "jobTitle": siteInfo.role,
        "hasOccupation": {
          "@type": "Occupation",
          "name": siteInfo.role,
          "occupationalCategory": "11-1021.00",
          "description": "Directs operational placement systems, mentor training pipelines, and institutional partnerships for global developer employment."
        },
        "worksFor": {
          "@type": "Organization",
          "@id": "https://www.programming-hero.com/#organization",
          "name": siteInfo.company,
          "url": "https://www.programming-hero.com/",
          "logo": "https://web.programming-hero.com/home/ph_logo.svg",
          "sameAs": [
            "https://www.facebook.com/ProgrammingHero",
            "https://www.youtube.com/@ProgrammingHeroBangladesh"
          ]
        },
        "url": "https://rakib.xyz/",
        "image": "https://rakib.xyz/img/Abdur%20Rakib%20Vaiya%202.JPG",
        "description": `${siteInfo.role} at ${siteInfo.company}. Engineering high-throughput vocational corridors across 57+ countries, developer placement operations, and mentor ecosystems.`,
        "knowsAbout": [
          "Software Engineering Operations",
          "Tech Job Placement Infrastructure",
          "Junior Developer Hiring Standards",
          "AI in Software Development",
          "EdTech Operational Scaling",
          "Mentorship Systems"
        ],
        "sameAs": [
          siteInfo.socialLinks.linkedin,
          siteInfo.socialLinks.facebook,
          siteInfo.socialLinks.github,
          siteInfo.socialLinks.youtube
        ],
        "alumniOf": {
          "@type": "EducationalOrganization",
          "name": "Self-taught Developer & Technology Practitioner"
        }
      },
      {
        "@type": "ProfilePage",
        "@id": "https://rakib.xyz/#webpage",
        "url": "https://rakib.xyz/",
        "name": `${siteInfo.name} | COO, ${siteInfo.company} - Systems, Hiring & Tech Placements`,
        "description": `Official personal site of ${siteInfo.name} sharing operational frameworks for scaling tech placements, hiring junior engineers, and building resilient developer systems.`,
        "mainEntity": {
          "@id": "https://rakib.xyz/#person"
        },
        "isPartOf": {
          "@type": "WebSite",
          "@id": "https://rakib.xyz/#website",
          "url": "https://rakib.xyz/",
          "name": siteInfo.name,
          "publisher": {
            "@id": "https://rakib.xyz/#person"
          }
        },
        "inLanguage": "en-US"
      },
      {
        "@type": "ItemList",
        "@id": "https://rakib.xyz/#podcasts",
        "name": `Conversations & Keynotes by ${siteInfo.name}`,
        "description": "In-depth video conversations on software engineering, tech hiring, and developer roadmaps.",
        "itemListElement": podcasts.map((pod, idx) => ({
          "@type": "VideoObject",
          "position": idx + 1,
          "name": pod.title,
          "description": `${pod.title} with ${pod.guest}`,
          "thumbnailUrl": `https://img.youtube.com/vi/${pod.id}/hqdefault.jpg`,
          "uploadDate": "2026-01-01",
          "embedUrl": `https://www.youtube-nocookie.com/embed/${pod.id}`,
          "author": { "@id": "https://rakib.xyz/#person" }
        }))
      },
      {
        "@type": "FAQPage",
        "@id": "https://rakib.xyz/#faq",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Who is Abdur Rakib?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `${siteInfo.name} is the Chief Operating Officer (COO) at ${siteInfo.company}. He has over a decade of experience across software engineering, operational leadership, and tech placement infrastructure, contributing to over 6,300 developer placements across 57+ countries.`
            }
          },
          {
            "@type": "Question",
            "name": "What is Abdur Rakib's 2030 tech placement mission?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `His decade mission is to achieve 10,000 global tech job placements per year by 2030 (In Sha' Allah) by building standardized, high-throughput vocational training corridors.`
            }
          },
          {
            "@type": "Question",
            "name": "What is Abdur Rakib's philosophy on junior developer hiring in the AI era?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `${siteInfo.philosophy.quote}`
            }
          }
        ]
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaGraph) }}
    />
  );
}
