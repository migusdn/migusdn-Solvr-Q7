import axios from 'axios';
import { 
  GitHubRelease, 
  ProcessedRelease, 
  ReleaseDetails, 
  AuthorCommitStats, 
  RepositoryReleaseStats 
} from '../types/githubTypes';

// GitHub API base URL
const GITHUB_API_BASE_URL = 'https://api.github.com';

// Repositories to fetch releases from
const REPOSITORIES = ['stackflow', 'seed-design'];

// Cache for API responses to avoid redundant GitHub API calls
// These caches persist between requests during the application's lifetime

// General-purpose cache for any API response
const apiCache = new Map<string, any>();

// Cache for processed releases
const allReleaseMemo: ProcessedRelease[] = [];

// Cache for repository releases by owner/repo
const repositoryReleasesCache = new Map<string, GitHubRelease[]>();

// Cache for release details
const releaseDetailsCache = new Map<string, ReleaseDetails[]>();

// Cache for release comparison statistics
const releaseComparisonCache = new Map<string, {
  totalCommits: number;
  totalAdditions: number;
  totalDeletions: number;
  totalFilesChanged: number;
  authorStats: AuthorCommitStats[];
}>();


/**
 * Helper function to query GitHub API with retry logic
 * @param url API URL to query
 * @param headers Request headers
 * @returns Object containing response data and headers
 */
async function queryWithRetries<T>(url: string, headers: Record<string, string>): Promise<{data: T, headers: any}> {
  // Implement retry logic with exponential backoff
  let retries = 20;
  let delay = 1000; // Start with 1 second delay

  while (retries > 0) {
    try {
      console.log(`Querying: ${url}`);
      const response = await axios.get<T>(url, { headers });
      return {
        data: response.data,
        headers: response.headers
      };
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

        // Handle network errors like ECONNRESET
        if (retries > 1) {
          retries--;
          console.log(`Request failed: ${error.message}. Retrying in ${delay}ms... (${retries} retries left)`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; // Exponential backoff
          continue;
        }
      }

      // If we've exhausted retries or it's not a retryable error, throw
      throw error;
    }
  }

  throw new Error(`Failed to query ${url} after multiple retries`);
}

/**
 * Fetches releases from GitHub API with retry logic and rate limit handling
 * @param owner Repository owner
 * @param repo Repository name
 * @returns Array of GitHub releases
 */
