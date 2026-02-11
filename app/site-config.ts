const FALLBACK_SITE_URL = "https://example.com";

function parseSiteUrl(rawSiteUrl: string | undefined): URL {
  if (!rawSiteUrl) {
    return new URL(FALLBACK_SITE_URL);
  }

  try {
    return new URL(rawSiteUrl);
  } catch {
    try {
      return new URL(`https://${rawSiteUrl}`);
    } catch {
      return new URL(FALLBACK_SITE_URL);
    }
  }
}

type SiteConfig = {
  name: string;
  shortName: string;
  description: string;
  keywords: string[];
};

export const siteConfig: SiteConfig = {
  name: "UI Prompt Atelier",
  shortName: "Prompt Atelier",
  description:
    "UI Prompt Atelier is a Gemini-powered prompt builder for creating production-ready prompts for UI-building agents.",
  keywords: [
    "UI prompt builder",
    "Gemini",
    "Next.js",
    "prompt engineering",
    "design systems",
    "frontend development"
  ]
};

export const siteUrl = parseSiteUrl(
  process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL
);
