import { ResearchInput } from '../types';

export interface PresetSample {
  id: string;
  name: string;
  description: string;
  category: string;
  input: ResearchInput;
}

export const PRESET_SAMPLES: PresetSample[] = [
  {
    id: 'tech-senior-eng',
    name: 'Senior Full-Stack Engineer @ Stripe',
    description: 'Candidate with modern React/TypeScript/Node expertise applying for Senior Infra & Product Engineer role at Stripe.',
    category: 'Engineering',
    input: {
      websiteUrl: 'https://alexchen.dev',
      linkedinUrl: 'https://linkedin.com/in/alexchen-tech',
      jobInputType: 'text',
      jobInput: `Role: Senior Full-Stack Engineer - Developer Platform
Company: Stripe
Location: Remote / San Francisco, CA

About the Role:
We are looking for a Senior Full-Stack Engineer to build resilient developer tools, APIs, and dashboard interfaces that power payments for millions of businesses globally.

Key Responsibilities:
- Design, build, and maintain scalable microservices in TypeScript, Go, and Ruby.
- Craft high-performance, accessible Web UIs in React, Tailwind, and Next.js.
- Optimize high-throughput payment API endpoints and database operations (PostgreSQL, Redis).
- Lead architectural decisions and mentor junior to mid-level engineers.

Requirements:
- 5+ years of experience building production web applications.
- Deep expertise with modern TypeScript/React and REST/GraphQL APIs.
- Proven track record of system design, performance tuning, and automated testing.
- Strong product intuition and developer-centric mindset.

Preferred:
- Experience in fintech, payment infrastructure, or developer tools.
- Open-source contributions or technical writing.`,
      targetCompany: 'Stripe',
      targetRole: 'Senior Full-Stack Engineer'
    }
  },
  {
    id: 'ai-product-manager',
    name: 'AI Product Manager @ Anthropic',
    description: 'Product leader with AI agent/LLM experience applying for Senior AI PM at Anthropic.',
    category: 'Product',
    input: {
      websiteUrl: 'https://maya-pm.com',
      linkedinUrl: 'https://linkedin.com/in/mayavargas-pm',
      jobInputType: 'text',
      jobInput: `Role: Senior Product Manager - AI & Claude Developer Platform
Company: Anthropic
Location: San Francisco, CA

About the Role:
Anthropic is seeking an experienced AI Product Manager to define the developer platform roadmap for Claude APIs, agentic capabilities, and developer SDKs.

Responsibilities:
- Define product strategy and launch groundbreaking developer tools for GenAI models.
- Collaborate with AI research scientists, engineering, and enterprise customers to identify key platform gaps.
- Drive key metrics around API developer adoption, prompt engineering tools, and latency/reliability satisfaction.
- Create clear RFCs, user journey maps, and quantitative success frameworks.

Qualifications:
- 4+ years in product management at a high-growth SaaS, developer tools, or AI startup.
- Demonstrated technical depth in LLMs, developer APIs, prompt evaluation, or agentic frameworks.
- Data-driven mindset with experience analyzing product telemetry and conducting developer interviews.
- Stellar written and verbal communication skills.`,
      targetCompany: 'Anthropic',
      targetRole: 'Senior AI Product Manager'
    }
  },
  {
    id: 'lead-product-designer',
    name: 'Lead Product Designer @ Linear',
    description: 'Design specialist with craft focus applying for Lead Designer role at Linear.',
    category: 'Design',
    input: {
      websiteUrl: 'https://julianross.design',
      linkedinUrl: 'https://linkedin.com/in/julianross-design',
      jobInputType: 'text',
      jobInput: `Role: Lead Product Designer
Company: Linear
Location: Remote (Global)

About Linear:
Linear is building the tool for modern software development. We care deeply about craft, speed, and elegance.

Responsibilities:
- Lead the end-to-end design of core issue-tracking, project planning, and roadmapping features.
- Partner with founders and engineers to craft pixel-perfect, highly responsive interfaces.
- Design subtle micro-interactions, keyboard-first workflows, and dark-mode aesthetic systems.
- Build and maintain our design system components in Figma and code prototype environments.

Requirements:
- 6+ years designing complex desktop/web SaaS productivity applications.
- Exceptional visual design, typography, spacing, and micro-interaction skills.
- Proficiency in Figma, interactive prototyping (Framer, React/HTML/CSS), and design systems.
- Portfolio demonstrating world-class design craft and system thinking.`,
      targetCompany: 'Linear',
      targetRole: 'Lead Product Designer'
    }
  }
];