async function fetchRepositoryReleases(owner: string, repo: string): Promise<GitHubRelease[]> {
  // Check if we have cached data for this repository
  const cacheKey = `${owner}/${repo}`;
  if (repositoryReleasesCache.has(cacheKey)) {
    console.log(`Using cached releases for ${owner}/${repo}`);
    return repositoryReleasesCache.get(cacheKey)!;
  }

  // 기본 URL에 per_page 매개변수 추가 (최대 100개)
  const baseUrl = `${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/releases`;

  // Get GitHub token from environment variables if available
  const token = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
  };

  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  try {
    // 모든 릴리즈를 저장할 배열
    let allReleases: GitHubRelease[] = [];
    let page = 1;
    let hasMorePages = true;

    // Implement retry logic with exponential backoff
    let retries = 3;
    let delay = 1000; // Start with 1 second delay

          // 모든 페이지 처리
          while (hasMorePages && retries > 0) {
      try {
        // 페이지 번호와 페이지당 최대 항목 수(100)를 포함한 URL 생성
        const url = `${baseUrl}?page=${page}&per_page=100`;
        console.log(`Fetching page ${page} for ${owner}/${repo} releases`);

        // Use the queryWithRetries helper function
        const response = await queryWithRetries<GitHubRelease[]>(url, headers);

        // 결과를 전체 배열에 추가
        allReleases = [...allReleases, ...response.data];

        // 다음 페이지가 있는지 확인 (Link 헤더 체크)
        if (response.headers.link && response.headers.link.includes('rel="next"')) {
          page++;
        } else {
          hasMorePages = false;
        }

        // 현재 페이지에 데이터가 없으면 중단
        if (response.data.length === 0) {
          hasMorePages = false;
        }
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

    // 모든 페이지를 가져왔거나 재시도 횟수를 모두 소진했을 때
    if (!hasMorePages) {
      console.log(`Fetched ${allReleases.length} releases for ${owner}/${repo}`);
      // Cache the results
      const cacheKey = `${owner}/${repo}`;
      repositoryReleasesCache.set(cacheKey, allReleases);
      return allReleases;
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
function processReleaseData(releases: GitHubRelease[], owner:string,repository: string): ProcessedRelease[] {
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
      owner,
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
    if (allReleaseMemo.length > 0) {
      console.log('Returning cached releases');
      return allReleaseMemo;
    }

    let allProcessedReleases: ProcessedRelease[] = [];

    for (const repo of REPOSITORIES) {
      // Assuming both repositories are owned by the same organization
      // In a real-world scenario, you might want to configure this per repository
      const owner = 'daangn'; // Organization name for the target repositories
      const releases = await fetchRepositoryReleases(owner, repo);
      const processedReleases = processReleaseData(releases, owner, repo);
      allProcessedReleases = [...allProcessedReleases, ...processedReleases];
    }

    // Cache the results
    allReleaseMemo.push(...allProcessedReleases);
    console.log(`Cached ${allProcessedReleases.length} processed releases`);

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
    // Check if we have cached data
    const cacheKey = 'allReleaseDetails';
    if (releaseDetailsCache.has(cacheKey)) {
      console.log('Using cached release details');
      return releaseDetailsCache.get(cacheKey)!;
    }

    let allReleaseDetails: ReleaseDetails[] = [];

    for (const repo of REPOSITORIES) {
      const owner = 'daangn';
      const releases = await fetchRepositoryReleases(owner, repo);
      const releaseDetails = releases.map(release => convertToReleaseDetails(release, repo));
      allReleaseDetails = [...allReleaseDetails, ...releaseDetails];
    }

    // Cache the results
    releaseDetailsCache.set(cacheKey, allReleaseDetails);

    return allReleaseDetails;
  } catch (error: any) {
    console.error('Error fetching all release details:', error.message);
    throw new Error(`Failed to fetch all release details: ${error.message}`);
  }
}

/**
 * Fetches releases for a specific repository
 * @param repository Repository name in the format "owner/repo"
 * @param startDate Optional start date for filtering releases
 * @param endDate Optional end date for filtering releases
 * @returns Repository release statistics
 */
export async function fetchRepositoryReleaseStats(
  repository: string,
  startDate?: string,
  endDate?: string
): Promise<RepositoryReleaseStats> {
  try {
    // Create a cache key that includes the date range if provided
    const cacheKey = `${repository}_stats_${startDate || 'all'}_${endDate || 'all'}`;

    // Check if we have cached data
    if (apiCache.has(cacheKey)) {
      console.log(`Using cached repository release stats for ${repository}`);
      return apiCache.get(cacheKey);
    }

    // Parse repository string to extract owner and repo
    const [owner, repo] = repository.split('/');

    if (!owner || !repo) {
      throw new Error('Invalid repository format. Expected format: owner/repo');
    }

    // Fetch releases for the repository
    const releases = await fetchRepositoryReleases(owner, repo);

    // Filter releases by date if provided
    let filteredReleases = releases;
    if (startDate || endDate) {
      filteredReleases = releases.filter(release => {
        const releaseDate = new Date(release.published_at);
        if (startDate && new Date(startDate) > releaseDate) {
          return false;
        }
        if (endDate && new Date(endDate) < releaseDate) {
          return false;
        }
        return true;
      });
    }

    // Sort releases by published date (newest first)
    filteredReleases.sort((a, b) => 
      new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    );

    // Process releases and get comparison stats
    const releaseStats = await Promise.all(
      filteredReleases.map(async (release, index) => {
        const previousRelease = index < filteredReleases.length - 1 
          ? filteredReleases[index + 1] 
          : null;

        const compareStats = previousRelease 
          ? await fetchReleaseComparisonStats(owner, repo, release.tag_name, previousRelease.tag_name)
          : {
              totalCommits: 0,
              totalAdditions: 0,
              totalDeletions: 0,
              totalFilesChanged: 0,
              authorStats: []
            };

        return {
          tagName: release.tag_name,
          name: release.name || release.tag_name,
          publishedAt: release.published_at,
          compareWithPrevious: compareStats
        };
      })
    );

    // Create the final result
    const result = {
      repository: repo,
      releases: releaseStats
    };

    // Cache the results
    apiCache.set(cacheKey, result);

    return result;
  } catch (error: any) {
    console.error(`Error fetching release stats for ${repository}:`, error.message);
    throw new Error(`Failed to fetch release stats for ${repository}: ${error.message}`);
  }
}

/**
 * Fetches comparison statistics between two releases
 * @param owner Repository owner
 * @param repo Repository name
 * @param currentTag Current release tag
 * @param previousTag Previous release tag
 * @returns Release comparison statistics
 */
async function fetchReleaseComparisonStats(
  owner: string,
  repo: string,
  currentTag: string,
  previousTag: string
): Promise<{
  totalCommits: number;
  totalAdditions: number;
  totalDeletions: number;
  totalFilesChanged: number;
  authorStats: AuthorCommitStats[];
}> {
  try {
    // Check if we have cached data for this comparison
    const cacheKey = `${owner}/${repo}/${previousTag}...${currentTag}`;
    if (releaseComparisonCache.has(cacheKey)) {
      console.log(`Using cached comparison stats for ${owner}/${repo} between ${previousTag} and ${currentTag}`);
      return releaseComparisonCache.get(cacheKey)!;
    }

    // Fetch comparison data from GitHub API
    const url = `${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/compare/${previousTag}...${currentTag}`;

    // Get GitHub token from environment variables if available
    const token = process.env.GITHUB_TOKEN;
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
    };

    if (token) {
      headers['Authorization'] = `token ${token}`;
    }

    // Check if we have this comparison data cached
    let comparisonData;
    if (apiCache.has(url)) {
      console.log(`Using cached API response for ${url}`);
      comparisonData = apiCache.get(url);
    } else {
      console.log(`Fetching comparison data for ${url}`);
      // Use queryWithRetries helper function
      const response = await queryWithRetries<any>(url, headers);
      comparisonData = response.data;
      // Cache the API response
      apiCache.set(url, comparisonData);
    }

    // Extract basic statistics
    const totalCommits = comparisonData.commits.length;
    let totalAdditions = 0;
    let totalDeletions = 0;
    let totalFilesChanged = 0;

    // Track author statistics
    const authorMap = new Map<string, {
      commits: number;
    }>();

    // Process each commit
    for (const commit of comparisonData.commits) {
      const author = commit.author ? commit.author.login : commit.commit.author.name;

      // Update author statistics
      const authorStats = authorMap.get(author) || {
        commits: 0,
        filesChanged: new Set<string>()
      };

      authorStats.commits += 1;


      authorMap.set(author, authorStats);
    }


    // Convert author map to array of AuthorCommitStats
    const authorStats: AuthorCommitStats[] = Array.from(authorMap.entries()).map(([author, stats]) => ({
      author,
      commits: stats.commits,
    }));

    // Sort by number of commits (descending)
    authorStats.sort((a, b) => b.commits - a.commits);

    // Create the final result
    const result = {
      totalCommits,
      totalAdditions,
      totalDeletions,
      totalFilesChanged,
      authorStats
    };

    // Cache the final comparison stats
    releaseComparisonCache.set(cacheKey, result);

    return result;
  } catch (error: any) {
    console.error(`Error fetching comparison stats between ${previousTag} and ${currentTag}:`, error.message);
    // Return empty stats on error
    return {
      totalCommits: 0,
      totalAdditions: 0,
      totalDeletions: 0,
      totalFilesChanged: 0,
      authorStats: []
    };
  }
}

export default {
  fetchAllReleases,
  fetchAllReleaseDetails,
  fetchRepositoryReleaseStats
};
