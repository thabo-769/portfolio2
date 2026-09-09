import type { Project } from '../types';

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  homepage: string | null;
  language: string | null;
  topics?: string[];
  stargazers_count: number;
  forks_count: number;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  fork: boolean;
  archived: boolean;
}

let cachedProjects: Project[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function formatRepoTitle(name: string): string {
  return name
    .replace(/[-_]+/g, ' ')
    .trim()
    .replace(/\b\w/g, char => char.toUpperCase());
}

function deriveCategory(repo: GitHubRepo): Project['category'] {
  const topics = repo.topics || [];
  const text = (repo.name + ' ' + (repo.description || '')).toLowerCase();

  if (topics.includes('mobile') || text.includes('mobile') || text.includes('android') || text.includes('ios')) {
    return 'Mobile';
  }
  if (topics.includes('business') || text.includes('business') || text.includes('estate') || text.includes('ecommerce') || text.includes('shop')) {
    return 'Business';
  }
  if (topics.includes('gift') || text.includes('gift')) {
    return 'Gift';
  }
  return 'Personal';
}

function mapGitHubRepoToProject(repo: GitHubRepo, index: number): Project {
  const name = formatRepoTitle(repo.name);
  const technologies = repo.topics && repo.topics.length > 0
    ? repo.topics
    : [repo.language, 'TypeScript', 'React'].filter((tech): tech is string => Boolean(tech));

  // Deduplicate technologies while preserving order
  const uniqueTechs = Array.from(new Set(technologies));

  return {
    id: String(repo.id),
    name,
    shortDescription: repo.description || `${name} repository on GitHub.`,
    description: repo.description || `${name} repository on GitHub.`,
    category: deriveCategory(repo),
    technologies: uniqueTechs,
    image: '',
    images: [],
    githubUrl: repo.html_url,
    liveUrl: repo.homepage || repo.html_url,
    status: 'Published',
    featured: Boolean(repo.homepage || repo.stargazers_count > 0 || index < 6),
    displayOrder: index,
    completionDate: repo.pushed_at || repo.created_at,
    client: '',
    projectType: repo.language ? `${repo.language} Project` : 'Software Project',
    features: [],
    challenges: '',
    solutions: '',
    results: '',
    createdAt: new Date(repo.created_at).getTime(),
    updatedAt: new Date(repo.pushed_at || repo.updated_at).getTime(),
    deletedAt: null,
    isDeleted: false,
  };
}

export async function fetchGitHubProjects(): Promise<Project[]> {
  const now = Date.now();
  if (cachedProjects && now - lastFetchTime < CACHE_TTL_MS) {
    return cachedProjects;
  }

  const username = import.meta.env.VITE_GITHUB_USERNAME || 'thabo-769';
  const token = import.meta.env.VITE_GITHUB_TOKEN;

  try {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`https://api.github.com/users/${username}/repos?sort=pushed&per_page=100`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`GitHub API returned status ${response.status}`);
    }

    const repos: GitHubRepo[] = await response.json();
    const publicNonForkRepos = repos.filter(repo => !repo.fork && !repo.archived);

    const projects = publicNonForkRepos.map(mapGitHubRepoToProject);

    cachedProjects = projects;
    lastFetchTime = now;
    return projects;
  } catch (error) {
    console.warn('Failed to fetch projects from GitHub API:', error);
    if (cachedProjects) {
      return cachedProjects;
    }
    return [];
  }
}
