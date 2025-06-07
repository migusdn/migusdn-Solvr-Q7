import React from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { startExport } from '../../store/export';
import { RootState } from '../../store';

/**
 * ExportButton component
 */
const ExportButton: React.FC = () => {
  const dispatch = useAppDispatch();
  const { filters } = useAppSelector((state: RootState) => state.dashboard);
  const { loading } = useAppSelector((state: RootState) => state.export);

  /**
   * Handles export button click
   */
  const handleExport = () => {
    dispatch(startExport(filters));
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={loading}
      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <span className="flex items-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          내보내는 중...
        </span>
      ) : (
        <span className="flex items-center">
          <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          CSV 내보내기
        </span>
      )}
    </button>
  );
};

export default ExportButton;
