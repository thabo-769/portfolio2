import type { PortfolioContent, PortfolioSettings, Skill } from '../types';

export const defaultPortfolioContent: PortfolioContent = {
  id: 'portfolio-content',
  portfolioName: 'Thabo Tshabangu',
  home: {
    headline: 'THABO\nTSHABANGU',
    subtitle: 'SOFTWARE DEVELOPER',
    introduction:
      'Engineering resilient full-stack systems, spatial 3D WebGL interfaces, and high-performance mobile applications with strategic architectural rigor.',
    ctaText: 'Explore Projects',
    availabilityStatus: 'Available for new opportunities',
  },
  about: {
    description:
      "Hi, I'm Thabo Tshabangu - a software developer with 3+ years of experience engineering fast web applications, interactive 3D WebGL scenes, and cross-platform mobile products.",
    biography:
      'I focus on clean architecture, measured execution, and interfaces that feel polished from the first interaction to the last. My work blends product thinking with strong visual craft.',
    introduction:
      'I build modern React, TypeScript, and Node.js systems that balance speed, resilience, and thoughtful design.',
    otherInfo:
      'Open to full-time senior software roles, freelance work, and technical consulting engagements.',
  },
  contact: {
    email: 'thabolanez4@gmail.com',
    phone: '+27 000 000 000',
    availabilityStatus: 'Open to new projects',
    socials: [
      { label: 'GitHub', url: 'https://github.com/thabotshabangu' },
      { label: 'LinkedIn', url: 'https://linkedin.com/in/thabo-tshabangu' },
      { label: 'Email', url: 'mailto:thabolanez4@gmail.com' },
    ],
  },
  updatedAt: Date.now(),
};

export const defaultPortfolioSettings: PortfolioSettings = {
  id: 'portfolio-settings',
  portfolioName: 'Thabo Tshabangu',
  email: 'thabolanez4@gmail.com',
  phone: '+27 000 000 000',
  availabilityStatus: 'Available for new opportunities',
  socialLinks: [
    { label: 'GitHub', url: 'https://github.com/thabotshabangu' },
    { label: 'LinkedIn', url: 'https://linkedin.com/in/thabo-tshabangu' },
  ],
  darkModeDefault: 'dark',
  dashboardPreferences: {
    compactMode: false,
    showAdvanced: true,
  },
  updatedAt: Date.now(),
};

export const defaultSkills: Skill[] = [
  {
    id: 'skill-react',
    name: 'React 19',
    category: 'Frontend',
    proficiency: 'Expert',
    years: 3,
    projectsCount: 8,
    description: 'Modern React interfaces, state orchestration, and responsive UI systems.',
    iconName: 'react',
    technologies: ['React', 'TypeScript', 'Vite'],
    featured: true,
    displayOrder: 1,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'skill-typescript',
    name: 'TypeScript',
    category: 'Programming',
    proficiency: 'Expert',
    years: 3,
    projectsCount: 7,
    description: 'Strictly typed frontends and backend contracts with reliable DX.',
    iconName: 'typescript',
    technologies: ['TypeScript'],
    featured: true,
    displayOrder: 2,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'skill-node',
    name: 'Node.js',
    category: 'Backend',
    proficiency: 'Advanced',
    years: 3,
    projectsCount: 6,
    description: 'API layers, authentication, and data workflows with modern tooling.',
    iconName: 'node',
    technologies: ['Node.js', 'Express'],
    displayOrder: 3,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'skill-three',
    name: 'Three.js',
    category: 'Frontend',
    proficiency: 'Advanced',
    years: 2,
    projectsCount: 4,
    description: 'Immersive WebGL scenes and motion-rich interfaces for portfolio experiences.',
    iconName: 'three',
    technologies: ['Three.js', 'WebGL'],
    displayOrder: 4,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];
