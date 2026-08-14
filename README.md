# AlamakCVLagi — AI-Powered Deep Research CV Studio & Career Intelligence

> **AlamakCVLagi** is an AI-driven career intelligence suite that extracts your digital footprint, analyzes target job descriptions, evaluates qualification fit, and generates tailored, truth-grounded CVs, cover letters, and interview preparation guides.

---

## 🌟 Key Features

### 1. 🔍 Deep Digital Footprint Ingestion
* **Automated Website Crawler**: Scrapes candidate personal portfolios and websites, resolving single-page application (SPA) JavaScript bundles, metadata, and subpages (`/about`, `/projects`, `/experience`).
* **GitHub Footprint Extraction**: Direct integration with GitHub's public API to index public repositories, primary languages, commit focus, and project abstracts.
* **Ground-Truth Profile Memory**: Keeps a persistent master profile (experience, skills, credentials, contact details) to guarantee that all generated resumes remain strictly grounded in reality with zero hallucinated experiences.

### 2. 📊 Rigorous Job Match & Qualification Scorecard
* **Deep JD Analysis**: Extracts hard requirements, soft skills, seniority indicators, and company culture values from any job description or URL.
* **Match Score & Verdict (0–100%)**: Computes an objective alignment score categorized into match tiers (*Strong Match*, *Moderate Match*, *Skill Gap*).
* **Requirement Evidence Mapping**: Breaks down JD requirements against candidate achievements to show exactly where qualifications match and where skill gaps exist.
* **Strategic Standout Advice**: Actionable advice on how to emphasize unique strengths for the target role.

### 3. 🎨 Interactive CV Customizer & Studio
* **4 Professional Themes**:
  * **Executive Navy**: Corporate leadership and enterprise roles.
  * **Tech Emerald**: Modern software, startup, and engineering roles.
  * **Clean Minimal Slate**: High-contrast, typography-focused layout.
  * **Modern Crimson / Burgundy**: Creative, consulting, and design disciplines.
* **Real-time Formatting Controls**: Toggle candidate photos, customize font scales, line spacing, layout density, and contact chips.
* **Full In-Browser Editing**: Add, update, reorder, or delete bullet points, skill groups, work history, and project entries.
* **AI Bullet Refiner**: Prompt the AI directly to rewrite bullets with high-impact action verbs, quantifiable metrics, or concise phrasing.

### 4. 📄 Multi-Format Export Options
* **Print-Ready PDF**: Browser-optimized pagination stylesheets configured for standard A4/Letter formats with zero margin clipping.
* **LaTeX Source (.tex)**: Clean, compilable LaTeX markup ready for Overleaf or local `pdflatex` compilation.
* **Raw JSON Export**: Machine-readable CV structure for custom developer workflows.

### 5. ✍️ Tailored Cover Letter & Interview Preparation
* **Role-Matched Cover Letter**: Generates a targeted, 3-paragraph executive cover letter customized to the company mission and target requirements.
* **Interview Intelligence Drawer**:
  * Predicts high-probability technical and behavioral interview questions.
  * Provides breakdown of *why* hiring managers ask each question.
  * Supplies suggested STAR (Situation, Task, Action, Result) answers.
  * Recommends smart questions to ask the interview panel.

### 6. 🔐 Cloud Sync & Multi-Device History
* **Firebase Authentication**: Email/password and Google Sign-in.
* **Firestore Cloud Persistence**: Securely save, retrieve, version, and manage generated CVs and master profiles across devices with granular Firestore security rules.
* **Offline-Ready Local Fallback**: Unauthenticated guest mode stores data safely in local storage until an account is linked.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Motion |
| **Icons & UI** | Lucide React, Canvas Confetti |
| **Backend & API** | Node.js, Express, `tsx`, `esbuild` |
| **AI & LLM** | `@google/genai` (Google Gemini 2.5/3.7 Flash models) with Google Search grounding |
| **Database & Auth** | Firebase Authentication, Google Cloud Firestore |

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: v20+ recommended
* **npm**: v9+
* **Gemini API Key**: Required for AI synthesis and research parsing

### 1. Clone & Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file in the project root (see `.env.example`):
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Development Server
Start the development server (runs on `http://localhost:3000`):
```bash
npm run dev
```

### 4. Production Build
Compile client assets and server bundle:
```bash
npm run build
npm start
```

---

## 🗺️ Future Roadmap & Planned Features

* [ ] **Application Pipeline (Kanban Board)**: Track submitted applications (Wishlist → Applied → Interview → Offer) linked directly to the specific tailored CV version.
* [ ] **Recruiter Outreach Snippets**: 1-click generation of high-converting LinkedIn InMail messages and cold emails tailored to hiring managers.
* [ ] **Interactive STAR Story Builder**: A guided prompt system to turn raw project notes into structured interview talking points.
* [ ] **Microsoft Word (.docx) & Plain-Text ATS Export**: One-click download for legacy enterprise job application portals.
* [ ] **LinkedIn PDF Profile Import**: Instant parsing of exported LinkedIn profiles into the ground-truth profile builder.
* [ ] **Skill Gap & Upskilling Recommendations**: Suggest specific certifications, open-source projects, or tech stacks to bridge gaps for dream roles.
* [ ] **Interactive Live Mock Interview Simulator**: Real-time AI voice/chat mock interview sessions based on the generated interview prep guide.

---

## 🔒 Security & Privacy

* **Server-Side API Proxying**: All Gemini API calls and external web crawlers execute strictly through secure Express backend routes (`/api/*`), ensuring API keys are never exposed client-side.
* **Strict Firestore Rules**: All database read/write permissions enforce user-ownership checks (`request.auth.uid == userId`) to prevent cross-account data access.
* **Anti-Hallucination Policy**: Resume generation strictly prioritizes verified candidate data and explicitly flags missing qualifications rather than fabricating unearned career history.

---

## 📄 License
This project is proprietary. All rights reserved.
