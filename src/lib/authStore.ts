import { UserAccount, SavedCVItem, FullAnalysisReport } from '../types';

const USERS_STORAGE_KEY = 'blackapple_users_db';
const CURRENT_USER_KEY = 'blackapple_current_user';
const CVS_STORAGE_PREFIX = 'blackapple_user_cvs_';

// Pre-seeded demo user
const DEMO_USER: UserAccount = {
  id: 'usr-demo-101',
  name: 'Alex Vance',
  email: 'alex@blackapple.ai',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  createdAt: new Date().toISOString(),
};

// Initial sample CV for demo user
const INITIAL_DEMO_CV: SavedCVItem = {
  id: 'cv-blackapple-demo-1',
  userId: 'usr-demo-101',
  title: 'Principal Engineer @ Tech Corp',
  company: 'Tech Corp',
  role: 'Principal Engineer',
  updatedAt: new Date().toISOString(),
  qualificationScore: 92,
  templateStyle: 'blackapple',
  stylingConfig: {
    fontFamily: 'sans',
    accentColor: '#00FF41',
    density: 'normal',
    paperBg: 'white',
    borderStyle: 'solid',
    photoShape: 'circle',
  },
  tailoredCV: {
    personalInfo: {
      fullName: 'Alex Vance',
      professionalTitle: 'Principal Full Stack Architect & Technical Leader',
      email: 'alex.vance@blackapple.io',
      phone: '+1 (555) 019-2834',
      location: 'San Francisco, CA',
      linkedin: 'linkedin.com/in/alexvance',
      github: 'github.com/alexvance',
      website: 'alexvance.dev',
      summary: 'Passionate Principal Architect with 10+ years of experience leading distributed cloud engines, AI agent workflows, and high-concurrency Node/TypeScript platforms.',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      showPhoto: true,
      links: [
        { id: 'l1', label: 'GitHub Repository', url: 'https://github.com/alexvance', platform: 'github' },
        { id: 'l2', label: 'LinkedIn Profile', url: 'https://linkedin.com/in/alexvance', platform: 'linkedin' },
        { id: 'l3', label: 'Personal Portfolio', url: 'https://alexvance.dev', platform: 'portfolio' },
      ],
    },
    skills: {
      coreSpecialties: ['Distributed Systems', 'LLM Agentic Pipelines', 'React & TypeScript', 'System Architecture'],
      technicalTools: ['Node.js', 'PostgreSQL', 'Docker', 'Vite', 'TailwindCSS', 'Express'],
      softDomainSkills: ['Executive Leadership', 'Product Strategy', 'Cross-Functional Engineering'],
    },
    experience: [
      {
        id: 'exp-1',
        company: 'BlackApple Technologies',
        role: 'Principal Software Architect',
        period: '2022 — Present',
        location: 'San Francisco, CA',
        bullets: [
          'Spearheaded the redesign of a high-throughput microservices backend handling 4M+ daily API requests with 99.99% SLA uptime.',
          'Integrated Gemini AI deep research agents into the core product suite, accelerating customer research workflows by 70%.',
          'Mentored 12 senior engineers across full-stack TypeScript, CI/CD deployment, and architecture best practices.',
        ],
      },
      {
        id: 'exp-2',
        company: 'Vanguard Systems',
        role: 'Lead Full Stack Engineer',
        period: '2019 — 2022',
        location: 'New York, NY',
        bullets: [
          'Engineered real-time web socket dashboards and distributed data pipelines processing 50K event metrics/sec.',
          'Reduced web application initial bundle size by 45% using code-splitting and optimized Vite server setups.',
        ],
      },
    ],
    education: [
      {
        id: 'edu-1',
        degree: 'B.S. in Computer Science',
        institution: 'Stanford University',
        year: '2015 — 2019',
        details: 'Focused on Distributed Algorithms and Machine Learning',
      },
    ],
    projects: [
      {
        id: 'proj-1',
        name: 'BlackApple Agentic Engine',
        role: 'Creator & Lead Developer',
        description: 'Autonomous web search & CV synthesis agent built with Node.js and Gemini Flash LLM.',
        technologies: ['TypeScript', 'Express', 'Gemini AI', 'Tailwind'],
        highlights: ['Processes multi-page job postings and outputs custom PDF-ready CVs in under 5 seconds.'],
        link: 'https://github.com/alexvance/blackapple-agent',
      },
    ],
    certifications: ['AWS Certified Solutions Architect — Professional', 'Google Cloud Professional Cloud Architect'],
  },
};

// Initialize Users DB in localStorage
function getUsersDB(): UserAccount[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      const initial = [DEMO_USER];
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return [DEMO_USER];
  }
}

function saveUsersDB(users: UserAccount[]) {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save users DB:', e);
  }
}

