export interface GitHubRelease {
  url: string;
  html_url: string;
  assets_url: string;
  upload_url: string;
  tarball_url: string;
  zipball_url: string;
  id: number;
  node_id: string;
  tag_name: string;
  target_commitish: string;
  name: string;
  body: string;
  draft: boolean;
  prerelease: boolean;
  created_at: string;
  published_at: string;
  author: {
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    url: string;
  };
  assets: any[];
}

export interface ProcessedRelease {
  repository: string;
  tag_name: string;
  name: string;
  published_at: string;
  created_at: string;
  author: string;
  year: number;
  month: number;
  week: number;
  day: number;
}

export interface ReleaseStatistics {
  repository: string;
  releaseCount: number;
  yearlyStats: { year: number; count: number }[];
  monthlyStats: { year: number; month: number; count: number }[];
  weeklyStats: { year: number; week: number; count: number }[];
  dailyStats: { date: string; count: number }[];
}