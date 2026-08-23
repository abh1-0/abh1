import { site } from '../data/site';

export interface Repo {
  name: string;
  description: string;
  language: string | null;
  stars: number | null;
  url: string;
  pushedAt: string | null;
}

/** Blacklisted repositories that must NEVER be shown. */
const EXCLUDED_REPOS = [
  'redirect',
  'redirects',
  'gesture-synth',
  'gesture_synth',
  'gesturesynth',
  'gesture-synth-app'
];

const FALLBACK_REPOS: Repo[] = [
  {
    name: 'oplus-battery',
    description:
      'Low-level performance governor module for battery optimization and CPU scaling.',
    language: 'JavaScript',
    stars: 42,
    url: `https://github.com/${site.githubUser}/oplus-battery`,
    pushedAt: null
  },
  {
    name: 'fetch',
    description:
      'Universal open-source printing & scanning network protocol engine and web console.',
    language: 'TypeScript',
    stars: 27,
    url: `https://github.com/${site.githubUser}/fetch`,
    pushedAt: null
  },
  {
    name: 'lithium',
    description:
      'Lightweight Chromium-based custom web browser shell designed for low memory footprint.',
    language: 'C++',
    stars: 19,
    url: `https://github.com/${site.githubUser}/lithium`,
    pushedAt: null
  },
  {
    name: 'cyber-slice-neon-blade',
    description:
      'Neon blade slice web game built with modern canvas graphics and audio.',
    language: 'TypeScript',
    stars: 15,
    url: `https://github.com/${site.githubUser}/cyber-slice-neon-blade`,
    pushedAt: null
  },
  {
    name: 'dawn',
    description:
      'Minimalist system setup and developer environment configuration.',
    language: 'Shell',
    stars: 12,
    url: `https://github.com/${site.githubUser}/dawn`,
    pushedAt: null
  },
  {
    name: 'abh1',
    description:
      'Personal portfolio and engineering website built with Astro and Tailwind CSS.',
    language: 'TypeScript',
    stars: 10,
    url: `https://github.com/${site.githubUser}/abh1`,
    pushedAt: null
  }
];

const LANG_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  'C++': '#f34b7d',
  C: '#8b949e',
  Shell: '#89e051',
  Makefile: '#427819',
  Python: '#3572a5',
  Java: '#b07219',
  Kotlin: '#a97bff',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Dockerfile: '#384d54'
};

export function langColor(language: string | null): string {
  if (!language) return '#52525b';
  return LANG_COLORS[language] ?? '#8b949e';
}

interface GitHubApiRepo {
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  html_url: string;
  pushed_at: string;
  fork: boolean;
}

function isExcludedRepo(name: string, description: string | null): boolean {
  const lowerName = name.toLowerCase();
  const lowerDesc = (description || '').toLowerCase();

  return EXCLUDED_REPOS.some(
    (excluded) =>
      lowerName === excluded ||
      lowerName.includes(excluded) ||
      lowerDesc.includes(excluded) ||
      (excluded === 'gesture-synth' && (lowerName.includes('gesture') || lowerDesc.includes('gesture'))) ||
      (excluded === 'redirect' && (lowerName.includes('redirect') || lowerDesc.includes('redirect')))
  );
}

/**
 * Fetches public repos at build time; filters blacklisted repos (e.g. redirect, gesture synth);
 * falls back to curated portfolio repos when offline or rate-limited.
 */
export async function getRepos(limit = 12): Promise<Repo[]> {
  try {
    const res = await fetch(
      `https://api.github.com/users/${site.githubUser}/repos?sort=pushed&per_page=100`,
      {
        headers: { Accept: 'application/vnd.github+json' },
        signal: AbortSignal.timeout(4000)
      }
    );
    if (!res.ok) throw new Error(`GitHub API responded ${res.status}`);
    const data = (await res.json()) as GitHubApiRepo[];
    if (!Array.isArray(data) || data.length === 0) throw new Error('empty response');

    const filtered = data.filter(
      (r) => !r.fork && !isExcludedRepo(r.name, r.description)
    );

    const repos = filtered
      .map((r): Repo => ({
        name: r.name,
        description: r.description ?? '',
        language: r.language,
        stars: r.stargazers_count,
        url: r.html_url,
        pushedAt: r.pushed_at
      }))
      .sort((a, b) => (b.stars ?? 0) - (a.stars ?? 0))
      .slice(0, limit);

    return repos.length > 0 ? repos : FALLBACK_REPOS.slice(0, limit);
  } catch {
    return FALLBACK_REPOS.slice(0, limit);
  }
}
