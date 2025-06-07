import React, { useState, useEffect } from 'react';
import { RootState } from '../../store';
import { AuthorStat } from '../../types/releaseStats';
import { fetchReleaseStats } from '../../store/releaseStats';
import AuthorStatsChart from './AuthorStatsChart';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';

interface ReleaseCommitStatsProps {}

const ReleaseCommitStats: React.FC<ReleaseCommitStatsProps> = () => {
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector((state: RootState) => state.releaseStats);
  const dashboardState = useAppSelector((state: RootState) => state.dashboard);
  const [selectedMetric, setSelectedMetric] = useState<'commits' | 'additions' | 'deletions' | 'filesChanged'>('commits');
  const [selectedRepoIndex, setSelectedRepoIndex] = useState<number>(0);

  // Create an array with the current repository data
  const releaseStatsArray = data ? [data] : [];

  // Get the currently selected repository stats
  const releaseStatsData = releaseStatsArray[selectedRepoIndex];


  // Fetch release stats when dashboard filters change
  useEffect(() => {
    const selectedRepositories = dashboardState.filters.filters?.repository || [];

    if (selectedRepositories.length > 0) {
      // Select the first repository from the list
      const repoToFetch = selectedRepositories[selectedRepoIndex >= selectedRepositories.length ? 0 : selectedRepoIndex];

      if (repoToFetch) {
        dispatch(fetchReleaseStats({
          repository: repoToFetch,
          startDate: dashboardState.filters.startDate,
          endDate: dashboardState.filters.endDate
        }));
      }
    }
  }, [dispatch, dashboardState.filters, selectedRepoIndex]);


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
          ? '선택한 저장소에 대한 릴리즈 데이터가 없습니다.' 
          : '릴리즈 통계를 보려면 저장소를 선택하세요.'}
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
            onChange={(e) => {
              const newIndex = Number(e.target.value);
              setSelectedRepoIndex(newIndex);

              // Fetch release stats for the selected repository
              const selectedRepositories = dashboardState.filters.filters?.repository || [];
              if (selectedRepositories.length > 0 && newIndex < selectedRepositories.length) {
                dispatch(fetchReleaseStats({
                  repository: selectedRepositories[newIndex],
                  startDate: dashboardState.filters.startDate,
                  endDate: dashboardState.filters.endDate
                }));
              }
            }}
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

    </div>
  );
};

export default ReleaseCommitStats;
