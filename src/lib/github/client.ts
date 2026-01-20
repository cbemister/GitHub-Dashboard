import { Octokit } from "@octokit/rest";

export function createGitHubClient(accessToken: string): Octokit {
  return new Octokit({
    auth: accessToken,
    userAgent: "github-repo-dashboard/1.0",
    timeZone: "UTC",
  });
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  private: boolean;
  fork: boolean;
  archived: boolean;
  is_template: boolean;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  topics: string[];
  created_at: string;
  updated_at: string;
  pushed_at: string | null;
}

export async function fetchAllUserRepos(client: Octokit): Promise<GitHubRepo[]> {
  const repos = await client.paginate(client.rest.repos.listForAuthenticatedUser, {
    visibility: "all",
    affiliation: "owner,collaborator,organization_member",
    sort: "updated",
    per_page: 100,
  });

  return repos as GitHubRepo[];
}

export async function fetchRepoDetails(
  client: Octokit,
  owner: string,
  repo: string
) {
  const [repository, languages] = await Promise.all([
    client.rest.repos.get({ owner, repo }),
    client.rest.repos.listLanguages({ owner, repo }),
  ]);

  return {
    repository: repository.data,
    languages: languages.data,
  };
}

export async function archiveRepo(
  client: Octokit,
  owner: string,
  repo: string
): Promise<void> {
  await client.rest.repos.update({
    owner,
    repo,
    archived: true,
  });
}

export async function deleteRepo(
  client: Octokit,
  owner: string,
  repo: string
): Promise<void> {
  await client.rest.repos.delete({
    owner,
    repo,
  });
}

export async function getRateLimit(client: Octokit) {
  const response = await client.rest.rateLimit.get();
  return {
    remaining: response.data.resources.core.remaining,
    limit: response.data.resources.core.limit,
    resetAt: new Date(response.data.resources.core.reset * 1000),
  };
}
