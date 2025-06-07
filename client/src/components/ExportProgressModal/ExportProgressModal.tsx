import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { setShowModal, resetExport } from '../../store/export';
import { RootState } from '../../store';

/**
 * ExportProgressModal component
 */
const ExportProgressModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { exportData, showModal, error } = useAppSelector((state: RootState) => state.export);

  // Close modal when ESC key is pressed
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, []);

  /**
   * Handles modal close
   */
  const handleClose = () => {
    // Only allow closing if export is completed or failed
    if (!exportData || exportData.status === 'completed' || exportData.status === 'failed') {
      dispatch(setShowModal(false));
      dispatch(resetExport());
    }
  };

  /**
   * Handles download button click
   */
  const handleDownload = () => {
    if (exportData?.downloadUrl) {
      window.open(exportData.downloadUrl, '_blank');
    }
  };

  // Don't render if modal is not shown
  if (!showModal) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              {/* Icon */}
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>

              {/* Content */}
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  CSV 내보내기
                </h3>
                <div className="mt-2">
                  {/* Error message */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                      <p className="text-sm">{error}</p>
                    </div>
                  )}

                  {/* Status message */}
                  <p className="text-sm text-gray-500 mb-4">
                    {!exportData && '내보내기 준비 중...'}
                    {exportData?.status === 'pending' && '내보내기 준비 중...'}
                    {exportData?.status === 'processing' && '내보내기 진행 중...'}
                    {exportData?.status === 'completed' && '내보내기가 완료되었습니다.'}
                    {exportData?.status === 'failed' && '내보내기 중 오류가 발생했습니다.'}
                  </p>

                  {/* Progress bar */}
                  {exportData && (exportData.status === 'pending' || exportData.status === 'processing') && (
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${exportData.progress || 0}%` }}
                      ></div>
                    </div>
                  )}

                  {/* Estimated time remaining */}
                  {exportData?.estimatedTimeRemaining && (exportData.status === 'pending' || exportData.status === 'processing') && (
                    <p className="text-xs text-gray-500 mb-4">
                      예상 남은 시간: {Math.ceil(exportData.estimatedTimeRemaining / 1000)}초
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            {/* Download button - only show when completed */}
            {exportData?.status === 'completed' && exportData.downloadUrl && (
              <button
                type="button"
                onClick={handleDownload}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                다운로드
              </button>
            )}

            {/* Close button - disabled during processing */}
            <button
              type="button"
              onClick={handleClose}
              disabled={exportData?.status === 'pending' || exportData?.status === 'processing'}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exportData?.status === 'completed' || exportData?.status === 'failed' ? '닫기' : '처리 중...'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportProgressModal;
