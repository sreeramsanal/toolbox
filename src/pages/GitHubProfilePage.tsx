import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ExternalLink, 
  MapPin, 
  Link as LinkIcon, 
  Building, 
  Calendar, 
  Star, 
  GitFork, 
  BookOpen, 
  AlertCircle, 
  RefreshCw
} from 'lucide-react';
import { GithubIcon } from '../components/GithubIcon';
import type { GitHubRepo, GitHubUserProfile } from '../types/github';
import { fetchGitHubUser, fetchGitHubUserRepos, getCachedGitHubUser } from '../services/githubService';

export const GitHubProfilePage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [profile, setProfile] = useState<GitHubUserProfile | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Repo filter & sort
  const [repoSearch, setRepoSearch] = useState('');
  const [repoSort, setRepoSort] = useState<'stars' | 'forks' | 'updated'>('stars');

  useEffect(() => {
    const cached = getCachedGitHubUser();
    if (cached) {
      setProfile(cached);
      setUsername(cached.login);
    }
  }, []);

  const loadUser = async (targetUser: string) => {
    if (!targetUser.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const [p, r] = await Promise.all([
        fetchGitHubUser(targetUser),
        fetchGitHubUserRepos(targetUser),
      ]);
      setProfile(p);
      setRepos(r);
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message === 'USER_NOT_FOUND') {
          setError(`User "${targetUser}" was not found on GitHub.`);
        } else if (err.message === 'RATE_LIMIT_EXCEEDED') {
          setError('GitHub API 60/hr public rate limit reached. Please wait a few moments.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to fetch GitHub profile.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadUser(username);
  };

  // Filter & sort repos
  const filteredRepos = repos
    .filter(r => 
      r.name.toLowerCase().includes(repoSearch.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(repoSearch.toLowerCase()))
    )
    .sort((a, b) => {
      if (repoSort === 'stars') return b.stargazers_count - a.stargazers_count;
      if (repoSort === 'forks') return b.forks_count - a.forks_count;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return String(num);
  };

  const formatJoinedDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return `Joined ${date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}`;
    } catch {
      return '';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-brand-indigo mb-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-indigo animate-pulse"></span>
            DEVELOPER PROFILE INSPECTOR
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-dark-text">GitHub Profile</h1>
          <p className="text-xs text-dark-text-muted mt-1">
            Explore public developer profiles, code metrics, and repositories.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-dark-text-secondary bg-dark-surface1 px-3 py-1.5 rounded-lg border border-dark-border">
          <GithubIcon className="w-3.5 h-3.5 text-brand-indigo" />
          <span>Public Developer Profiles</span>
        </div>
      </div>

      {/* Search Bar & Quick Profile presets */}
      <div className="p-4 rounded-xl bg-dark-surface1 border border-dark-border mb-6">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 mb-3">
          <div className="relative flex-1 flex items-center bg-dark-surface2 rounded-lg border border-dark-border focus-within:border-brand-indigo">
            <span className="pl-3.5 font-mono text-xs text-dark-text-muted select-none">
              github.com/
            </span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              className="w-full bg-transparent text-dark-text placeholder:text-dark-text-muted px-2 py-2.5 text-xs font-mono font-medium focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !username.trim()}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-brand-indigo hover:bg-brand-indigo/90 text-white text-xs font-medium transition disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            <span>Search Profile</span>
          </button>
        </form>

      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-3 mb-6">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="p-12 text-center rounded-xl bg-dark-surface1 border border-dark-border mb-6">
          <RefreshCw className="w-6 h-6 animate-spin text-brand-indigo mx-auto mb-3" />
          <p className="text-xs font-mono text-dark-text-secondary">Retrieving developer metrics from GitHub API...</p>
        </div>
      )}

      {/* Idle State */}
      {!loading && !profile && !error && (
        <div className="p-12 text-center rounded-2xl bg-dark-surface1 border border-dark-border text-dark-text-muted">
          <GithubIcon className="w-10 h-10 mx-auto mb-3 opacity-30 text-dark-text" />
          <h3 className="text-sm font-semibold text-dark-text mb-1">Search Any GitHub Profile</h3>
          <p className="text-xs max-w-sm mx-auto">
            Enter a public GitHub username above to view repository metrics, star counts, and developer activity.
          </p>
        </div>
      )}

      {/* Profile Overview Bento */}
      {!loading && profile && (
        <div className="space-y-6">
          
          <div className="p-6 rounded-2xl bg-dark-surface1 border border-dark-border shadow-xl">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-dark-border/60">
              
              {/* User Bio Left */}
              <div className="flex items-start gap-4">
                <div className="relative">
                  <img
                    src={profile.avatar_url}
                    alt={profile.login}
                    className="w-20 h-20 rounded-2xl border-2 border-dark-border object-cover"
                  />
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-brand-emerald border-2 border-dark-surface1" />
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-xl font-bold text-dark-text">
                      {profile.name || profile.login}
                    </h2>
                    <a
                      href={profile.html_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-[11px] font-mono text-brand-indigo hover:underline"
                    >
                      <span>View on GitHub</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="text-xs font-mono text-brand-cyan mb-2">
                    @{profile.login}
                  </div>

                  {profile.bio && (
                    <p className="text-xs text-dark-text-secondary max-w-xl leading-relaxed">
                      {profile.bio}
                    </p>
                  )}
                </div>
              </div>

              {/* Stat tiles (Right) */}
              <div className="grid grid-cols-3 gap-3 w-full lg:w-auto">
                <div className="p-3.5 rounded-xl bg-dark-surface2/70 border border-dark-border min-w-[100px] text-center">
                  <div className="text-[10px] font-mono uppercase text-dark-text-muted mb-1">FOLLOWERS</div>
                  <div className="text-xl font-mono font-bold text-dark-text">{formatNumber(profile.followers)}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-dark-surface2/70 border border-dark-border min-w-[100px] text-center">
                  <div className="text-[10px] font-mono uppercase text-dark-text-muted mb-1">FOLLOWING</div>
                  <div className="text-xl font-mono font-bold text-dark-text">{formatNumber(profile.following)}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-dark-surface2/70 border border-dark-border min-w-[100px] text-center">
                  <div className="text-[10px] font-mono uppercase text-dark-text-muted mb-1">REPOSITORIES</div>
                  <div className="text-xl font-mono font-bold text-brand-emerald">{profile.public_repos}</div>
                </div>
              </div>

            </div>

            {/* Profile Meta Details */}
            <div className="pt-4 flex flex-wrap items-center gap-5 text-xs text-dark-text-muted font-mono">
              {profile.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-cyan" />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile.blog && (
                <a 
                  href={profile.blog.startsWith('http') ? profile.blog : `https://${profile.blog}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 hover:text-dark-text transition"
                >
                  <LinkIcon className="w-3.5 h-3.5 text-brand-indigo" />
                  <span>{profile.blog}</span>
                </a>
              )}
              {profile.company && (
                <div className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-brand-emerald" />
                  <span>{profile.company}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-dark-text-muted" />
                <span>{formatJoinedDate(profile.created_at)}</span>
              </div>
            </div>

          </div>

          {/* Repositories Section */}
          <div className="space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-dark-text">Public Repositories</h3>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-dark-surface2 text-brand-cyan rounded border border-dark-border">
                  {filteredRepos.length}
                </span>
              </div>

              {/* Filter and Sort */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={repoSearch}
                  onChange={(e) => setRepoSearch(e.target.value)}
                  placeholder="Find a repository..."
                  className="bg-dark-surface2 text-dark-text text-xs px-3 py-1.5 rounded-lg border border-dark-border focus:border-brand-indigo focus:outline-none"
                />

                <select
                  value={repoSort}
                  onChange={(e) => setRepoSort(e.target.value as 'stars' | 'forks' | 'updated')}
                  className="bg-dark-surface2 text-dark-text-secondary text-xs px-3 py-1.5 rounded-lg border border-dark-border focus:outline-none font-mono"
                >
                  <option value="stars">Most Stars</option>
                  <option value="forks">Most Forks</option>
                  <option value="updated">Recently Updated</option>
                </select>
              </div>
            </div>

            {/* Repositories 2-col Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRepos.length === 0 ? (
                <div className="col-span-2 p-8 text-center text-xs font-mono text-dark-text-muted rounded-xl bg-dark-surface1 border border-dark-border">
                  No public repositories found matching your query.
                </div>
              ) : (
                filteredRepos.map((repo) => (
                  <div
                    key={repo.id}
                    className="p-5 rounded-xl bg-dark-surface1 border border-dark-border hover:border-dark-border-hover flex flex-col justify-between transition-colors shadow-sm group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <a
                          href={repo.html_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-bold font-mono text-dark-text group-hover:text-brand-indigo flex items-center gap-1.5 transition"
                        >
                          <BookOpen className="w-4 h-4 text-brand-indigo shrink-0" />
                          <span className="truncate max-w-[280px]">{repo.name}</span>
                        </a>
                        <span className="px-1.5 py-0.5 text-[9px] font-mono uppercase bg-dark-surface2 text-dark-text-muted rounded border border-dark-border">
                          Public
                        </span>
                      </div>

                      <p className="text-xs text-dark-text-muted line-clamp-2 leading-relaxed mb-4">
                        {repo.description || 'No description provided.'}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-dark-border/50 flex items-center justify-between text-xs font-mono text-dark-text-muted">
                      <div className="flex items-center gap-3">
                        {repo.language && (
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-brand-cyan"></span>
                            <span>{repo.language}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-brand-amber" />
                          <span>{repo.stargazers_count.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <GitFork className="w-3 h-3" />
                          <span>{repo.forks_count.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="text-[10px]">
                        Updated {new Date(repo.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
