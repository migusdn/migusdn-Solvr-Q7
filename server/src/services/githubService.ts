import axios from 'axios';
import { GitHubRelease, ProcessedRelease, ReleaseDetails } from '../types/githubTypes';

// GitHub API base URL
const GITHUB_API_BASE_URL = 'https://api.github.com';

// Repositories to fetch releases from
const REPOSITORIES = ['stackflow', 'seed-design'];

const allReleaseMemo: ProcessedRelease[] = [];

/**
 * Fetches releases from GitHub API with retry logic and rate limit handling
 * @param owner Repository owner
 * @param repo Repository name
 * @returns Array of GitHub releases
 */
async function fetchRepositoryReleases(owner: string, repo: string): Promise<GitHubRelease[]> {
  const url = `${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/releases`;

  // Get GitHub token from environment variables if available
  const token = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
  };

  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  try {
    // Implement retry logic with exponential backoff
    let retries = 3;
    let delay = 1000; // Start with 1 second delay

    while (retries > 0) {
      try {
        const response = await axios.get<GitHubRelease[]>(url, { headers });
        return response.data;
      } catch (error: any) {
        if (error.response) {
          // Handle rate limiting
          if (error.response.status === 403 && error.response.headers['x-ratelimit-remaining'] === '0') {
            const resetTime = parseInt(error.response.headers['x-ratelimit-reset']) * 1000;
            const waitTime = resetTime - Date.now();

            console.log(`Rate limit exceeded. Waiting for ${waitTime / 1000} seconds.`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue; // Try again after waiting
          }

          // Handle other HTTP errors
          if (retries > 1) {
            retries--;
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2; // Exponential backoff
            continue;
          }
        }

        // If we've exhausted retries or it's not a retryable error, throw
        throw error;
      }
    }

    throw new Error('Failed to fetch releases after multiple retries');
  } catch (error: any) {
    console.error(`Error fetching releases for ${owner}/${repo}:`, error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw new Error(`Failed to fetch releases for ${owner}/${repo}: ${error.message}`);
  }
}

/**
 * Processes raw GitHub release data into a standardized format
 * @param releases Raw GitHub release data
 * @param repository Repository name
 * @returns Processed release data
 */
function processReleaseData(releases: GitHubRelease[], repository: string): ProcessedRelease[] {
  return releases.map(release => {
    const publishedDate = new Date(release.published_at);
    const year = publishedDate.getFullYear();
    const month = publishedDate.getMonth() + 1; // JavaScript months are 0-indexed

    // Calculate week number (ISO week)
    const date = new Date(publishedDate);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    const week = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 4).getTime()) / 86400000 / 7) + 1;

    return {
      repository,
      tag_name: release.tag_name,
      name: release.name || release.tag_name,
      published_at: release.published_at,
      created_at: release.created_at,
      author: release.author.login,
      year,
      month,
      week,
      day: publishedDate.getDate()
    };
  });
}

/**
 * Fetches all releases from configured repositories
 * @returns Array of processed releases
 */
export async function fetchAllReleases(): Promise<ProcessedRelease[]> {
  try {
    if( allReleaseMemo.length > 0) {
      console.log('Returning cached releases');
      return allReleaseMemo;
    }


    let allProcessedReleases: ProcessedRelease[] = [];

    for (const repo of REPOSITORIES) {
      // Assuming both repositories are owned by the same organization
      // In a real-world scenario, you might want to configure this per repository
      const owner = 'daangn'; // Organization name for the target repositories
      const releases = await fetchRepositoryReleases(owner, repo);
      const processedReleases = processReleaseData(releases, repo);
      allProcessedReleases = [...allProcessedReleases, ...processedReleases];
    }

    return allProcessedReleases;
  } catch (error: any) {
    console.error('Error fetching all releases:', error.message);
    throw new Error(`Failed to fetch all releases: ${error.message}`);
  }
}

/**
 * Converts a GitHubRelease to a ReleaseDetails object
 * @param release Raw GitHub release data
 * @param repository Repository name
 * @returns ReleaseDetails object
 */
function convertToReleaseDetails(release: GitHubRelease, repository: string): ReleaseDetails {
  const publishedDate = new Date(release.published_at);
  const year = publishedDate.getFullYear();
  const month = publishedDate.getMonth() + 1; // JavaScript months are 0-indexed

  // Calculate week number (ISO week)
  const date = new Date(publishedDate);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  const week = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 4).getTime()) / 86400000 / 7) + 1;

  return {
    repository_name: repository,
    release_id: release.id,
    tag_name: release.tag_name,
    release_name: release.name || release.tag_name,
    html_url: release.html_url,
    is_draft: release.draft,
    is_prerelease: release.prerelease,
    created_at: release.created_at,
    published_at: release.published_at,
    author_login: release.author.login,
    author_type: 'User', // Assuming all authors are users for simplicity
    body_content: release.body,
    target_commitish: release.target_commitish,
    assets_count: release.assets.length,
    tarball_url: release.tarball_url,
    zipball_url: release.zipball_url,
    published_year: year,
    published_month: month,
    published_day: publishedDate.getDate(),
    published_week: week,
    body_length: release.body ? release.body.length : 0
  };
}

/**
 * Fetches all releases and converts them to ReleaseDetails objects
 * @returns Array of ReleaseDetails objects
 */
export async function fetchAllReleaseDetails(): Promise<ReleaseDetails[]> {
  try {
    let allReleaseDetails: ReleaseDetails[] = [];

    for (const repo of REPOSITORIES) {
      const owner = 'daangn';
      const releases = await fetchRepositoryReleases(owner, repo);
      const releaseDetails = releases.map(release => convertToReleaseDetails(release, repo));
      allReleaseDetails = [...allReleaseDetails, ...releaseDetails];
    }

    return allReleaseDetails;
  } catch (error: any) {
    console.error('Error fetching all release details:', error.message);
    throw new Error(`Failed to fetch all release details: ${error.message}`);
  }
}

export default {
  fetchAllReleases,
  fetchAllReleaseDetails
};
