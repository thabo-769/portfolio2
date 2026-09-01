export type ThemeMode = 'dark' | 'light';

export type ProjectCategory = 'Personal' | 'Business' | 'Mobile' | 'Gift' | 'Other';
export type ProjectStatus = 'In Progress' | 'Completed' | 'On Hold' | 'Archived';

export interface Project {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  category: ProjectCategory | (string & {});
  technologies: string[];
  image: string; // Main thumbnail / hero image
  images: string[]; // Additional gallery images
  githubUrl: string;
  liveUrl: string;
  status: ProjectStatus | (string & {});
  featured: boolean;
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
  category: 'Programming' | 'Frontend' | 'Backend' | 'Mobile' | 'Databases' | 'Tools & DevOps';
  proficiency: 'Core' | 'Expert' | 'Advanced';
  years: number;
  projectsCount: number;
  description: string;
  iconName: string;
}

export interface Referral {
  id: string;
  name: string;
  role: string;
  organization: string;
  avatarUrl?: string;
  message: string;
  date: string;
  relationship: string;
  rating: number;
  verified: boolean;
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
