import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { fetchDashboardData } from '../../store/dashboard';
import DashboardFilters from '../DashboardFilters/DashboardFilters';
import TimeSeriesChart from '../TimeSeriesChart/TimeSeriesChart';
import SummaryStats from '../SummaryStats/SummaryStats';
import TopRepositoriesChart from '../TopRepositoriesChart/TopRepositoriesChart';
import ReleaseTypeBreakdown from '../ReleaseTypeBreakdown/ReleaseTypeBreakdown';
import ExportButton from '../ExportButton/ExportButton';
import ExportProgressModal from '../ExportProgressModal/ExportProgressModal';

/**
 * Dashboard component
 */
const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data, filters, loading, error } = useAppSelector(state => state.dashboard);

  // Fetch dashboard data on component mount and when filters change
  useEffect(() => {
    dispatch(fetchDashboardData(filters));
  }, [dispatch, filters]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">GitHub 릴리스 대시보드</h1>
        <ExportButton />
      </div>

      {/* Filters */}
      <div className="mb-8">
        <DashboardFilters />
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6" role="alert">
          <p className="font-bold">오류 발생</p>
          <p>{error}</p>
        </div>
      )}

      {/* Dashboard content */}
      {data && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Summary statistics */}
          <div className="col-span-1 md:col-span-2">
            <SummaryStats stats={data.summaryStats} />
          </div>

          {/* Time series chart */}
          <div className="col-span-1 md:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">시간별 릴리스 추이</h2>
              <TimeSeriesChart data={data.timeSeriesData} />
            </div>
          </div>

          {/* Top repositories */}
          <div className="col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">상위 저장소</h2>
              <TopRepositoriesChart data={data.topRepositories} />
            </div>
          </div>

          {/* Release type breakdown */}
          <div className="col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">릴리스 타입 분포</h2>
              <ReleaseTypeBreakdown data={data.releaseTypeBreakdown} />
            </div>
          </div>
        </div>
      )}

      {/* Export Progress Modal */}
      <ExportProgressModal />
    </div>
  );
};

export default Dashboard;
