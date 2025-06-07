import { createSlice, createAsyncThunk, PayloadAction, ActionReducerMapBuilder } from '@reduxjs/toolkit';
import axios from 'axios';
import { 
  ExportRequestParams, 
  ExportResponse, 
  ExportStatusResponse, 
  ExportData, 
  ExportOptions 
} from '../types/export';
import { DashboardFilterParams } from '../types/dashboard';

/**
 * Export state interface
 */
interface ExportState {
  exportData: ExportData | null;
  exportOptions: ExportOptions;
  loading: boolean;
  error: string | null;
  showModal: boolean;
  pollingInterval: number | null;
}

/**
 * Initial export state
 */
const initialState: ExportState = {
  exportData: null,
  exportOptions: {
    includeTimeSeriesData: true,
    includeRepositoryBreakdown: true,
    includeReleaseTypeBreakdown: true
  },
  loading: false,
  error: null,
  showModal: false,
  pollingInterval: null
};

/**
 * Async thunk for starting CSV export
 */
export const startExport = createAsyncThunk<
  ExportData,
  DashboardFilterParams,
  { rejectValue: string }
>(
  'export/startExport',
  async (dashboardFilters: DashboardFilterParams, { getState, rejectWithValue, dispatch }) => {
    try {
      // Get export options from state
      const state = getState() as { export: ExportState };
      const { exportOptions } = state.export;

      // Prepare request parameters
      const params: ExportRequestParams = {
        ...dashboardFilters,
        exportOptions
      };

      // Start export
      const response = await axios.post<ExportResponse>(
        '/api/v1/export/dashboard-csv',
        params
      );

      if (response.data.success) {
        // Start polling for export status
        const pollingInterval = window.setInterval(() => {
          dispatch(checkExportStatus(response.data.data.exportId));
        }, 2000); // Poll every 2 seconds

        // Store polling interval in state
        dispatch(setPollingInterval(pollingInterval));

        return response.data.data;
      } else {
        return rejectWithValue('Failed to start export');
      }
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to start export'
      );
    }
  }
);

/**
 * Async thunk for checking export status
 */
export const checkExportStatus = createAsyncThunk<
  ExportData,
  string,
  { rejectValue: string }
>(
  'export/checkStatus',
  async (exportId: string, { dispatch, rejectWithValue, getState }) => {
    try {
      const response = await axios.get<ExportStatusResponse>(
        `/api/v1/export/status/${exportId}`
      );

      if (response.data.success) {
        const exportData = response.data.data;

        // If export is completed or failed, stop polling
        if (exportData.status === 'completed' || exportData.status === 'failed') {
          const state = getState() as { export: ExportState };
          if (state.export.pollingInterval) {
            clearInterval(state.export.pollingInterval);
            dispatch(setPollingInterval(null));
          }
        }

        return exportData;
      } else {
        return rejectWithValue('Failed to check export status');
      }
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to check export status'
      );
    }
  }
);

/**
 * Export slice
 */
const exportSlice = createSlice({
  name: 'export',
  initialState,
  reducers: {
    setExportOptions: (state: ExportState, action: PayloadAction<Partial<ExportOptions>>) => {
      state.exportOptions = { ...state.exportOptions, ...action.payload };
    },
    setShowModal: (state: ExportState, action: PayloadAction<boolean>) => {
      state.showModal = action.payload;
    },
    setPollingInterval: (state: ExportState, action: PayloadAction<number | null>) => {
      state.pollingInterval = action.payload;
    },
    resetExport: (state: ExportState) => {
      // Clear polling interval if it exists
      if (state.pollingInterval) {
        clearInterval(state.pollingInterval);
      }

      return {
        ...initialState,
        exportOptions: state.exportOptions // Preserve export options
      };
    }
  },
  extraReducers: (builder: ActionReducerMapBuilder<ExportState>) => {
    builder
      // Start export
      .addCase(startExport.pending, (state: ExportState) => {
        state.loading = true;
        state.error = null;
        state.showModal = true;
      })
      .addCase(startExport.fulfilled, (state: ExportState, action: PayloadAction<ExportData>) => {
        state.loading = false;
        state.exportData = action.payload;
      })
      .addCase(startExport.rejected, (state: ExportState, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Failed to start export';
      })

      // Check export status
      .addCase(checkExportStatus.fulfilled, (state: ExportState, action: PayloadAction<ExportData>) => {
        state.exportData = action.payload;
      })
      .addCase(checkExportStatus.rejected, (state: ExportState, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Failed to check export status';
        // Stop polling on error
        if (state.pollingInterval) {
          clearInterval(state.pollingInterval);
          state.pollingInterval = null;
        }
      });
  }
});

export const { 
  setExportOptions, 
  setShowModal, 
  setPollingInterval, 
  resetExport 
} = exportSlice.actions;
export default exportSlice.reducer;
