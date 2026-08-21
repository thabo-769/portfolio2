import React from 'react';

export type SkillCluster = 'frontend' | 'backend' | 'mobile' | 'database' | 'tools';

export interface PuzzleEdgeConfig {
  top?: 'tab' | 'socket' | 'flat';
  right?: 'tab' | 'socket' | 'flat';
  bottom?: 'tab' | 'socket' | 'flat';
  left?: 'tab' | 'socket' | 'flat';
}

export interface SkillItem {
  id: string;
  name: string;
  shortName: string;
  cluster: SkillCluster;
  clusterLabel: string;
  level: string;
  experience: string;
  color: string;
  accentBorder: string;
  useCase: string;
  strengths: string[];
  connections: string[]; // Connected puzzle piece IDs
  edges: PuzzleEdgeConfig;
  scatter: {
    x: number;
    y: number;
    rotate: number;
  };
}

export const SKILL_CLUSTERS: { id: SkillCluster | 'all'; label: string; count: number }[] = [
  { id: 'all', label: 'Complete Arsenal', count: 14 },
  { id: 'frontend', label: 'Frontend', count: 3 },
  { id: 'backend', label: 'Backend', count: 4 },
  { id: 'mobile', label: 'Mobile', count: 3 },
  { id: 'database', label: 'Databases', count: 2 },
  { id: 'tools', label: 'Tools & DevOps', count: 2 },
];

