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

// Endpoint to Fetch and Parse User Profile from Website, LinkedIn, GitHub
app.post(["/api/fetch-user-profile", "/api/fetch-linkedin-profile"], async (req, res) => {
  try {
    const { websiteUrl, linkedinUrl, githubUrl } = req.body;

    const hasWebsite = websiteUrl && websiteUrl.trim().length > 0;
    const hasLinkedin = linkedinUrl && linkedinUrl.trim().length > 0;
    const hasGithub = githubUrl && githubUrl.trim().length > 0;

    if (!hasWebsite && !hasLinkedin && !hasGithub) {
      return res.status(400).json({
        error: "At least one candidate profile URL (Personal Website, LinkedIn, or GitHub) is required."
      });
    }

    const ai = getGenAI();

    const systemPrompt = `You are a professional executive talent intelligence researcher for BlackApple.
Your task is to fetch, research, crawl, and compile a candidate's realistic professional background from ALL provided digital footprint links — with SPECIAL FOCUS on extracting deep professional experience, projects, skills, achievements, and career history from their personal website/portfolio URL, alongside their LinkedIn profile and code repositories.

CRITICAL FOCUS ON PERSONAL WEBSITE & DIGITAL FOOTPRINT:
- Perform deep web search on the candidate's personal portfolio/website URL (${websiteUrl || "Not provided"}) to find bio, about page, case studies, project work, previous employers, and core skillsets.
- Cross-reference with their LinkedIn profile (${linkedinUrl || "Not provided"}) and GitHub repositories (${githubUrl || "Not provided"}).

STRICT ACCURACY & ANTI-FORGERY MANDATE:
- Extract and compile ONLY real, verified public experience available from the provided profile links and web footprint.
- DO NOT FORGE, fabricate, or lie about user experience. Do not invent fake companies, fake job titles, or fake degrees.
- If certain details (e.g. graduation year or company dates) are unavailable, keep them realistic and clean based on public context without inventing false credentials.

Return your response strictly in JSON adhering to this schema:
{
  "userProfile": {
    "name": "string (Candidate's full name)",
    "headline": "string (Professional headline / title)",
    "location": "string (Location or Remote)",
    "summary": "string (Executive summary)",
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
    "onlinePresenceSummary": "string (Summary of public profile research findings)"
  }
}`;

    const userPrompt = `
Research and parse professional experience from ALL candidate links provided:
- Personal / Portfolio Website (SPECIAL FOCUS & PRIMARY ATTENTION): ${websiteUrl || "Not provided"}
- LinkedIn Public Profile: ${linkedinUrl || "Not provided"}
- GitHub Repositories URL: ${githubUrl || "Not provided"}

Search Google for public details, portfolio projects, about pages, bio pages, case studies, and work experience associated with these links (especially the personal website). Compile the baseline userProfile JSON object.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    });

    const rawText = response.text;
    if (!rawText) {
      throw new Error("No profile data generated.");
    }

    const cleaned = cleanJsonResponseText(rawText);
    const parsed = JSON.parse(cleaned);

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

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const rawText = response.text;
    if (!rawText) {
      throw new Error("No response generated from AI engine.");
    }

    const cleanedJson = cleanJsonResponseText(rawText);
    const parsedData = JSON.parse(cleanedJson);

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
