export type ThemeMode = 'dark' | 'light';

export interface Project {
  id: string;
  number: string;
  title: string;
  tagline: string;
  shortDescription: string;
  longDescription: string;
  category: 'AI & Fullstack' | 'E-commerce' | 'Real Estate' | 'Clean Energy' | 'Digital Experience' | 'Mobile App' | 'Cloud & DevOps' | (string & {});
  image: string;
  technologies: string[];
  liveUrl: string;
  githubUrl: string;
  featured: boolean;
  year: number;
  role: string;
  duration: string;
  challenge: string;
  solution: string;
  features: string[];
  metrics: {
    label: string;
    value: string;
  }[];
  deletedAt?: number; // Timestamp when deleted (null means not deleted)
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
