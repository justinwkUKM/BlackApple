export interface SavedUserProfile {
  userProfile: UserProfileData;
  urls: {
    websiteUrl?: string;
    linkedinUrl?: string;
    githubUrl?: string;
  };
  lastUpdated: string;
}

export interface ResearchInput {
  websiteUrl: string;
  linkedinUrl: string;
  githubUrl?: string;
  jobInput: string;
  jobInputType: 'text' | 'url';
  targetCompany?: string;
  targetRole?: string;
  compiledProfile?: UserProfileData;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface CustomLink {
  id: string;
  label: string;
  url: string;
  platform: 'github' | 'linkedin' | 'portfolio' | 'twitter' | 'dribbble' | 'custom';
}

export interface StylingConfig {
  fontFamily: 'sans' | 'serif' | 'mono' | 'display';
  accentColor: string; // hex or tailwind color
  density: 'compact' | 'normal' | 'spacious';
  paperBg: 'white' | 'ivory' | 'dark';
  borderStyle: 'solid' | 'minimal' | 'double' | 'rounded';
  photoShape: 'circle' | 'square' | 'rounded';
}

export type TemplateStyle = 'blackapple' | 'executive' | 'ivory' | 'modern' | 'ats' | 'portfolio' | 'classic';

export interface UserProfileData {
  name: string;
  headline: string;
  location: string;
  email?: string;
  phone?: string;
  summary: string;
  topSkills: string[];
  experience: Array<{
    company: string;
    role: string;
    period: string;
    description: string;
    keyAchievements: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    link?: string;
  }>;
  onlinePresenceSummary: string;
}

export interface JobProfileData {
  company: string;
  roleTitle: string;
  location: string;
  employmentType: string;
  summary: string;
  requiredSkills: string[];
  preferredSkills: string[];
  keyResponsibilities: string[];
  companyCultureValues: string[];
}

export interface QualificationResult {
  qualificationScore: number; // 0 to 100
  isQualified: boolean;
  matchTier: 'Strong Match' | 'Moderate Match' | 'Growth Candidate' | 'Mismatch';
  summaryVerdict: string;
  keyStrengths: string[];
  skillGaps: string[];
  matchingRequirements: Array<{
    requirement: string;
    userEvidence: string;
    status: 'met' | 'partial' | 'missing';
  }>;
  recommendationsToStandOut: string[];
}

export interface TailoredCV {
  personalInfo: {
    fullName: string;
    professionalTitle: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    github?: string;
    website: string;
    summary: string;
    photoUrl?: string;
    showPhoto?: boolean;
    links?: CustomLink[];
  };
  skills: {
    coreSpecialties: string[];
    technicalTools: string[];
    softDomainSkills: string[];
  };
  experience: Array<{
    id: string;
    company: string;
    role: string;
    period: string;
    location?: string;
    bullets: string[];
  }>;
  education: Array<{
    id: string;
    degree: string;
    institution: string;
    year: string;
    details?: string;
  }>;
  projects: Array<{
    id: string;
    name: string;
    role: string;
    description: string;
    technologies: string[];
    highlights: string[];
    link?: string;
  }>;
  certifications?: string[];
}

export interface CoverLetter {
  recipientTitle: string;
  companyName: string;
  salutation: string;
  openingParagraph: string;
  bodyParagraphs: string[];
  closingParagraph: string;
  signOff: string;
}

export interface InterviewPrep {
  roleFocus: string;
  likelyQuestions: Array<{
    question: string;
    whyAsked: string;
    suggestedAnswer: string;
  }>;
  questionsToAskEmployer: string[];
  keyTalkingPoints: string[];
}

export interface SavedCVItem {
  id: string;
  userId: string;
  title: string;
  company: string;
  role: string;
  updatedAt: string;
  qualificationScore?: number;
  tailoredCV: TailoredCV;
  stylingConfig: StylingConfig;
  templateStyle: TemplateStyle;
  coverLetter?: CoverLetter;
  interviewPrep?: InterviewPrep;
  input?: ResearchInput;
}

export interface FullAnalysisReport {
  id: string;
  userId?: string;
  timestamp: string;
  input: ResearchInput;
  userProfile: UserProfileData;
  jobProfile: JobProfileData;
  qualification: QualificationResult;
  tailoredCV: TailoredCV;
  coverLetter: CoverLetter;
  interviewPrep: InterviewPrep;
  stylingConfig?: StylingConfig;
  templateStyle?: TemplateStyle;
}

