import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { AuthorStat } from '../../types/releaseStats';
import AuthorStatsChart from './AuthorStatsChart';
import ReleaseComparisonTable from './ReleaseComparisonTable';

interface ReleaseCommitStatsProps {}

const ReleaseCommitStats: React.FC<ReleaseCommitStatsProps> = () => {
  const { data, loading, error } = useSelector((state: RootState) => state.releaseStats);
  const dashboardState = useSelector((state: RootState) => state.dashboard);
  const [selectedMetric, setSelectedMetric] = useState<'commits' | 'additions' | 'deletions' | 'filesChanged'>('commits');
  const [selectedRelease, setSelectedRelease] = useState<string | null>(null);
  const [selectedRepoIndex, setSelectedRepoIndex] = useState<number>(0);

  // Create an array with the current repository data
  const releaseStatsArray = data ? [data] : [];

  // Get the currently selected repository stats
  const releaseStatsData = releaseStatsArray[selectedRepoIndex];

  // Reset selected release when changing repository
  useEffect(() => {
    setSelectedRelease(null);
  }, [selectedRepoIndex]);

  // Get selected release data
  const selectedReleaseData = selectedRelease && releaseStatsData
    ? releaseStatsData.releases.find((release: any) => release.tagName === selectedRelease)
    : null;

  // Get all authors across all releases
  const getAllAuthors = (): AuthorStat[] => {
    if (!releaseStatsData) return [];

    const authorMap = new Map<string, AuthorStat>();

    releaseStatsData.releases.forEach((release: any) => {
      release.compareWithPrevious.authorStats.forEach((author: any) => {
        const existing = authorMap.get(author.author);
        if (existing) {
          authorMap.set(author.author, {
            author: author.author,
            commits: existing.commits + author.commits,
            additions: existing.additions + author.additions,
            deletions: existing.deletions + author.deletions,
            filesChanged: existing.filesChanged + author.filesChanged
          });
        } else {
          authorMap.set(author.author, { ...author });
        }
      });
    });

    return Array.from(authorMap.values()).sort((a, b) => b.commits - a.commits);
  };

  if (loading) {
    return <div className="p-4 text-center">Loading release statistics...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  }

  if (releaseStatsArray.length === 0) {
    return (
      <div className="p-4 text-center">
        {dashboardState.filters.filters?.repository && dashboardState.filters.filters.repository.length > 0
          ? 'No release data available for the selected repositories.' 
          : 'Please select a repository to view release statistics.'}
      </div>
    );
  }

  return (
    <div className="release-commit-stats">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">릴리즈 커밋 통계</h2>

        {/* Repository selector */}
        <div className="mb-2">
          <label className="mr-2 text-sm">저장소:</label>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={selectedRepoIndex}
            onChange={(e) => setSelectedRepoIndex(Number(e.target.value))}
          >
            {releaseStatsArray.map((stats: any, index: number) => (
              <option key={stats.repository} value={index}>
                {stats.repository}
              </option>
            ))}
          </select>
        </div>

        {releaseStatsData && (
          <p className="text-gray-600">
            {releaseStatsData.releases.length > 0 
              ? `${releaseStatsData.releases.length}개의 릴리즈` 
              : '릴리즈 데이터 없음'}
          </p>
        )}
      </div>

      {/* Metric selector */}
      <div className="mb-4 flex items-center">
        <label className="mr-2 text-sm">통계 지표:</label>
        <select
          className="border rounded px-2 py-1 text-sm"
          value={selectedMetric}
          onChange={(e) => setSelectedMetric(e.target.value as any)}
        >
          <option value="commits">커밋 수</option>
          <option value="additions">추가된 라인 수</option>
          <option value="deletions">삭제된 라인 수</option>
          <option value="filesChanged">변경된 파일 수</option>
        </select>
      </div>

      {/* Author statistics chart */}
      {releaseStatsData && releaseStatsData.releases.length > 0 && (
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-medium mb-4">작성자별 통계</h3>
          <div className="h-64">
            <AuthorStatsChart 
              authorStats={getAllAuthors()} 
              metric={selectedMetric} 
            />
          </div>
        </div>
      )}

      {/* Release comparison table */}
      {releaseStatsData && releaseStatsData.releases.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-medium mb-4">릴리즈 비교</h3>
          <ReleaseComparisonTable 
            releases={releaseStatsData.releases}
            selectedRelease={selectedRelease}
            onSelectRelease={setSelectedRelease}
          />
        </div>
      )}

      {/* Selected release details */}
      {releaseStatsData && selectedReleaseData && (
        <div className="mt-6 bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-medium mb-4">
            릴리즈 상세: {selectedReleaseData.name} ({selectedReleaseData.tagName})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-sm text-gray-500">커밋 수</div>
              <div className="text-xl font-semibold">
                {selectedReleaseData.compareWithPrevious.totalCommits}
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-sm text-gray-500">추가된 라인</div>
              <div className="text-xl font-semibold text-green-600">
                +{selectedReleaseData.compareWithPrevious.totalAdditions.toLocaleString()}
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-sm text-gray-500">삭제된 라인</div>
              <div className="text-xl font-semibold text-red-600">
                -{selectedReleaseData.compareWithPrevious.totalDeletions.toLocaleString()}
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-sm text-gray-500">변경된 파일</div>
              <div className="text-xl font-semibold">
                {selectedReleaseData.compareWithPrevious.totalFilesChanged}
              </div>
            </div>
          </div>

          {/* Author contributions for selected release */}
          <h4 className="font-medium mb-2">작성자별 기여도</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2">작성자</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider py-2">커밋</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider py-2">추가</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider py-2">삭제</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider py-2">파일</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {selectedReleaseData.compareWithPrevious.authorStats.map((author: any) => (
                  <tr key={author.author}>
                    <td className="py-2">{author.author}</td>
                    <td className="text-right py-2">{author.commits}</td>
                    <td className="text-right py-2 text-green-600">+{author.additions.toLocaleString()}</td>
                    <td className="text-right py-2 text-red-600">-{author.deletions.toLocaleString()}</td>
                    <td className="text-right py-2">{author.filesChanged}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReleaseCommitStats;
