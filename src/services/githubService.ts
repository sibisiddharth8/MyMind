import apiClient from './apiClient';

// --- TYPE DEFINITIONS ---
export interface GitHubStats {
    stars: number;
    commits: number;
    prs: number;
    repos: number;
}
export interface GitHubRepo {
    id: number;
    html_url: string;
    name: string;
    description: string;
    stargazers_count: number;
    forks_count: number;
    language: string;
    pushed_at: string;
}
export interface GitHubActivity {
    id: string;
    type: string;
    repoName: string;
    repoUrl: string;
    config: {
        icon: string;
        label: string;
    };
}

export interface GitHubOverviewData {
    stats: GitHubStats;
    latestActivity: GitHubActivity[];
    popularRepos: GitHubRepo[]; // <-- ADD THIS LINE
}

// Response for the overview endpoint
interface GitHubOverviewResponse {
    success: boolean;
    data: GitHubOverviewData;
    message?: string;
}

interface GitHubReposResponse {
    success: boolean;
    data: GitHubRepo[];
    message?: string;
}

/**
 * Fetches the overview stats (commits, PRs, etc.) and latest activity.
 */
export const getGitHubOverview = async (): Promise<GitHubOverviewData> => {
    const { data } = await apiClient.get<GitHubOverviewResponse>('/github-overview');
    if (!data.success) throw new Error(data.message || "Failed to fetch GitHub overview.");
    return data.data;
};

/**
 * Fetches repositories from the backend, either by search or default sort.
 */
export const getGitHubRepos = async (searchTerm: string, sortBy: string): Promise<GitHubRepo[]> => {
    const { data } = await apiClient.get<GitHubReposResponse>('/github-repos', {
        params: { q: searchTerm, sort: sortBy }
    });
    if (!data.success) throw new Error(data.message || "Failed to fetch GitHub repos.");
    return data.data;
};