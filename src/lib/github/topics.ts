import type { Octokit } from "@octokit/rest";
import type { Repository } from "@/lib/db/schema";

/**
 * Generate suggested topics for a repository based on its attributes
 */
export function generateTopicsForRepo(repo: Repository): string[] {
  const topics: Set<string> = new Set();
  const name = repo.name.toLowerCase();
  const desc = (repo.description || "").toLowerCase();
  const combined = `${name} ${desc}`;

  // Add language as topic (lowercase, cleaned)
  if (repo.language) {
    const lang = repo.language.toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (lang) topics.add(lang);
  }

  // Framework detection
  const frameworks: Record<string, string[]> = {
    react: ["react", "reactjs", "react-"],
    nextjs: ["next", "nextjs", "next-"],
    vue: ["vue", "vuejs", "vue-"],
    angular: ["angular"],
    svelte: ["svelte", "sveltekit"],
    express: ["express"],
    nodejs: ["node", "nodejs"],
    django: ["django"],
    flask: ["flask"],
    fastapi: ["fastapi"],
    rails: ["rails", "ruby-on-rails"],
    laravel: ["laravel"],
    "spring-boot": ["spring", "springboot"],
  };

  for (const [topic, patterns] of Object.entries(frameworks)) {
    if (patterns.some((p) => combined.includes(p))) {
      topics.add(topic);
    }
  }

  // Database detection
  const databases: Record<string, string[]> = {
    postgresql: ["postgres", "postgresql", "psql"],
    mongodb: ["mongo", "mongodb"],
    mysql: ["mysql"],
    redis: ["redis"],
    sqlite: ["sqlite"],
    prisma: ["prisma"],
    drizzle: ["drizzle"],
  };

  for (const [topic, patterns] of Object.entries(databases)) {
    if (patterns.some((p) => combined.includes(p))) {
      topics.add(topic);
    }
  }

  // Project type detection
  const projectTypes: Record<string, string[]> = {
    api: ["api", "rest", "graphql", "backend"],
    cli: ["cli", "command-line", "terminal"],
    webapp: ["webapp", "web-app", "frontend", "dashboard"],
    library: ["lib", "library", "package", "sdk"],
    bot: ["bot", "discord", "slack", "telegram"],
    automation: ["automation", "script", "scraper", "crawler"],
    template: ["template", "boilerplate", "starter", "scaffold"],
    game: ["game", "gaming", "unity", "godot"],
    mobile: ["mobile", "ios", "android", "react-native", "flutter"],
    extension: ["extension", "chrome", "firefox", "addon"],
  };

  for (const [topic, patterns] of Object.entries(projectTypes)) {
    if (patterns.some((p) => combined.includes(p))) {
      topics.add(topic);
    }
  }

  // Domain detection
  const domains: Record<string, string[]> = {
    finance: ["finance", "budget", "money", "payment", "invoice", "accounting"],
    ecommerce: ["shop", "store", "cart", "ecommerce", "e-commerce", "checkout"],
    education: ["learn", "course", "tutorial", "education", "school", "quiz"],
    healthcare: ["health", "medical", "fitness", "workout", "wellness"],
    social: ["social", "chat", "messaging", "community", "forum"],
    productivity: ["todo", "task", "productivity", "kanban", "notes"],
    media: ["video", "music", "podcast", "stream", "player"],
    devtools: ["devtools", "developer", "dev-tools", "debugging"],
  };

  for (const [topic, patterns] of Object.entries(domains)) {
    if (patterns.some((p) => combined.includes(p))) {
      topics.add(topic);
    }
  }

  // Platform detection
  if (combined.includes("docker")) topics.add("docker");
  if (combined.includes("kubernetes") || combined.includes("k8s")) topics.add("kubernetes");
  if (combined.includes("aws") || combined.includes("amazon")) topics.add("aws");
  if (combined.includes("vercel")) topics.add("vercel");
  if (combined.includes("netlify")) topics.add("netlify");

  // Common tags based on repo properties
  if (repo.isTemplate) topics.add("template");
  if (repo.isFork) topics.add("fork");

  // Limit to 20 topics (GitHub's max)
  return Array.from(topics).slice(0, 20);
}

/**
 * Get current topics for a repository from GitHub
 */
export async function getRepoTopics(
  client: Octokit,
  owner: string,
  repo: string
): Promise<string[]> {
  try {
    const response = await client.rest.repos.getAllTopics({
      owner,
      repo,
    });
    return response.data.names || [];
  } catch (error) {
    console.error(`Failed to get topics for ${owner}/${repo}:`, error);
    return [];
  }
}

/**
 * Set topics for a repository on GitHub
 */
export async function setRepoTopics(
  client: Octokit,
  owner: string,
  repo: string,
  topics: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    // GitHub topics must be lowercase and can only contain letters, numbers, and hyphens
    const cleanedTopics = topics
      .map((t) => t.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, ""))
      .filter((t) => t.length > 0 && t.length <= 50)
      .slice(0, 20); // GitHub allows max 20 topics

    await client.rest.repos.replaceAllTopics({
      owner,
      repo,
      names: cleanedTopics,
    });

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`Failed to set topics for ${owner}/${repo}:`, message);
    return { success: false, error: message };
  }
}
