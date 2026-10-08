import type { GitHubRepo, GitHubUserProfile } from '../types/github';

const GITHUB_CACHE_KEY = 'toolbox_github_last_profile';

export async function fetchGitHubUser(username: string): Promise<GitHubUserProfile> {
  const cleanUser = username.trim().replace(/^@/, '');
  if (!cleanUser) {
    throw new Error('Please enter a valid GitHub username');
  }

  const res = await fetch(`https://api.github.com/users/${encodeURIComponent(cleanUser)}`, {
    headers: {
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (res.status === 404) {
    throw new Error('USER_NOT_FOUND');
  }

  if (res.status === 403) {
    throw new Error('RATE_LIMIT_EXCEEDED');
  }

  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.statusText || res.status}`);
  }

  const profile: GitHubUserProfile = await res.json();
  
  try {
    localStorage.setItem(GITHUB_CACHE_KEY, JSON.stringify(profile));
  } catch {
    // ignore
  }

  return profile;
}

export async function fetchGitHubUserRepos(username: string): Promise<GitHubRepo[]> {
  const cleanUser = username.trim().replace(/^@/, '');
  const res = await fetch(`https://api.github.com/users/${encodeURIComponent(cleanUser)}/repos?per_page=30&sort=updated`, {
    headers: {
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!res.ok) {
    return [];
  }

  const repos: GitHubRepo[] = await res.json();
  return Array.isArray(repos) ? repos : [];
}

export function getCachedGitHubUser(): GitHubUserProfile | null {
  try {
    const raw = localStorage.getItem(GITHUB_CACHE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return null;
}
