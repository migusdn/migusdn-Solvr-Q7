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
    gravatar_id: string;
    url: string;
    html_url: string;
    followers_url: string;
    following_url: string;
    gists_url: string;
    starred_url: string;
    subscriptions_url: string;
    organizations_url: string;
    repos_url: string;
    events_url: string;
    received_events_url: string;
    type: string;
    user_view_type: string;
    site_admin: boolean;
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
  isWorkingDay?: boolean;
}

export interface ReleaseStatistics {
  repository: string;
  releaseCount: number;
  workingDayReleaseCount: number;
  yearlyStats: { year: number; count: number; workingDayCount: number }[];
  monthlyStats: { year: number; month: number; count: number; workingDayCount: number }[];
  weeklyStats: { year: number; week: number; count: number; workingDayCount: number }[];
  dailyStats: { date: string; count: number; isWorkingDay: boolean }[];
  workingDaysBetweenReleases: { releaseTag: string; workingDaysSincePreviousRelease: number }[];
}
