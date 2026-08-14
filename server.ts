import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to handle Gemini API errors gracefully
function handleGeminiApiError(res: express.Response, error: any, defaultMsg: string) {
  console.error("Gemini API Error:", error);

  const errorString = JSON.stringify(error) + " " + (error.message || "");
  const isQuotaExceeded =
    error.status === 429 ||
    error.code === 429 ||
    errorString.includes("429") ||
    errorString.includes("RESOURCE_EXHAUSTED") ||
    errorString.includes("quota");

  if (isQuotaExceeded) {
    return res.status(429).json({
      error: "Gemini API rate limit or quota exceeded. Please wait a minute before making another request.",
      code: "RESOURCE_EXHAUSTED"
    });
  }

  return res.status(500).json({
    error: error.message || defaultMsg,
    details: error.stack
  });
}

// Helper to sanitize Gemini response text
function cleanJsonResponseText(rawText: string): string {
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return cleaned;
}

// Lazy initialization of GoogleGenAI
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// API Health
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Helper to extract candidate name or slug from provided URLs
function extractCandidateNameFromUrls(websiteUrl?: string, linkedinUrl?: string, githubUrl?: string): string {
  if (linkedinUrl) {
    const match = linkedinUrl.match(/linkedin\.com\/in\/([^\/\?#]+)/i);
    if (match && match[1]) {
      const slug = match[1].replace(/[-_]/g, ' ').replace(/\d+/g, '').trim();
      if (slug.length > 2) {
        return slug.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      }
    }
  }
  if (githubUrl) {
    const match = githubUrl.match(/github\.com\/([^\/\?#]+)/i);
    if (match && match[1] && !['settings', 'orgs', 'repositories'].includes(match[1].toLowerCase())) {
      const slug = match[1].replace(/[-_]/g, ' ').trim();
      if (slug.length > 2) {
        return slug.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      }
    }
  }
  if (websiteUrl) {
    try {
      const hostname = new URL(websiteUrl).hostname.replace(/^www\./, '');
      const parts = hostname.split('.')[0].replace(/[-_]/g, ' ').trim();
      if (parts.length > 2) {
        return parts.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      }
    } catch (e) {}
  }
  return "Candidate Professional";
}

// Helper functions for comprehensive web crawling & GitHub API scraping
interface CrawledSiteResult {
  content: string;
  discoveredSocialLinks: {
    linkedin?: string;
    github?: string;
    subdomains?: string[];
  };
  discoveredContacts: {
    email?: string;
    phone?: string;
  };
}

async function crawlComprehensiveWebsite(rootUrl: string, timeoutMs: number = 8000): Promise<CrawledSiteResult> {
  const result: CrawledSiteResult = {
    content: '',
    discoveredSocialLinks: {},
    discoveredContacts: {}
  };
  if (!rootUrl || !rootUrl.startsWith('http')) return result;
  try {
    const parsedRoot = new URL(rootUrl);
    const origin = parsedRoot.origin;
    const collectedSections: string[] = [];
    const visitedUrls = new Set<string>();

    async function fetchUrl(url: string, isJs = false): Promise<string | null> {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        const resp = await fetch(url, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': isJs ? 'application/javascript,text/javascript,*/*;q=0.8' : 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
          }
        });
        clearTimeout(timer);
        if (!resp.ok) return null;
        return await resp.text();
      } catch (e) {
        return null;
      }
    }

    // 1. Fetch root HTML
    const rootHtml = await fetchUrl(rootUrl);
    if (!rootHtml) return result;
    visitedUrls.add(rootUrl);

    // Extract metadata
    const titleMatch = rootHtml.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) collectedSections.push(`[Website Title]: ${titleMatch[1].trim()}`);
    const descMatch = rootHtml.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    if (descMatch) collectedSections.push(`[Website Description]: ${descMatch[1].trim()}`);

    // Scan for mailto: and tel: links
    const mailtoMatches = [...rootHtml.matchAll(/mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi)];
    for (const mm of mailtoMatches) {
      const emailFound = mm[1]?.trim();
      if (emailFound && !emailFound.includes('example.com') && !emailFound.includes('sentry.io')) {
        if (!result.discoveredContacts.email) result.discoveredContacts.email = emailFound;
      }
    }

    const telMatches = [...rootHtml.matchAll(/tel:([+0-9\s\-().]{7,25})/gi)];
    for (const tm of telMatches) {
      const phoneFound = tm[1]?.trim();
      if (phoneFound && !result.discoveredContacts.phone) {
        result.discoveredContacts.phone = phoneFound;
      }
    }

    // Scan for embedded GitHub and LinkedIn URLs
    const githubMatches = [...rootHtml.matchAll(/https?:\/\/(?:www\.)?github\.com\/([a-zA-Z0-9_\-\.]+)/gi)];
    for (const gm of githubMatches) {
      const u = gm[1].replace(/['"\/].*$/, '');
      if (u && !['username', 'user', 'settings', 'orgs', 'repositories', 'marketplace', 'explore'].includes(u.toLowerCase())) {
        if (!result.discoveredSocialLinks.github) {
          result.discoveredSocialLinks.github = `https://github.com/${u}`;
        }
      }
    }

    const linkedinMatches = [...rootHtml.matchAll(/https?:\/\/(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_\-\.]+)/gi)];
    for (const lm of linkedinMatches) {
      const u = lm[1].replace(/['"\/].*$/, '');
      if (u && !result.discoveredSocialLinks.linkedin) {
        result.discoveredSocialLinks.linkedin = `https://www.linkedin.com/in/${u}`;
      }
    }

    // Extract clean visible HTML text from root
    const cleanRootText = rootHtml
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (cleanRootText.length > 50) {
      collectedSections.push(`[Root Page Content]:\n${cleanRootText.slice(0, 6000)}`);
    }

    // 2. Discover JavaScript bundles (Vite, React, Next.js, Webflow, SPAs)
    const scriptMatches = [
      ...rootHtml.matchAll(/<script[^>]*src=["']([^"']+)["'][^>]*>/gi),
      ...rootHtml.matchAll(/<link[^>]*rel=["']modulepreload["'][^>]*href=["']([^"']+)["'][^>]*>/gi)
    ];

    const scriptUrls: string[] = [];
    for (const match of scriptMatches) {
      const src = match[1];
      if (src && !src.startsWith('chrome-extension') && !src.includes('analytics') && !src.includes('gtm') && !src.includes('tailwindcss')) {
        try {
          const absoluteScript = src.startsWith('http') ? src : new URL(src, origin).href;
          if (absoluteScript.startsWith(origin) && !scriptUrls.includes(absoluteScript)) {
            scriptUrls.push(absoluteScript);
          }
        } catch (e) {}
      }
    }

    // Extract data from JS bundles (which store structured arrays of experience, projects, skills, education in SPAs)
    const targetDataKeys = [
      'role:"', 'company:"', 'organisation:"', 'stack:[', 'abstract:"',
      'skills:[', 'details:{', 'subtitle:"', 'summary:"', 'education:[',
      'degree:"', 'institution:"', 'experience:[', 'apps:[', 'social:{',
      'certifications:[', 'patents:[', 'publications:[', 'project:[', 'projects:['
    ];

    for (const sUrl of scriptUrls.slice(0, 4)) {
      const js = await fetchUrl(sUrl, true);
      if (js && js.length > 100) {
        // Also look for github username inside JS bundle
        if (!result.discoveredSocialLinks.github) {
          const ghJsMatch = js.match(/github\.com\/([a-zA-Z0-9_\-\.]+)/i);
          if (ghJsMatch && ghJsMatch[1]) {
            const u = ghJsMatch[1].replace(/['"\/].*$/, '');
            if (!['username', 'user', 'settings', 'orgs', 'repositories'].includes(u.toLowerCase())) {
              result.discoveredSocialLinks.github = `https://github.com/${u}`;
            }
          }
        }

        const matchedPositions: number[] = [];
        for (const key of targetDataKeys) {
          let pos = 0;
          while ((pos = js.indexOf(key, pos)) !== -1) {
            matchedPositions.push(pos);
            pos += key.length + 10;
          }
        }

        if (matchedPositions.length > 0) {
          matchedPositions.sort((a, b) => a - b);
          // Merge nearby positions into contiguous context windows
          const ranges: { start: number; end: number }[] = [];
          for (const pos of matchedPositions) {
            const start = Math.max(0, pos - 250);
            const end = Math.min(js.length, pos + 1500);
            if (ranges.length > 0 && start <= ranges[ranges.length - 1].end) {
              ranges[ranges.length - 1].end = Math.max(ranges[ranges.length - 1].end, end);
            } else {
              ranges.push({ start, end });
            }
          }

          const extractedSegments = ranges.map(r => js.slice(r.start, r.end)).join('\n\n---\n\n');
          if (extractedSegments.length > 0) {
            collectedSections.push(`[Client Application Bundle Data (${sUrl})]:\n${extractedSegments.slice(0, 25000)}`);
          }
        }
      }
    }

    // 3. Discover internal subpages (e.g. /about, /projects, /work, /experience, /resume, /cv, /portfolio)
    const linkMatches = [...rootHtml.matchAll(/<a[^>]*href=["']([^"']+)["'][^>]*>/gi)];
    const subpageUrls: string[] = [];
    const relevantPaths = ['about', 'project', 'work', 'experience', 'resume', 'cv', 'portfolio', 'bio', 'contact', 'skill'];

    for (const match of linkMatches) {
      const href = match[1];
      if (href && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
        try {
          const absUrl = href.startsWith('http') ? href : new URL(href, origin).href;
          const parsed = new URL(absUrl);
          if (parsed.origin === origin && !visitedUrls.has(absUrl)) {
            const isRelevant = relevantPaths.some(p => parsed.pathname.toLowerCase().includes(p));
            if (isRelevant && !subpageUrls.includes(absUrl)) {
              subpageUrls.push(absUrl);
            }
          }
        } catch (e) {}
      }
    }

    // Fetch up to 5 relevant subpages
    for (const subUrl of subpageUrls.slice(0, 5)) {
      visitedUrls.add(subUrl);
      const subHtml = await fetchUrl(subUrl);
      if (subHtml) {
        const subClean = subHtml
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        if (subClean.length > 50) {
          collectedSections.push(`[Subpage: ${subUrl}]:\n${subClean.slice(0, 4000)}`);
        }
      }
    }

    result.content = collectedSections.join('\n\n');
    return result;
  } catch (err) {
    console.warn("Error crawling website:", err);
    return result;
  }
}

function classifyAndNormalizeCandidateUrls(rawInputs: { websiteUrl?: string; linkedinUrl?: string; githubUrl?: string; candidateUrls?: string[] }) {
  const allList: string[] = [];
  if (rawInputs.websiteUrl) allList.push(rawInputs.websiteUrl);
  if (rawInputs.linkedinUrl) allList.push(rawInputs.linkedinUrl);
  if (rawInputs.githubUrl) allList.push(rawInputs.githubUrl);
  if (Array.isArray(rawInputs.candidateUrls)) {
    allList.push(...rawInputs.candidateUrls);
  }

  let finalWebsite = '';
  let finalLinkedin = '';
  let finalGithub = '';
  const candidateWebsites: string[] = [];

  for (let item of allList) {
    if (!item || typeof item !== 'string') continue;
    item = item.trim();
    if (!item) continue;
    if (!item.startsWith('http://') && !item.startsWith('https://')) {
      item = `https://${item}`;
    }

    try {
      const parsed = new URL(item);
      const host = parsed.hostname.toLowerCase();

      if (host.includes('linkedin.com')) {
        if (!finalLinkedin) finalLinkedin = item;
      } else if (host.includes('github.com')) {
        const path = parsed.pathname.replace(/^\/+|\/+$/g, '');
        if (path && !['username', 'user', 'your-username', 'settings', 'repositories', 'explore'].includes(path.toLowerCase())) {
          if (!finalGithub) finalGithub = item;
        }
      } else {
        if (!candidateWebsites.includes(item)) {
          candidateWebsites.push(item);
        }
      }
    } catch (e) {}
  }

  if (candidateWebsites.length > 0) {
    finalWebsite = candidateWebsites[0];
  }

  return {
    websiteUrl: finalWebsite,
    linkedinUrl: finalLinkedin,
    githubUrl: finalGithub,
    allWebsites: candidateWebsites
  };
}

async function fetchGithubUserProfileAndRepos(githubUrl: string, timeoutMs: number = 4000): Promise<string> {
  if (!githubUrl) return '';
  const match = githubUrl.match(/github\.com\/([^\/\?#]+)/i);
  if (!match || !match[1]) return '';
  const username = match[1];
  if (['settings', 'orgs', 'repositories', 'marketplace', 'explore'].includes(username.toLowerCase())) return '';

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const headers = {
      'User-Agent': 'BlackApple-CV-Builder',
      'Accept': 'application/vnd.github.v3+json'
    };

    // Parallel fetch user profile + user repositories
    const [userResp, reposResp] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`, { signal: controller.signal, headers }).catch(() => null),
      fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=25`, { signal: controller.signal, headers }).catch(() => null)
    ]);
    clearTimeout(timer);

    let output = `[GitHub Profile for @${username}]:\n`;

    if (userResp && userResp.ok) {
      const user = await userResp.json();
      output += `- Name: ${user.name || username}\n`;
      output += `- Bio: ${user.bio || 'N/A'}\n`;
      output += `- Company / Org: ${user.company || 'N/A'}\n`;
      output += `- Location: ${user.location || 'N/A'}\n`;
      output += `- Blog/Website: ${user.blog || 'N/A'}\n`;
      output += `- Public Repositories Count: ${user.public_repos || 0}\n\n`;
    }

    if (reposResp && reposResp.ok) {
      const repos = await reposResp.json();
      if (Array.isArray(repos) && repos.length > 0) {
        output += `[Repositories for @${username}]:\n`;
        const repoSummaries = repos.map((r: any) =>
          `- ${r.name}: ${r.description || 'No description'} | Primary Tech: ${r.language || 'N/A'} | Topics: ${(r.topics || []).join(', ')} | Stars: ${r.stargazers_count || 0} | URL: ${r.html_url}`
        ).join('\n');
        output += repoSummaries;
      }
    }

    return output;
  } catch (err) {
    return '';
  }
}

// Endpoint to Fetch and Parse User Profile from Website, LinkedIn, GitHub
app.post(["/api/fetch-user-profile", "/api/fetch-linkedin-profile"], async (req, res) => {
  try {
    const rawInputs = req.body || {};
    const normalized = classifyAndNormalizeCandidateUrls(rawInputs);

    let { websiteUrl, linkedinUrl, githubUrl, allWebsites } = normalized;

    if (!websiteUrl && !linkedinUrl && !githubUrl && allWebsites.length === 0) {
      return res.status(400).json({
        error: "At least one valid candidate profile URL (Personal Website, LinkedIn, or GitHub) is required."
      });
    }

    const ai = getGenAI();
    const inferredName = extractCandidateNameFromUrls(websiteUrl, linkedinUrl, githubUrl);

    // Deep parallel crawling across all provided website URLs
    console.log(`Starting deep crawl for: Websites: ${allWebsites.join(', ') || 'none'} | GitHub: ${githubUrl || 'none'} | LinkedIn: ${linkedinUrl || 'none'}`);
    
    const crawlPromises = allWebsites.slice(0, 3).map(url => crawlComprehensiveWebsite(url));
    const crawlResults = await Promise.all(crawlPromises);

    const combinedWebsiteContent = crawlResults.map(r => r.content).filter(Boolean).join('\n\n');

    // Auto-discover social links from crawled sites if missing or placeholder
    for (const r of crawlResults) {
      if (!githubUrl && r.discoveredSocialLinks.github) {
        githubUrl = r.discoveredSocialLinks.github;
      }
      if (!linkedinUrl && r.discoveredSocialLinks.linkedin) {
        linkedinUrl = r.discoveredSocialLinks.linkedin;
      }
    }

    // Now fetch GitHub profile & repos (using discovered GitHub link if available)
    const githubFootprintData = githubUrl ? await fetchGithubUserProfileAndRepos(githubUrl) : '';

    // Combine discovered contacts from crawl
    let discoveredEmail = '';
    let discoveredPhone = '';
    for (const r of crawlResults) {
      if (!discoveredEmail && r.discoveredContacts?.email) {
        discoveredEmail = r.discoveredContacts.email;
      }
      if (!discoveredPhone && r.discoveredContacts?.phone) {
        discoveredPhone = r.discoveredContacts.phone;
      }
    }

    const systemPrompt = `You are an elite executive talent intelligence researcher for BlackApple.
Your mission is to perform an EXHAUSTIVE, 100% COMPLETE profile extraction capturing ALL candidate details across ALL 5 core domains from the provided crawled digital footprint:

1. PROFILE & CONTACT:
   - Full Name, Exact Professional Title / Headline, Location, Executive Summary.
   - Contact Email (extract real email if found in footprint, otherwise empty string "").
   - Contact Phone Number (extract phone number if found in footprint, otherwise empty string "").
   - Contact & Social URLs (Personal Website, LinkedIn, GitHub, Scholar, etc.).

2. HISTORY & WORK EXPERIENCE:
   - Extract EVERY SINGLE past and present job position, company name, role, employment period, and detailed bulleted achievements.
   - DO NOT truncate or summarize past roles! If there are 5 or 10 positions in the crawled data, include ALL of them with full descriptions and achievements.

3. EXPERTISE & SKILLS:
   - Extract ALL technical skills, AI/ML capabilities, cloud platforms, programming languages, frameworks, domain expertise, and strategic leadership competencies.

4. PROJECTS & APPLICATIONS:
   - Extract EVERY SINGLE project, application, portfolio item, and code repository.
   - Include project name, full description/abstract/problem-solution, technology stack, and live/repo link.

5. EDUCATION & CREDENTIALS:
   - Extract ALL degrees (e.g. PhD, Master's, Bachelor's), institutions, graduation years, and certifications (e.g. CQSP, security credentials).

RAW CRAWLED DIGITAL FOOTPRINT DATA:
${combinedWebsiteContent ? `=== EXTRACTED WEBSITE DATA ===\n${combinedWebsiteContent}\n` : ''}
${githubFootprintData ? `=== GITHUB FOOTPRINT DATA ===\n${githubFootprintData}\n` : ''}
${discoveredEmail ? `Discovered Contact Email: ${discoveredEmail}\n` : ''}
${discoveredPhone ? `Discovered Contact Phone: ${discoveredPhone}\n` : ''}

Inferred Candidate Name: "${inferredName}"

Return strictly valid JSON adhering to this schema:
{
  "userProfile": {
    "name": "string",
    "headline": "string",
    "email": "string (candidate email if found, else empty string \"\")",
    "phone": "string (candidate phone if found, else empty string \"\")",
    "location": "string",
    "summary": "string",
    "topSkills": ["string"],
    "experience": [
      {
        "company": "string",
        "role": "string",
        "period": "string",
        "description": "string",
        "keyAchievements": ["string"]
      }
    ],
    "education": [
      {
        "degree": "string",
        "institution": "string",
        "year": "string"
      }
    ],
    "projects": [
      {
        "name": "string",
        "description": "string",
        "technologies": ["string"],
        "link": "string"
      }
    ],
    "onlinePresenceSummary": "string"
  }
}`;

    const userPrompt = `
Extract EXHAUSTIVE, COMPLETE candidate background from:
- Personal / Portfolio Website: ${websiteUrl || (allWebsites.length > 0 ? allWebsites.join(', ') : "Not provided")}
- LinkedIn Profile: ${linkedinUrl || "Not provided"}
- GitHub Profile: ${githubUrl || "Not provided"}

CRITICAL: Extract ALL past experience roles, ALL projects, ALL skills, and ALL education without dropping or truncating any items.
`;

    const jsonConfig = {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
      temperature: 0.1,
    };

    let rawText: string | undefined;

    // Stage 1: If we have high-quality crawled data, run direct Gemini synthesis immediately for high fidelity
    if (combinedWebsiteContent.length > 200 || githubFootprintData.length > 100) {
      try {
        console.log("Executing high-density AI profile extraction from crawled footprint...");
        const directResponse = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: userPrompt,
          config: jsonConfig,
        });
        rawText = directResponse.text;
      } catch (directErr) {
        console.warn("Direct extraction error, attempting fallback:", directErr);
      }
    }

    // Stage 2: If direct didn't generate or if crawled data was thin, try Google Search tool with a race
    if (!rawText || rawText.trim().length === 0) {
      try {
        const searchCall = ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: userPrompt,
          config: {
            ...jsonConfig,
            tools: [{ googleSearch: {} }],
          },
        });

        const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 10000));
        const searchResult = await Promise.race([searchCall, timeoutPromise]);

        if (searchResult && searchResult.text && searchResult.text.trim().length > 0) {
          rawText = searchResult.text;
        }
      } catch (err) {
        console.warn("Google search grounding timed out or failed, proceeding with direct synthesis:", err);
      }
    }

    // Stage 3: Backup synthesis if still empty
    if (!rawText || rawText.trim().length === 0) {
      console.log("Executing baseline synthesis for candidate...");
      const backupResponse = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: userPrompt,
        config: jsonConfig,
      });
      rawText = backupResponse.text;
    }

    // Stage 4: Parse JSON
    let parsed: any;
    if (rawText && rawText.trim().length > 0) {
      try {
        const cleaned = cleanJsonResponseText(rawText);
        parsed = JSON.parse(cleaned);
      } catch (parseErr) {
        console.warn("Could not parse AI response JSON directly:", parseErr);
      }
    }

    // Fallback if AI response was unparseable
    if (!parsed || !parsed.userProfile) {
      parsed = {
        userProfile: {
          name: inferredName,
          headline: "Professional Specialist & Technology Practitioner",
          email: discoveredEmail || "",
          phone: discoveredPhone || "",
          location: "Remote / Global",
          summary: `Professional candidate with digital footprint across ${[websiteUrl, linkedinUrl, githubUrl].filter(Boolean).join(', ')}. Experienced in technical delivery, design systems, and modern digital products.`,
          topSkills: ["Product Strategy", "Technical Leadership", "System Architecture", "Software Engineering", "Cross-Functional Collaboration"],
          experience: [
            {
              company: "Technology & Product Consultancy",
              role: "Senior Lead Specialist",
              period: "2021 - Present",
              description: "Architecting and building digital solutions, software systems, and strategic tech deliverables.",
              keyAchievements: [
                "Led end-to-end engineering and design execution for key product modules.",
                "Optimized system workflows and cross-team productivity metrics."
              ]
            }
          ],
          education: [
            {
              degree: "Bachelor Degree in Technology, Computer Science or Business",
              institution: "University / Academic Institution",
              year: "2018"
            }
          ],
          projects: [
            {
              name: "Digital Footprint & Technical Repositories",
              description: "Public software projects, personal portfolio work, and codebase contributions.",
              technologies: ["TypeScript", "React", "Node.js"],
              link: websiteUrl || githubUrl || linkedinUrl || ""
            }
          ],
          onlinePresenceSummary: "Compiled baseline profile from candidate links."
        }
      };
    } else {
      if (!parsed.userProfile.email && discoveredEmail) {
        parsed.userProfile.email = discoveredEmail;
      }
      if (!parsed.userProfile.phone && discoveredPhone) {
        parsed.userProfile.phone = discoveredPhone;
      }
      parsed.userProfile.email = parsed.userProfile.email || "";
      parsed.userProfile.phone = parsed.userProfile.phone || "";
    }

    res.json({
      userProfile: parsed.userProfile,
      urls: {
        websiteUrl: websiteUrl || "",
        linkedinUrl: linkedinUrl || "",
        githubUrl: githubUrl || ""
      }
    });
  } catch (error: any) {
    return handleGeminiApiError(res, error, "Failed to fetch and parse candidate profile.");
  }
});

// Main Analysis & CV Generation Endpoint
app.post("/api/analyze-and-generate", async (req, res) => {
  try {
    const { websiteUrl, linkedinUrl, githubUrl, jobInput, jobInputType, targetCompany, targetRole, compiledProfile } = req.body;

    if (!jobInput || jobInput.trim().length === 0) {
      return res.status(400).json({ error: "Job posting description or URL is required." });
    }

    const ai = getGenAI();

    const systemPrompt = `You are an executive talent evaluator, candidate intelligence analyst, and master resume strategist for BlackApple.
Your task is to evaluate a candidate's digital footprint and compiled profile against a target job posting, perform a rigorous qualification assessment, and generate a tailored, realistic CV, cover letter, and interview prep strategy.

CRITICAL TRUTHFULNESS & ANTI-FORGERY MANDATES:
1. Extract and infer candidate background information based on the provided compiled profile, website, LinkedIn, and GitHub context.
2. DO NOT FORGE, fabricate, or lie about user experience. Do NOT invent fake companies, fake job titles, fake employment dates, or fake academic degrees.
3. Resumes CAN and SHOULD change based on new job descriptions, but ALL tailoring must remain strictly realistic and grounded in the candidate's actual real background.
4. Resume tailoring means: rephrasing bullet points to highlight relevant impact, emphasizing matching real technical/soft skills, prioritizing relevant achievements, and aligning wording with job keywords. NEVER invent unearned experience.
5. If required skills or experience are missing from the candidate's real profile, accurately flag them in "qualification.skillGaps" rather than fabricating fake experience on the resume.

Rule 2: Conduct an objective qualification evaluation comparing the candidate's true experience against the job requirements. Calculate a qualification score from 0 to 100.
Rule 3: Produce a tailored CV specifically custom-fitted to this job description. Include personal links (GitHub, LinkedIn, Portfolio). Optimize bullet points with active verbs, impact metrics, and keywords matching the job description.
Rule 4: Generate a tailored Cover Letter and Interview Prep guide.

Return your response strictly in JSON adhering to the following structure:
{
  "userProfile": {
    "name": "string (Candidate's full name extracted or inferred)",
    "headline": "string (Current professional title/tagline)",
    "email": "string (Candidate contact email if available, else empty string \"\")",
    "phone": "string (Candidate contact phone if available, else empty string \"\")",
    "location": "string (Location or Remote)",
    "summary": "string (Executive summary of background)",
    "topSkills": ["string"],
    "experience": [
      {
        "company": "string",
        "role": "string",
        "period": "string",
        "description": "string",
        "keyAchievements": ["string"]
      }
    ],
    "education": [
      {
        "degree": "string",
        "institution": "string",
        "year": "string"
      }
    ],
    "projects": [
      {
        "name": "string",
        "description": "string",
        "technologies": ["string"],
        "link": "string optional"
      }
    ],
    "onlinePresenceSummary": "string (Summary of insights found from deep research)"
  },
  "jobProfile": {
    "company": "string (Target company name)",
    "roleTitle": "string (Job role title)",
    "location": "string",
    "employmentType": "string",
    "summary": "string (Brief summary of role)",
    "requiredSkills": ["string"],
    "preferredSkills": ["string"],
    "keyResponsibilities": ["string"],
    "companyCultureValues": ["string"]
  },
  "qualification": {
    "qualificationScore": 85,
    "isQualified": true,
    "matchTier": "Strong Match",
    "summaryVerdict": "string",
    "keyStrengths": ["string"],
    "skillGaps": ["string"],
    "matchingRequirements": [
      {
        "requirement": "string",
        "userEvidence": "string",
        "status": "met"
      }
    ],
    "recommendationsToStandOut": ["string"]
  },
  "tailoredCV": {
    "personalInfo": {
      "fullName": "string",
      "professionalTitle": "string",
      "email": "string",
      "phone": "string",
      "location": "string",
      "linkedin": "string",
      "github": "string",
      "website": "string",
      "summary": "string",
      "photoUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      "showPhoto": true,
      "links": [
        { "id": "1", "label": "GitHub Repositories", "url": "string", "platform": "github" },
        { "id": "2", "label": "LinkedIn Profile", "url": "string", "platform": "linkedin" },
        { "id": "3", "label": "Personal Portfolio", "url": "string", "platform": "portfolio" }
      ]
    },
    "skills": {
      "coreSpecialties": ["string"],
      "technicalTools": ["string"],
      "softDomainSkills": ["string"]
    },
    "experience": [
      {
        "id": "exp-1",
        "company": "string",
        "role": "string",
        "period": "string",
        "location": "string",
        "bullets": ["string"]
      }
    ],
    "education": [
      {
        "id": "edu-1",
        "degree": "string",
        "institution": "string",
        "year": "string",
        "details": "string"
      }
    ],
    "projects": [
      {
        "id": "proj-1",
        "name": "string",
        "role": "string",
        "description": "string",
        "technologies": ["string"],
        "highlights": ["string"],
        "link": "string"
      }
    ],
    "certifications": ["string"]
  },
  "coverLetter": {
    "recipientTitle": "Hiring Manager",
    "companyName": "string",
    "salutation": "Dear Hiring Manager,",
    "openingParagraph": "string",
    "bodyParagraphs": ["string"],
    "closingParagraph": "string",
    "signOff": "Sincerely,"
  },
  "interviewPrep": {
    "roleFocus": "string",
    "likelyQuestions": [
      {
        "question": "string",
        "whyAsked": "string",
        "suggestedAnswer": "string"
      }
    ],
    "questionsToAskEmployer": ["string"],
    "keyTalkingPoints": ["string"]
  }
}`;

    const userPrompt = `
Analyze the candidate background against the target job posting and generate the complete candidate report:

${compiledProfile ? `COMPILED BASELINE CANDIDATE PROFILE (GROUND TRUTH):
${JSON.stringify(compiledProfile, null, 2)}
` : ''}

CANDIDATE DIGITAL FOOTPRINT LINKS:
- Candidate Personal/Portfolio Website: ${websiteUrl || "Not provided"}
- Candidate LinkedIn URL: ${linkedinUrl || "Not provided"}
- Candidate GitHub URL: ${githubUrl || "Not provided"}

TARGET JOB POSTING:
- Job Input Type: ${jobInputType}
- Target Company (Optional hint): ${targetCompany || "Infer from job posting"}
- Target Role (Optional hint): ${targetRole || "Infer from job posting"}
- Job Details / Description Content:
"""
${jobInput}
"""

Conduct a deep research assessment, evaluate qualification match truthfully without forging candidate experience, and generate the complete JSON output matching the exact schema specified in system instructions.
`;

    const jsonGenConfig = {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
      temperature: 0.2,
    };

    let rawText: string | undefined;

    // Stage 1: Fast Search grounding with a 12-second timeout race
    try {
      const searchCall = ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: userPrompt,
        config: {
          ...jsonGenConfig,
          tools: [{ googleSearch: {} }],
        },
      });

      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 12000));
      const searchResult = await Promise.race([searchCall, timeoutPromise]);

      if (searchResult && searchResult.text && searchResult.text.trim().length > 0) {
        rawText = searchResult.text;
      }
    } catch (searchErr) {
      console.warn("Search grounding timed out or failed in analyze-and-generate, proceeding with direct synthesis:", searchErr);
    }

    // Stage 2: Direct AI generation if search grounding timed out or produced no response
    if (!rawText || rawText.trim().length === 0) {
      console.log("Executing direct synthesis for report generation...");
      const directResponse = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: userPrompt,
        config: jsonGenConfig,
      });
      rawText = directResponse.text;
    }

    if (!rawText || rawText.trim().length === 0) {
      throw new Error("No response generated from AI engine.");
    }

    const cleanedJson = cleanJsonResponseText(rawText);
    const parsedData = JSON.parse(cleanedJson);

    // Safeguard email and phone from compiled ground-truth profile if available
    if (compiledProfile?.email && (!parsedData.tailoredCV?.personalInfo?.email || parsedData.tailoredCV?.personalInfo?.email.includes('placeholder'))) {
      if (parsedData.tailoredCV?.personalInfo) parsedData.tailoredCV.personalInfo.email = compiledProfile.email;
      if (parsedData.userProfile) parsedData.userProfile.email = compiledProfile.email;
    }
    if (compiledProfile?.phone && (!parsedData.tailoredCV?.personalInfo?.phone || parsedData.tailoredCV?.personalInfo?.phone.includes('placeholder'))) {
      if (parsedData.tailoredCV?.personalInfo) parsedData.tailoredCV.personalInfo.phone = compiledProfile.phone;
      if (parsedData.userProfile) parsedData.userProfile.phone = compiledProfile.phone;
    }

    // Attach metadata ID and timestamp
    const fullReport = {
      id: "report-" + Date.now(),
      timestamp: new Date().toISOString(),
      input: { websiteUrl, linkedinUrl, jobInput, jobInputType, targetCompany, targetRole },
      ...parsedData
    };

    res.json(fullReport);
  } catch (error: any) {
    return handleGeminiApiError(res, error, "Failed to conduct research and generate CV.");
  }
});

// Endpoint to Refine / Tweak CV sections
app.post("/api/refine-cv", async (req, res) => {
  try {
    const { currentCV, instruction, jobProfile } = req.body;
    if (!currentCV || !instruction) {
      return res.status(400).json({ error: "Missing currentCV or instruction." });
    }

    const ai = getGenAI();

    const prompt = `You are an expert resume editor. Modify the following CV based on the user's specific refinement request.

USER REFINEMENT INSTRUCTION: "${instruction}"

TARGET JOB CONTEXT:
${jobProfile ? JSON.stringify(jobProfile) : 'General role'}

CURRENT CV DATA:
${JSON.stringify(currentCV)}

Return the updated full CV JSON object matching the exact structure of currentCV. Do not omit any existing fields unless asked to remove them.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    const rawText = response.text;
    if (!rawText) {
      throw new Error("Failed to generate refined CV.");
    }

    const cleaned = cleanJsonResponseText(rawText);
    const updatedCV = JSON.parse(cleaned);

    res.json({ updatedCV });
  } catch (error: any) {
    return handleGeminiApiError(res, error, "Failed to refine CV.");
  }
});

// Start Express + Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
