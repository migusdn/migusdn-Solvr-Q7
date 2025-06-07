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
export interface ReleaseDetails {
  repository_name: string;
  release_id: number;
  tag_name: string;
  release_name: string;
  html_url: string;
  is_draft: boolean;
  is_prerelease: boolean;
  created_at: string; // ISO8601 String
  published_at: string; // ISO8601 String
  author_login: string;
  author_type: string; // 예: "User", "Bot"
  body_content: string | null;
  target_commitish: string; // 릴리즈 대상 브랜치 또는 커밋
  assets_count: number;
  tarball_url: string | null;
  zipball_url: string | null;
  published_year: number;
  published_month: number; // 1-12
  published_day: number; // 1-31
  published_week: number; // 연중 몇 번째 주인지 (ISO 8601)
  body_length: number; // 릴리즈 노트 본문의 글자 수
}



