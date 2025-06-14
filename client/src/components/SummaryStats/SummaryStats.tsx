import React from 'react';
import { SummaryStats as SummaryStatsType } from '../../types/dashboard';

/**
 * SummaryStats component props
 */
interface SummaryStatsProps {
  stats: SummaryStatsType;
}

/**
 * SummaryStats component
 */
const SummaryStats: React.FC<SummaryStatsProps> = ({ stats }) => {
  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">요약 통계</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {/* Total Releases */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-blue-500 text-sm font-medium uppercase tracking-wide">
            총 릴리스
          </div>
          <div className="mt-2 flex justify-between items-end">
            <div className="text-3xl font-bold text-blue-700">
              {stats.totalReleases}
            </div>
            <div className="text-blue-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Commits */}
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-green-500 text-sm font-medium uppercase tracking-wide">
            총 커밋
          </div>
          <div className="mt-2 flex justify-between items-end">
            <div className="text-3xl font-bold text-green-700">
              {stats.totalCommits}
            </div>
            <div className="text-green-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Contributors */}
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="text-purple-500 text-sm font-medium uppercase tracking-wide">
            총 기여자
          </div>
          <div className="mt-2 flex justify-between items-end">
            <div className="text-3xl font-bold text-purple-700">
              {stats.totalContributors}
            </div>
            <div className="text-purple-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/*/!* Total Code Additions *!/*/}
        {/*{stats.totalAdditions !== undefined && (*/}
        {/*  <div className="bg-emerald-50 rounded-lg p-4">*/}
        {/*    <div className="text-emerald-500 text-sm font-medium uppercase tracking-wide">*/}
        {/*      추가된 코드*/}
        {/*    </div>*/}
        {/*    <div className="mt-2 flex justify-between items-end">*/}
        {/*      <div className="text-3xl font-bold text-emerald-700">*/}
        {/*        {stats.totalAdditions.toLocaleString()}*/}
        {/*      </div>*/}
        {/*      <div className="text-emerald-500">*/}
        {/*        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">*/}
        {/*          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />*/}
        {/*        </svg>*/}
        {/*      </div>*/}
        {/*    </div>*/}
        {/*  </div>*/}
        {/*)}*/}

        {/*/!* Total Code Deletions *!/*/}
        {/*{stats.totalDeletions !== undefined && (*/}
        {/*  <div className="bg-rose-50 rounded-lg p-4">*/}
        {/*    <div className="text-rose-500 text-sm font-medium uppercase tracking-wide">*/}
        {/*      삭제된 코드*/}
        {/*    </div>*/}
        {/*    <div className="mt-2 flex justify-between items-end">*/}
        {/*      <div className="text-3xl font-bold text-rose-700">*/}
        {/*        {stats.totalDeletions.toLocaleString()}*/}
        {/*      </div>*/}
        {/*      <div className="text-rose-500">*/}
        {/*        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">*/}
        {/*          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />*/}
        {/*        </svg>*/}
        {/*      </div>*/}
        {/*    </div>*/}
        {/*  </div>*/}
        {/*)}*/}

        {/* Average Commits Per Release */}
        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="text-yellow-500 text-sm font-medium uppercase tracking-wide">
            릴리스당 평균 커밋
          </div>
          <div className="mt-2 flex justify-between items-end">
            <div className="text-3xl font-bold text-yellow-700">
              {stats.averageCommitsPerRelease.toFixed(1)}
            </div>
            <div className="text-yellow-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Average Time to Release */}
        <div className="bg-red-50 rounded-lg p-4">
          <div className="text-red-500 text-sm font-medium uppercase tracking-wide">
            평균 릴리스 소요일
          </div>
          <div className="mt-2 flex justify-between items-end">
            <div className="text-3xl font-bold text-red-700">
              {stats.averageTimeToRelease.toFixed(1)}
            </div>
            <div className="text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Releases */}
      {stats.recentReleases && stats.recentReleases.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-3">최근 릴리스</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2">릴리스</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2">날짜</th>
                    <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider py-2">커밋</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stats.recentReleases.map(release => (
                    <tr key={release.tagName}>
                      <td className="py-2">
                        <div className="font-medium">{release.name}</div>
                        <div className="text-sm text-gray-500">{release.tagName}</div>
                      </td>
                      <td className="py-2">{formatDate(release.publishedAt)}</td>
                      <td className="text-right py-2">{release.commitCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Contributors */}
          {stats.topContributors && stats.topContributors.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-3">주요 기여자</h3>
              <div className="space-y-3">
                {stats.topContributors.slice(0, 5).map(contributor => (
                  <div key={contributor.author} className="flex items-center">
                    <div className="w-1/4 truncate">{contributor.author}</div>
                    <div className="w-3/4">
                      <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="absolute top-0 left-0 h-full bg-blue-500"
                          style={{ width: `${contributor.contributionPercentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs mt-1">
                        <span>{contributor.commits}개 커밋</span>
                        <span>{contributor.contributionPercentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SummaryStats;
