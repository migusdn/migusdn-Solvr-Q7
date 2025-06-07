import React from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { setFilters, resetFilters, fetchDashboardData } from '../../store/dashboard';
import { RootState } from '../../store';

/**
 * Dashboard filters component
 */
const DashboardFilters: React.FC = () => {
  const dispatch = useAppDispatch();
  const { filters } = useAppSelector((state: RootState) => state.dashboard);

  /**
   * Handles timeframe change
   */
  const handleTimeframeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const timeframe = e.target.value as 'daily' | 'weekly' | 'monthly';
    dispatch(setFilters({ timeframe }));
  };

  /**
   * Handles date range change
   */
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    dispatch(setFilters({ [name]: value }));
  };

  /**
   * Handles repository filter change
   */
  const handleRepositoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const repositories = Array.from(e.target.selectedOptions, option => option.value);
    dispatch(setFilters({ 
      filters: { 
        ...filters.filters, 
        repository: repositories 
      } 
    }));
  };

  /**
   * Handles apply filters button click
   */
  const handleApplyFilters = () => {
    dispatch(fetchDashboardData(filters));
  };

  /**
   * Handles reset filters button click
   */
  const handleResetFilters = () => {
    dispatch(resetFilters());
    dispatch(fetchDashboardData(filters));
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">필터</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Timeframe filter */}
        <div>
          <label htmlFor="timeframe" className="block text-sm font-medium text-gray-700 mb-1">
            시간 단위
          </label>
          <select
            id="timeframe"
            name="timeframe"
            value={filters.timeframe}
            onChange={handleTimeframeChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="daily">일별</option>
            <option value="weekly">주별</option>
            <option value="monthly">월별</option>
          </select>
        </div>

        {/* Start date filter */}
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
            시작일
          </label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={filters.startDate}
            onChange={handleDateChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* End date filter */}
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
            종료일
          </label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={filters.endDate}
            onChange={handleDateChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Repository filter */}
        <div>
          <label htmlFor="repository" className="block text-sm font-medium text-gray-700 mb-1">
            저장소
          </label>
          <select
            id="repository"
            name="repository"
            multiple
            value={filters.filters?.repository || []}
            onChange={handleRepositoryChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-24"
          >
            <option value="stackflow">Stackflow</option>
            <option value="seed-design">Seed Design</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">Ctrl 키를 누른 상태로 여러 항목 선택 가능</p>
        </div>

        {/* Release type filter - Placeholder for future implementation */}
        <div>
          <label htmlFor="releaseType" className="block text-sm font-medium text-gray-700 mb-1">
            릴리스 타입
          </label>
          <select
            id="releaseType"
            name="releaseType"
            multiple
            disabled
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-24 bg-gray-100"
          >
            <option value="regular">정식 릴리스</option>
            <option value="prerelease">프리릴리스</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">현재 지원되지 않는 기능입니다</p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={handleResetFilters}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          필터 초기화
        </button>
        <button
          type="button"
          onClick={handleApplyFilters}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          필터 적용
        </button>
      </div>
    </div>
  );
};

export default DashboardFilters;
