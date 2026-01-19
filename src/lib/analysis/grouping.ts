import type { Repository } from "@/lib/db/schema";

export interface LanguageGroup {
  language: string;
  count: number;
  percentage: number;
  repositories: Repository[];
  totalStars: number;
  avgHealth: number;
}

export interface TopicGroup {
  topic: string;
  count: number;
  repositories: Repository[];
}

export interface TechStackItem {
  name: string;
  category: "language" | "framework" | "tool" | "platform" | "database" | "other";
  count: number;
  repositories: Repository[];
}

export interface RepoFeature {
  repoId: number;
  repoName: string;
  fullName: string;
  language: string | null;
  hasIssues: boolean;
  hasWiki: boolean;
  isPrivate: boolean;
  isFork: boolean;
  isArchived: boolean;
  isTemplate: boolean;
  hasTopics: boolean;
  hasDescription: boolean;
  stars: number;
  forks: number;
  openIssues: number;
  status: string;
  healthScore: number;
  priorityScore: number;
}

export interface ThemeCluster {
  name: string;
  description: string;
  repositories: Repository[];
  keywords: string[];
}

// Common tech patterns to detect in repo names, descriptions, and topics
const techPatterns: Record<string, { pattern: RegExp; category: TechStackItem["category"] }> = {
  // Languages (beyond primary language)
  TypeScript: { pattern: /typescript|\.ts$/i, category: "language" },
  JavaScript: { pattern: /javascript|\.js$/i, category: "language" },
  Python: { pattern: /python|\.py$/i, category: "language" },
  Go: { pattern: /\bgolang\b|\bgo\b/i, category: "language" },
  Rust: { pattern: /\brust\b/i, category: "language" },

  // Frontend Frameworks
  React: { pattern: /\breact\b|reactjs/i, category: "framework" },
  "Next.js": { pattern: /\bnextjs\b|\bnext\.js\b|\bnext-/i, category: "framework" },
  Vue: { pattern: /\bvue\b|vuejs/i, category: "framework" },
  Angular: { pattern: /\bangular\b/i, category: "framework" },
  Svelte: { pattern: /\bsvelte\b/i, category: "framework" },

  // Backend Frameworks
  Express: { pattern: /\bexpress\b/i, category: "framework" },
  "Node.js": { pattern: /\bnodejs\b|\bnode\b/i, category: "framework" },
  Django: { pattern: /\bdjango\b/i, category: "framework" },
  Flask: { pattern: /\bflask\b/i, category: "framework" },
  FastAPI: { pattern: /\bfastapi\b/i, category: "framework" },
  Rails: { pattern: /\brails\b|\bruby.on.rails\b/i, category: "framework" },

  // Databases
  PostgreSQL: { pattern: /\bpostgres\b|\bpostgresql\b/i, category: "database" },
  MongoDB: { pattern: /\bmongo\b|\bmongodb\b/i, category: "database" },
  MySQL: { pattern: /\bmysql\b/i, category: "database" },
  Redis: { pattern: /\bredis\b/i, category: "database" },
  SQLite: { pattern: /\bsqlite\b/i, category: "database" },

  // Platforms/Tools
  Docker: { pattern: /\bdocker\b/i, category: "platform" },
  Kubernetes: { pattern: /\bk8s\b|\bkubernetes\b/i, category: "platform" },
  AWS: { pattern: /\baws\b|\bamazon/i, category: "platform" },
  Vercel: { pattern: /\bvercel\b/i, category: "platform" },
  Netlify: { pattern: /\bnetlify\b/i, category: "platform" },

  // Tools
  GraphQL: { pattern: /\bgraphql\b/i, category: "tool" },
  REST: { pattern: /\brest\b|\brestful\b/i, category: "tool" },
  CLI: { pattern: /\bcli\b|\bcommand.line\b/i, category: "tool" },
  API: { pattern: /\bapi\b/i, category: "tool" },
  Testing: { pattern: /\btest\b|\bjest\b|\bmocha\b|\bpytest\b/i, category: "tool" },
};

// Theme patterns to detect project purposes
const themePatterns: Record<string, { keywords: RegExp[]; description: string }> = {
  "Web Applications": {
    keywords: [/\bweb\b/i, /\bwebsite\b/i, /\bfrontend\b/i, /\bfull.?stack\b/i],
    description: "Web-based applications and sites",
  },
  "CLI Tools": {
    keywords: [/\bcli\b/i, /\bcommand.?line\b/i, /\bterminal\b/i, /\bconsole\b/i],
    description: "Command-line interfaces and tools",
  },
  "Libraries & Packages": {
    keywords: [/\blib\b/i, /\blibrary\b/i, /\bpackage\b/i, /\bmodule\b/i, /\bsdk\b/i],
    description: "Reusable libraries and packages",
  },
  "APIs & Services": {
    keywords: [/\bapi\b/i, /\bservice\b/i, /\bmicroservice\b/i, /\bbackend\b/i],
    description: "API services and backends",
  },
  "Data & Analytics": {
    keywords: [/\bdata\b/i, /\banalytics\b/i, /\bml\b/i, /\bmachine.?learning\b/i, /\bai\b/i],
    description: "Data processing and analytics",
  },
  "DevOps & Infrastructure": {
    keywords: [/\bdevops\b/i, /\binfra\b/i, /\bdeploy\b/i, /\bci\b/i, /\bcd\b/i, /\bdocker\b/i],
    description: "DevOps and infrastructure tooling",
  },
  "Learning & Experiments": {
    keywords: [/\blearn\b/i, /\btutorial\b/i, /\bexperiment\b/i, /\bplayground\b/i, /\bdemo\b/i],
    description: "Learning projects and experiments",
  },
  "Templates & Starters": {
    keywords: [/\btemplate\b/i, /\bstarter\b/i, /\bboilerplate\b/i, /\bscaffold\b/i],
    description: "Project templates and starters",
  },
};

