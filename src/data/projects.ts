// Public fallback content keeps the portfolio useful while Firebase is empty or
// unavailable. Firebase records take priority whenever published projects exist.

import { Project } from '../types';

export const projectsData: Project[] = [
  {
    id: 'thabo-portfolio',
    name: 'Thabo Portfolio',
    shortDescription: 'A 3D interactive developer portfolio with a Firebase powered content dashboard.',
    description: 'A responsive developer portfolio that combines a 3D landing experience with a private dashboard for managing projects, content, analytics, and remote access workflows.',
    category: 'Personal',
    technologies: ['React', 'TypeScript', 'Vite', 'Firebase', 'Three.js'],
    image: '',
    images: [],
    githubUrl: 'https://github.com/thabo-769/Thabo-portfolio',
    liveUrl: 'https://thabo-portfolio-three.vercel.app/',
    status: 'Published',
    featured: true,
    displayOrder: 0,
    completionDate: '2026-09-05',
    client: '',
    projectType: 'Interactive portfolio',
    features: ['3D interactive hero', 'Firebase content management', 'Responsive project showcase'],
    challenges: '',
    solutions: '',
    results: '',
    createdAt: 0,
    updatedAt: 0,
    deletedAt: null,
    isDeleted: false,
  },
];