export function getCurrentUser(): UserAccount {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to get current user:', e);
  }
  // Default to demo user if not logged in
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(DEMO_USER));
  return DEMO_USER;
}

export function setCurrentUser(user: UserAccount | null): void {
  if (!user) {
    localStorage.removeItem(CURRENT_USER_KEY);
  } else {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  }
}

export function signOut(): void {
  localStorage.removeItem(CURRENT_USER_KEY);
}

export function clearUserCVs(userId: string): void {
  try {
    localStorage.removeItem(CVS_STORAGE_PREFIX + userId);
  } catch (e) {
    console.error('Failed to clear user CVs:', e);
  }
}

export function loginUser(email: string): UserAccount {
  const users = getUsersDB();
  let existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!existing) {
    // Create automatic user account for seamless experience
    const namePart = email.split('@')[0];
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    existing = {
      id: 'usr-' + Date.now(),
      name: formattedName,
      email: email.toLowerCase(),
      createdAt: new Date().toISOString(),
    };
    users.push(existing);
    saveUsersDB(users);
  }
  setCurrentUser(existing);
  return existing;
}

export function registerUser(name: string, email: string): UserAccount {
  const users = getUsersDB();
  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    setCurrentUser(existing);
    return existing;
  }
  const newUser: UserAccount = {
    id: 'usr-' + Date.now(),
    name,
    email: email.toLowerCase(),
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  saveUsersDB(users);
  setCurrentUser(newUser);
  return newUser;
}

export function updateUserAccount(userId: string, updates: Partial<UserAccount>): UserAccount {
  const users = getUsersDB();
  const idx = users.findIndex((u) => u.id === userId);
  let updatedUser: UserAccount;
  if (idx >= 0) {
    users[idx] = { ...users[idx], ...updates };
    updatedUser = users[idx];
  } else {
    updatedUser = {
      id: userId,
      name: updates.name || 'User',
      email: updates.email || '',
      ...updates,
      createdAt: updates.createdAt || new Date().toISOString(),
    };
    users.push(updatedUser);
  }
  saveUsersDB(users);
  setCurrentUser(updatedUser);
  return updatedUser;
}

// User-Specific Saved CVs API
export function getUserCVs(userId: string): SavedCVItem[] {
  try {
    const key = CVS_STORAGE_PREFIX + userId;
    const raw = localStorage.getItem(key);
    if (!raw) {
      if (userId === DEMO_USER.id) {
        // Seed demo user with initial CV
        const seed = [INITIAL_DEMO_CV];
        localStorage.setItem(key, JSON.stringify(seed));
        return seed;
      }
      return [];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveUserCV(userId: string, reportOrItem: FullAnalysisReport | SavedCVItem): SavedCVItem[] {
  const cvItem: SavedCVItem = 'jobProfile' in reportOrItem
    ? convertReportToSavedCV(reportOrItem, userId)
    : reportOrItem;

  const currentCVs = getUserCVs(userId);
  const existingIdx = currentCVs.findIndex((item) => item.id === cvItem.id);
  
  let updated: SavedCVItem[];
  if (existingIdx >= 0) {
    updated = [...currentCVs];
    updated[existingIdx] = { ...cvItem, updatedAt: new Date().toISOString() };
  } else {
    updated = [{ ...cvItem, updatedAt: new Date().toISOString() }, ...currentCVs];
  }

  try {
    localStorage.setItem(CVS_STORAGE_PREFIX + userId, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save user CV:', e);
  }
  return updated;
}

export function deleteUserCV(userId: string, cvId: string): SavedCVItem[] {
  const currentCVs = getUserCVs(userId);
  const updated = currentCVs.filter((item) => item.id !== cvId);
  try {
    localStorage.setItem(CVS_STORAGE_PREFIX + userId, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete user CV:', e);
  }
  return updated;
}

// Helper to convert FullAnalysisReport to SavedCVItem
export function convertReportToSavedCV(report: FullAnalysisReport, userId: string): SavedCVItem {
  return {
    id: report.id,
    userId,
    title: `${report.jobProfile.roleTitle} @ ${report.jobProfile.company}`,
    company: report.jobProfile.company,
    role: report.jobProfile.roleTitle,
    updatedAt: report.timestamp,
    qualificationScore: report.qualification.qualificationScore,
    tailoredCV: report.tailoredCV,
    stylingConfig: report.stylingConfig || {
      fontFamily: 'sans',
      accentColor: '#00FF41',
      density: 'normal',
      paperBg: 'white',
      borderStyle: 'solid',
      photoShape: 'circle',
    },
    templateStyle: report.templateStyle || 'blackapple',
    coverLetter: report.coverLetter,
    interviewPrep: report.interviewPrep,
    input: report.input,
  };
}
