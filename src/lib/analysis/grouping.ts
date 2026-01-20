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
  category: "technical" | "application";
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
const themePatterns: Record<string, { keywords: RegExp[]; description: string; category: "technical" | "application" }> = {
  // Technical themes
  "Web Applications": {
    keywords: [/\bweb\b/i, /\bwebsite\b/i, /\bfrontend\b/i, /\bfull.?stack\b/i],
    description: "Web-based applications and sites",
    category: "technical",
  },
  "CLI Tools": {
    keywords: [/\bcli\b/i, /\bcommand.?line\b/i, /\bterminal\b/i, /\bconsole\b/i],
    description: "Command-line interfaces and tools",
    category: "technical",
  },
  "Libraries & Packages": {
    keywords: [/\blib\b/i, /\blibrary\b/i, /\bpackage\b/i, /\bmodule\b/i, /\bsdk\b/i],
    description: "Reusable libraries and packages",
    category: "technical",
  },
  "APIs & Services": {
    keywords: [/\bapi\b/i, /\bservice\b/i, /\bmicroservice\b/i, /\bbackend\b/i],
    description: "API services and backends",
    category: "technical",
  },
  "Data & Analytics": {
    keywords: [/\bdata\b/i, /\banalytics\b/i, /\bml\b/i, /\bmachine.?learning\b/i, /\bai\b/i],
    description: "Data processing and analytics",
    category: "technical",
  },
  "DevOps & Infrastructure": {
    keywords: [/\bdevops\b/i, /\binfra\b/i, /\bdeploy\b/i, /\bci\b/i, /\bcd\b/i, /\bdocker\b/i],
    description: "DevOps and infrastructure tooling",
    category: "technical",
  },
  "Learning & Experiments": {
    keywords: [/\blearn\b/i, /\btutorial\b/i, /\bexperiment\b/i, /\bplayground\b/i, /\bdemo\b/i],
    description: "Learning projects and experiments",
    category: "technical",
  },
  "Templates & Starters": {
    keywords: [/\btemplate\b/i, /\bstarter\b/i, /\bboilerplate\b/i, /\bscaffold\b/i],
    description: "Project templates and starters",
    category: "technical",
  },
  "Mobile Apps": {
    keywords: [/\bmobile\b/i, /\bios\b/i, /\bandroid\b/i, /\breact.?native\b/i, /\bflutter\b/i, /\bapp\b/i],
    description: "Mobile applications for iOS and Android",
    category: "technical",
  },
  "Browser Extensions": {
    keywords: [/\bextension\b/i, /\bchrome\b/i, /\bfirefox\b/i, /\bbrowser\b/i, /\baddon\b/i],
    description: "Browser extensions and add-ons",
    category: "technical",
  },
  "Games": {
    keywords: [/\bgame\b/i, /\bgaming\b/i, /\bunity\b/i, /\bgodot\b/i, /\bpygame\b/i, /\bphaser\b/i],
    description: "Games and game engines",
    category: "technical",
  },

  // Application domain themes
  "Finance & Budgeting": {
    keywords: [/\bfinance\b/i, /\bbudget\b/i, /\bexpense\b/i, /\bmoney\b/i, /\binvoice\b/i, /\baccounting\b/i, /\bbank\b/i, /\bpayment\b/i, /\bcrypto\b/i, /\btrading\b/i, /\bstock\b/i, /\binvest\b/i],
    description: "Finance, budgeting, and money management apps",
    category: "application",
  },
  "Food & Meal Planning": {
    keywords: [/\bmeal\b/i, /\brecipe\b/i, /\bfood\b/i, /\bcooking\b/i, /\bkitchen\b/i, /\bdiet\b/i, /\bnutrition\b/i, /\bgrocery\b/i, /\brestaurant\b/i, /\bmenu\b/i],
    description: "Meal planning, recipes, and food-related apps",
    category: "application",
  },
  "Resume & Career": {
    keywords: [/\bresume\b/i, /\bcv\b/i, /\bportfolio\b/i, /\bjob\b/i, /\bcareer\b/i, /\bhiring\b/i, /\brecruit\b/i, /\binterview\b/i, /\blinkedin\b/i],
    description: "Resume builders, portfolios, and career tools",
    category: "application",
  },
  "Health & Fitness": {
    keywords: [/\bhealth\b/i, /\bfitness\b/i, /\bworkout\b/i, /\bexercise\b/i, /\bgym\b/i, /\bmedical\b/i, /\bwellness\b/i, /\bsleep\b/i, /\bmeditation\b/i, /\byoga\b/i, /\bcalorie\b/i],
    description: "Health tracking, fitness, and wellness apps",
    category: "application",
  },
  "Productivity & Tasks": {
    keywords: [/\btodo\b/i, /\btask\b/i, /\bproductivity\b/i, /\bpomodoro\b/i, /\bkanban\b/i, /\bproject.?management\b/i, /\btrello\b/i, /\bnotes?\b/i, /\breminder\b/i, /\bcalendar\b/i, /\bschedule\b/i],
    description: "Task management and productivity tools",
    category: "application",
  },
  "E-commerce & Shopping": {
    keywords: [/\becommerce\b/i, /\be-commerce\b/i, /\bshop\b/i, /\bstore\b/i, /\bcart\b/i, /\bcheckout\b/i, /\bproduct\b/i, /\binventory\b/i, /\bmarketplace\b/i],
    description: "E-commerce platforms and shopping apps",
    category: "application",
  },
  "Social & Communication": {
    keywords: [/\bsocial\b/i, /\bchat\b/i, /\bmessag\b/i, /\bforum\b/i, /\bcommunity\b/i, /\btwitter\b/i, /\bdiscord\b/i, /\bslack\b/i, /\bfeed\b/i, /\bpost\b/i],
    description: "Social networks and communication tools",
    category: "application",
  },
  "Education & Learning": {
    keywords: [/\beducat\b/i, /\bcourse\b/i, /\bquiz\b/i, /\bflashcard\b/i, /\bstudy\b/i, /\bschool\b/i, /\bstudent\b/i, /\bteach\b/i, /\blms\b/i, /\belearning\b/i],
    description: "Educational platforms and learning tools",
    category: "application",
  },
  "Media & Entertainment": {
    keywords: [/\bmedia\b/i, /\bvideo\b/i, /\bmusic\b/i, /\bpodcast\b/i, /\bstream\b/i, /\bplayer\b/i, /\bplaylist\b/i, /\bspotify\b/i, /\byoutube\b/i, /\bnetflix\b/i],
    description: "Media streaming and entertainment apps",
    category: "application",
  },
  "Travel & Location": {
    keywords: [/\btravel\b/i, /\bmap\b/i, /\blocation\b/i, /\bgeo\b/i, /\bgps\b/i, /\bweather\b/i, /\bflight\b/i, /\bhotel\b/i, /\bbooking\b/i, /\btourism\b/i],
    description: "Travel planning and location-based apps",
    category: "application",
  },
  "Real Estate & Property": {
    keywords: [/\breal.?estate\b/i, /\bproperty\b/i, /\bhousing\b/i, /\brent\b/i, /\bmortgage\b/i, /\blisting\b/i, /\bapartment\b/i, /\bhome\b/i],
    description: "Real estate and property management",
    category: "application",
  },
  "CRM & Sales": {
    keywords: [/\bcrm\b/i, /\bsales\b/i, /\bcustomer\b/i, /\blead\b/i, /\bpipeline\b/i, /\bcontact\b/i, /\bdeal\b/i, /\bprospect\b/i],
    description: "Customer relationship and sales management",
    category: "application",
  },
  "Content & Blogging": {
    keywords: [/\bblog\b/i, /\bcms\b/i, /\bcontent\b/i, /\bmarkdown\b/i, /\bwriting\b/i, /\barticle\b/i, /\bpublish\b/i, /\bwordpress\b/i],
    description: "Blogging and content management systems",
    category: "application",
  },
  "Authentication & Security": {
    keywords: [/\bauth\b/i, /\blogin\b/i, /\bpassword\b/i, /\bsecurity\b/i, /\boauth\b/i, /\bjwt\b/i, /\bencrypt\b/i, /\b2fa\b/i, /\bsso\b/i],
    description: "Authentication and security tools",
    category: "application",
  },
  "Automation & Bots": {
    keywords: [/\bbot\b/i, /\bautomation\b/i, /\bscraper\b/i, /\bcrawler\b/i, /\bworkflow\b/i, /\bzapier\b/i, /\bscheduler\b/i, /\bcron\b/i],
    description: "Automation tools and bots",
    category: "application",
  },
  "Dashboard & Admin": {
    keywords: [/\bdashboard\b/i, /\badmin\b/i, /\bpanel\b/i, /\bbackoffice\b/i, /\bmanagement\b/i, /\bmonitor\b/i, /\bmetric\b/i],
    description: "Admin panels and dashboards",
    category: "application",
  },
  "File & Document": {
    keywords: [/\bfile\b/i, /\bdocument\b/i, /\bpdf\b/i, /\bupload\b/i, /\bstorage\b/i, /\bdropbox\b/i, /\bdrive\b/i, /\bconvert\b/i],
    description: "File management and document tools",
    category: "application",
  },
  "Booking & Scheduling": {
    keywords: [/\bbooking\b/i, /\bappointment\b/i, /\breservation\b/i, /\bschedule\b/i, /\bcalendly\b/i, /\bavailability\b/i, /\bslot\b/i],
    description: "Booking and appointment scheduling",
    category: "application",
  },
  "Survey & Forms": {
    keywords: [/\bsurvey\b/i, /\bform\b/i, /\bquestionnaire\b/i, /\bpoll\b/i, /\bfeedback\b/i, /\bresponse\b/i, /\btypeform\b/i],
    description: "Surveys, forms, and feedback collection",
    category: "application",
  },
  "Email & Newsletter": {
    keywords: [/\bemail\b/i, /\bmail\b/i, /\bnewsletter\b/i, /\binbox\b/i, /\bsmtp\b/i, /\bmailchimp\b/i, /\bsubscrib\b/i],
    description: "Email clients and newsletter tools",
    category: "application",
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

  for (const [themeName, { keywords, description, category }] of Object.entries(themePatterns)) {
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
        category,
        repositories: matchingRepos,
        keywords: Array.from(matchedKeywords).slice(0, 5),
      });
    }
  }

  return themes.sort((a, b) => b.repositories.length - a.repositories.length);
}

/**
 * Get themes grouped by category
 */
export function getThemesByCategory(themes: ThemeCluster[]): { technical: ThemeCluster[]; application: ThemeCluster[] } {
  return {
    technical: themes.filter(t => t.category === "technical"),
    application: themes.filter(t => t.category === "application"),
  };
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
