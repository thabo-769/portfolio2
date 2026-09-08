export type ThemeMode = 'dark' | 'light';

export type ProjectCategory = 'Personal' | 'Business' | 'Mobile' | 'Gift' | 'Other';
export type ProjectStatus = 'Published' | 'Draft' | 'Archived';
export type SkillCategory =
  | 'Programming'
  | 'Frontend'
  | 'Backend'
  | 'Mobile'
  | 'Databases'
  | 'Tools & DevOps'
  | 'Cloud'
  | 'Design'
  | 'Other';
export type MessageStatus = 'unread' | 'read' | 'archived';
export type AnalyticsEventType =
  | 'portfolio_view'
  | 'project_view'
  | 'github_click'
  | 'live_click'
  | 'contact_submission'
  | 'referral_view';

export interface Project {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  category: ProjectCategory | (string & {});
  technologies: string[];
  image: string; // Main thumbnail / hero image
  imagePath?: string; // Firebase Storage path used for cleanup
  images: string[]; // Additional gallery images
  githubUrl: string;
  liveUrl: string;
  status: ProjectStatus | (string & {});
  featured: boolean;
  displayOrder: number;
  completionDate: string; // ISO date
  client: string; // Optional client / company name
  projectType: string; // e.g. Full Stack, 3D Experience
  features: string[];
  challenges: string;
  solutions: string;
  results: string;
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null; // Timestamp when soft-deleted (null = active)
  isDeleted: boolean;
}

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory | (string & {});
  proficiency: 'Core' | 'Expert' | 'Advanced';
  years: number;
  projectsCount: number;
  description: string;
  iconName: string;
  icon?: string;
  technologies?: string[];
  featured?: boolean;
  displayOrder?: number;
  createdAt?: number;
  updatedAt?: number;
}

export interface Referral {
  id: string;
  name: string;
  clientName?: string;
  role: string;
  position?: string;
  organization: string;
  company?: string;
  avatarUrl?: string;
  clientImage?: string;
  message: string;
  testimonial?: string;
  date: string;
  relationship: string;
  rating: number;
  verified: boolean;
  featured?: boolean;
  displayOrder?: number;
  createdAt?: number;
  updatedAt?: number;
  deletedAt?: number | null;
  isDeleted?: boolean;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export interface ContactMessage {
  id: string;
  senderName: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: MessageStatus;
  read: boolean;
  archived: boolean;
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
}

export interface MediaAsset {
  id: string;
  name: string;
  url: string;
  alt: string;
  category: 'project' | 'profile' | 'referral' | 'logo' | 'icon' | 'other';
  mimeType: string;
  size: number;
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
  isDeleted: boolean;
}

export interface PortfolioHomeContent {
  headline: string;
  subtitle: string;
  introduction: string;
  ctaText: string;
  availabilityStatus: string;
}

export interface PortfolioAboutContent {
  description: string;
  biography: string;
  introduction: string;
  otherInfo: string;
}

export interface PortfolioContactLink {
  label: string;
  url: string;
}

export interface PortfolioContactContent {
  email: string;
  phone: string;
  socials: PortfolioContactLink[];
  availabilityStatus: string;
}

export interface PortfolioContent {
  id: string;
  portfolioName: string;
  home: PortfolioHomeContent;
  about: PortfolioAboutContent;
  contact: PortfolioContactContent;
  updatedAt: number;
}

export interface PortfolioSettings {
  id: string;
  portfolioName: string;
  email: string;
  phone: string;
  availabilityStatus: string;
  socialLinks: PortfolioContactLink[];
  darkModeDefault: ThemeMode;
  dashboardPreferences: {
    compactMode: boolean;
    showAdvanced: boolean;
  };
  updatedAt: number;
}

export interface ActivityLogEntry {
  id: string;
  action: string;
  item: string;
  itemType: string;
  user: string;
  createdAt: number;
  details?: string;
}

export interface AnalyticsEvent {
  id: string;
  type: AnalyticsEventType;
  projectId?: string;
  label?: string;
  createdAt: number;
  metadata?: Record<string, string>;
}

export interface AnalyticsSummary {
  portfolioViews: number;
  projectViews: number;
  githubClicks: number;
  liveClicks: number;
  contactSubmissions: number;
  referralViews: number;
  mostViewedProjects: Array<{
    projectId: string;
    name: string;
    views: number;
  }>;
  lastUpdated: number | null;
}