/**
 * Group repositories by primary programming language
 */
export function groupByLanguage(repositories: Repository[]): LanguageGroup[] {
  const groups: Map<string, Repository[]> = new Map();

  for (const repo of repositories) {
    const lang = repo.language || "Unknown";
    if (!groups.has(lang)) {
      groups.set(lang, []);
    }
    groups.get(lang)!.push(repo);
  }

  const total = repositories.length;

  return Array.from(groups.entries())
    .map(([language, repos]) => ({
      language,
      count: repos.length,
      percentage: total > 0 ? Math.round((repos.length / total) * 100) : 0,
      repositories: repos,
      totalStars: repos.reduce((sum, r) => sum + (r.stargazersCount || 0), 0),
      avgHealth: repos.length > 0
        ? Math.round(repos.reduce((sum, r) => sum + (r.healthScore || 0), 0) / repos.length)
        : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Group repositories by topics
 */
export function groupByTopics(repositories: Repository[]): TopicGroup[] {
  const groups: Map<string, Repository[]> = new Map();

  for (const repo of repositories) {
    const topics = repo.topics || [];
    for (const topic of topics) {
      if (!groups.has(topic)) {
        groups.set(topic, []);
      }
      groups.get(topic)!.push(repo);
    }
  }

  return Array.from(groups.entries())
    .map(([topic, repos]) => ({
      topic,
      count: repos.length,
      repositories: repos,
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Detect tech stack across repositories
 */
export function detectTechStack(repositories: Repository[]): TechStackItem[] {
  const techCounts: Map<string, { category: TechStackItem["category"]; repos: Set<number> }> = new Map();

  for (const repo of repositories) {
    // Check repo name, description, and topics
    const textToSearch = [
      repo.name,
      repo.description || "",
      ...(repo.topics || []),
    ].join(" ");

    // Add primary language
    if (repo.language) {
      if (!techCounts.has(repo.language)) {
        techCounts.set(repo.language, { category: "language", repos: new Set() });
      }
      techCounts.get(repo.language)!.repos.add(repo.id);
    }

    // Detect tech patterns
    for (const [tech, { pattern, category }] of Object.entries(techPatterns)) {
      if (pattern.test(textToSearch)) {
        if (!techCounts.has(tech)) {
          techCounts.set(tech, { category, repos: new Set() });
        }
        techCounts.get(tech)!.repos.add(repo.id);
      }
    }
  }

  // Convert to array and find full repos
  const repoMap = new Map(repositories.map(r => [r.id, r]));

  return Array.from(techCounts.entries())
    .map(([name, { category, repos }]) => ({
      name,
      category,
      count: repos.size,
      repositories: Array.from(repos).map(id => repoMap.get(id)!).filter(Boolean),
    }))
    .filter(item => item.count > 0)
    .sort((a, b) => b.count - a.count);
}

/**
 * Detect theme clusters across repositories
 */
export function detectThemes(repositories: Repository[]): ThemeCluster[] {
  const themes: ThemeCluster[] = [];

  for (const [themeName, { keywords, description }] of Object.entries(themePatterns)) {
    const matchingRepos: Repository[] = [];
    const matchedKeywords: Set<string> = new Set();

    for (const repo of repositories) {
      const textToSearch = [
        repo.name,
        repo.description || "",
        ...(repo.topics || []),
      ].join(" ");

      for (const keyword of keywords) {
        if (keyword.test(textToSearch)) {
          if (!matchingRepos.includes(repo)) {
            matchingRepos.push(repo);
          }
          matchedKeywords.add(keyword.source.replace(/\\b/g, "").replace(/\?/g, ""));
        }
      }
    }

    if (matchingRepos.length > 0) {
      themes.push({
        name: themeName,
        description,
        repositories: matchingRepos,
        keywords: Array.from(matchedKeywords).slice(0, 5),
      });
    }
  }

  return themes.sort((a, b) => b.repositories.length - a.repositories.length);
}

/**
 * Generate feature audit table data
 */
export function generateFeatureAudit(repositories: Repository[]): RepoFeature[] {
  return repositories.map(repo => ({
    repoId: repo.id,
    repoName: repo.name,
    fullName: repo.fullName,
    language: repo.language,
    hasIssues: (repo.openIssuesCount || 0) > 0,
    hasWiki: false, // Would need API call to check
    isPrivate: repo.isPrivate || false,
    isFork: repo.isFork || false,
    isArchived: repo.isArchived || false,
    isTemplate: repo.isTemplate || false,
    hasTopics: (repo.topics || []).length > 0,
    hasDescription: Boolean(repo.description),
    stars: repo.stargazersCount || 0,
    forks: repo.forksCount || 0,
    openIssues: repo.openIssuesCount || 0,
    status: repo.status || "unknown",
    healthScore: repo.healthScore || 0,
    priorityScore: repo.priorityScore || 0,
  }));
}

/**
 * Get tech stack by category
 */
export function getTechStackByCategory(techStack: TechStackItem[]): Record<string, TechStackItem[]> {
  const categories: Record<string, TechStackItem[]> = {
    language: [],
    framework: [],
    database: [],
    platform: [],
    tool: [],
    other: [],
  };

  for (const item of techStack) {
    categories[item.category].push(item);
  }

  return categories;
}