export const puzzleSkillsData: SkillItem[] = [
  // --- FRONTEND CLUSTER ---
  {
    id: 'react',
    name: 'React.js',
    shortName: 'React 19',
    cluster: 'frontend',
    clusterLabel: 'Frontend Architecture',
    level: 'Production Mastery',
    experience: '3+ Years',
    color: '#61DAFB',
    accentBorder: '#61DAFB',
    useCase: 'Building high-performance, modular SPAs, interactive 3D WebGL user interfaces, and component design systems.',
    strengths: ['React 19 Server Actions', 'Custom Hooks & Context API', 'Virtual DOM & Fiber Engine'],
    connections: ['nextjs', 'typescript'],
    edges: { top: 'flat', right: 'tab', bottom: 'socket', left: 'flat' },
    scatter: { x: -70, y: -45, rotate: -7 },
  },
  {
    id: 'nextjs',
    name: 'Next.js',
    shortName: 'Next.js 15',
    cluster: 'frontend',
    clusterLabel: 'Frontend Architecture',
    level: 'Advanced',
    experience: '2+ Years',
    color: '#FFFFFF',
    accentBorder: '#E4E4E7',
    useCase: 'Developing full-stack web applications with App Router, hybrid SSR/SSG caching, and edge middleware optimization.',
    strengths: ['App Router & Nested Layouts', 'Incremental Static Regeneration', 'SEO & Edge Caching'],
    connections: ['react', 'typescript', 'nodejs'],
    edges: { top: 'socket', right: 'tab', bottom: 'flat', left: 'socket' },
    scatter: { x: 50, y: -60, rotate: 6 },
  },
  {
    id: 'typescript',
    name: 'JavaScript / TypeScript',
    shortName: 'TypeScript',
    cluster: 'frontend',
    clusterLabel: 'Frontend & Core Engine',
    level: 'Production Mastery',
    experience: '3+ Years',
    color: '#3178C6',
    accentBorder: '#3178C6',
    useCase: 'Writing strict, type-safe enterprise codebases with generic type systems, AST transformations, and zero runtime type bugs.',
    strengths: ['Strict Typing & Generics', 'Zod Runtime Schema Validation', 'ESNext Async & Web APIs'],
    connections: ['react', 'nextjs', 'nodejs', 'reactnative'],
    edges: { top: 'tab', right: 'socket', bottom: 'tab', left: 'socket' },
    scatter: { x: -40, y: 70, rotate: -5 },
  },

  // --- BACKEND CLUSTER ---
  {
    id: 'nodejs',
    name: 'Node.js',
    shortName: 'Node.js',
    cluster: 'backend',
    clusterLabel: 'Backend Engine',
    level: 'Senior Level',
    experience: '3+ Years',
    color: '#539E43',
    accentBorder: '#539E43',
    useCase: 'Architecting asynchronous, event-driven backends, worker queues, real-time WebSockets, and high-load microservices.',
    strengths: ['Non-blocking I/O Event Loop', 'Cluster & Worker Threads', 'Stream Processing Pipelines'],
    connections: ['nextjs', 'expressjs', 'mongodb', 'postgresql'],
    edges: { top: 'flat', right: 'tab', bottom: 'socket', left: 'socket' },
    scatter: { x: 80, y: -30, rotate: 8 },
  },
  {
    id: 'expressjs',
    name: 'Express.js',
    shortName: 'Express.js',
    cluster: 'backend',
    clusterLabel: 'Backend Engine',
    level: 'Production Mastery',
    experience: '3+ Years',
    color: '#A1A1AA',
    accentBorder: '#A1A1AA',
    useCase: 'Designing RESTful and GraphQL APIs with robust middleware pipelines, rate-limiting, and JWT authentication.',
    strengths: ['Modular Router Architecture', 'Custom Middleware & Auth Guards', 'Error Handling Boundaries'],
    connections: ['nodejs', 'python', 'mongodb'],
    edges: { top: 'socket', right: 'tab', bottom: 'tab', left: 'socket' },
    scatter: { x: -60, y: 55, rotate: -6 },
  },
  {
    id: 'python',
    name: 'Python',
    shortName: 'Python 3',
    cluster: 'backend',
    clusterLabel: 'Backend & Data',
    level: 'Advanced',
    experience: '2+ Years',
    color: '#3776AB',
    accentBorder: '#FFD438',
    useCase: 'Developing backend microservices, data processing pipelines, AI model orchestration, and automated server tasks.',
    strengths: ['AsyncIO Concurrent Tasks', 'Data Scraping & ETL Pipelines', 'AI / Gemini SDK Integration'],
    connections: ['expressjs', 'django', 'postgresql'],
    edges: { top: 'tab', right: 'socket', bottom: 'flat', left: 'socket' },
    scatter: { x: 75, y: 40, rotate: 7 },
  },
  {
    id: 'django',
    name: 'Django',
    shortName: 'Django REST',
    cluster: 'backend',
    clusterLabel: 'Backend & Data',
    level: 'Proficient',
    experience: '2+ Years',
    color: '#092E20',
    accentBorder: '#44B78B',
    useCase: 'Engineering robust database-driven platforms with Django REST Framework, built-in security, and automated admin dashboards.',
    strengths: ['Django ORM & Query Optimization', 'DRF Serializers & ViewSets', 'Session & Role-Based Auth'],
    connections: ['python', 'postgresql'],
    edges: { top: 'socket', right: 'flat', bottom: 'tab', left: 'tab' },
    scatter: { x: -80, y: -65, rotate: -9 },
  },

  // --- MOBILE CLUSTER ---
  {
    id: 'reactnative',
    name: 'React Native',
    shortName: 'React Native',
    cluster: 'mobile',
    clusterLabel: 'Mobile Engineering',
    level: 'Production Ready',
    experience: '2+ Years',
    color: '#61DAFB',
    accentBorder: '#38BDF8',
    useCase: 'Crafting cross-platform mobile apps for iOS and Android with 60fps native gestures, offline caching, and biometric auth.',
    strengths: ['Expo & Bare Workflow', 'Reanimated 3 & Gesture Handler', 'Native Modules & Camera API'],
    connections: ['typescript', 'flutter'],
    edges: { top: 'flat', right: 'tab', bottom: 'socket', left: 'flat' },
    scatter: { x: 65, y: -75, rotate: 5 },
  },
  {
    id: 'flutter',
    name: 'Flutter',
    shortName: 'Flutter',
    cluster: 'mobile',
    clusterLabel: 'Mobile Engineering',
    level: 'Advanced',
    experience: '2+ Years',
    color: '#02569B',
    accentBorder: '#54C5F8',
    useCase: 'Creating pixel-perfect native apps with Skia/Impeller graphics engine, custom animations, and cross-platform consistency.',
    strengths: ['Custom Render Objects & Canvas', 'BLoC & Provider State Patterns', 'Multi-Platform Target Builds'],
    connections: ['reactnative', 'dart'],
    edges: { top: 'socket', right: 'tab', bottom: 'flat', left: 'socket' },
    scatter: { x: -55, y: 60, rotate: -4 },
  },
  {
    id: 'dart',
    name: 'Dart',
    shortName: 'Dart SDK',
    cluster: 'mobile',
    clusterLabel: 'Mobile Engineering',
    level: 'Advanced',
    experience: '2+ Years',
    color: '#0175C2',
    accentBorder: '#00B4AB',
    useCase: 'Writing type-safe, ahead-of-time (AOT) compiled client logic for high-frame-rate mobile and desktop user interfaces.',
    strengths: ['Sound Null Safety', 'AOT & JIT Compilation', 'Isolates & Concurrency'],
    connections: ['flutter'],
    edges: { top: 'tab', right: 'flat', bottom: 'socket', left: 'socket' },
    scatter: { x: 70, y: 65, rotate: 8 },
  },

  // --- DATABASE CLUSTER ---
  {
    id: 'mongodb',
    name: 'MongoDB',
    shortName: 'MongoDB',
    cluster: 'database',
    clusterLabel: 'Database & Storage',
    level: 'Production Ready',
    experience: '3+ Years',
    color: '#47A248',
    accentBorder: '#47A248',
    useCase: 'Designing flexible NoSQL document schemas, complex aggregation pipelines, indexing strategies, and multi-tenant collections.',
    strengths: ['Aggregation Framework ($lookup, $facet)', 'Compound & TTL Indexing', 'Mongoose ODM & Replica Sets'],
    connections: ['nodejs', 'expressjs', 'postgresql'],
    edges: { top: 'socket', right: 'tab', bottom: 'flat', left: 'flat' },
    scatter: { x: -75, y: -35, rotate: -6 },
  },
  {
    id: 'postgresql',
    name: 'PostgreSQL',
    shortName: 'PostgreSQL',
    cluster: 'database',
    clusterLabel: 'Database & Storage',
    level: 'Advanced',
    experience: '3+ Years',
    color: '#4169E1',
    accentBorder: '#336791',
    useCase: 'Engineering relational database schemas with ACID compliance, JSONB document fields, full-text search, and migrations.',
    strengths: ['Complex Joins & CTE Queries', 'JSONB & Indexing', 'Transactions & Connection Pooling'],
    connections: ['mongodb', 'django', 'python', 'nodejs'],
    edges: { top: 'tab', right: 'flat', bottom: 'socket', left: 'socket' },
    scatter: { x: 60, y: -45, rotate: 6 },
  },

  // --- TOOLS & DEVOPS CLUSTER ---
  {
    id: 'git',
    name: 'Git',
    shortName: 'Git / GitHub',
    cluster: 'tools',
    clusterLabel: 'Developer Tooling',
    level: 'Mastery',
    experience: '4+ Years',
    color: '#F05032',
    accentBorder: '#F05032',
    useCase: 'Managing distributed codebases, trunk-based branching workflows, rebase strategies, code reviews, and Git hooks.',
    strengths: ['Interactive Rebase & Cherry-pick', 'Git Submodules & Worktrees', 'Semantic Release & Tagging'],
    connections: ['devops'],
    edges: { top: 'flat', right: 'tab', bottom: 'flat', left: 'socket' },
    scatter: { x: -45, y: 75, rotate: -7 },
  },
  {
    id: 'devops',
    name: 'DevOps',
    shortName: 'Docker & CI/CD',
    cluster: 'tools',
    clusterLabel: 'Developer Tooling',
    level: 'Advanced',
    experience: '2+ Years',
    color: '#2496ED',
    accentBorder: '#2496ED',
    useCase: 'Configuring multi-stage Docker containers, automated GitHub Actions CI/CD pipelines, NGINX reverse proxies, and Cloud Run deployments.',
    strengths: ['Multi-Stage Dockerfiles', 'GitHub Actions Automated CI/CD', 'NGINX & SSL Reverse Proxy'],
    connections: ['git', 'nodejs', 'postgresql'],
    edges: { top: 'tab', right: 'flat', bottom: 'socket', left: 'socket' },
    scatter: { x: 55, y: 80, rotate: 9 },
  },
];
