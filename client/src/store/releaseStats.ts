import { createSlice, createAsyncThunk, PayloadAction, ActionReducerMapBuilder } from '@reduxjs/toolkit';
import axios from 'axios';
import { 
  RepositoryReleaseStats, 
  ReleaseStatsFilterParams, 
  ReleaseStatsResponse 
} from '../types/releaseStats';

/**
 * Release statistics state interface
 */
interface ReleaseStatsState {
  data: RepositoryReleaseStats | null;
  filters: ReleaseStatsFilterParams;
  loading: boolean;
  error: string | null;
}

/**
 * Initial release statistics state
 */
const initialState: ReleaseStatsState = {
  data: null,
  filters: {
    repository: '',
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days ago
    endDate: new Date().toISOString().split('T')[0], // today
  },
  loading: false,
  error: null
};

/**
 * Async thunk for fetching release statistics
 */
export const fetchReleaseStats = createAsyncThunk<
  RepositoryReleaseStats,
  ReleaseStatsFilterParams,
  { rejectValue: string }
>(
  'releaseStats/fetchData',
  async (params: ReleaseStatsFilterParams, { rejectWithValue }) => {
    try {
      if (!params.repository) {
        return rejectWithValue('Repository is required');
      }

      const response = await axios.get<ReleaseStatsResponse>(
        '/api/github/releases/stats',
        { params }
      );

      if (response.data.success) {
        return response.data.data;
      } else {
        return rejectWithValue('Failed to fetch release statistics');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch release statistics';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Release statistics slice
 */
const releaseStatsSlice = createSlice({
  name: 'releaseStats',
  initialState,
  reducers: {
    setFilters: (state: ReleaseStatsState, action: PayloadAction<Partial<ReleaseStatsFilterParams>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state: ReleaseStatsState) => {
      state.filters = initialState.filters;
    },
    clearError: (state: ReleaseStatsState) => {
      state.error = null;
    }
  },
  extraReducers: (builder: ActionReducerMapBuilder<ReleaseStatsState>) => {
    builder
      .addCase(fetchReleaseStats.pending, (state: ReleaseStatsState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReleaseStats.fulfilled, (state: ReleaseStatsState, action: PayloadAction<RepositoryReleaseStats>) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchReleaseStats.rejected, (state: ReleaseStatsState, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch release statistics';
      });
  }
});

export const { setFilters, resetFilters, clearError } = releaseStatsSlice.actions;
export default releaseStatsSlice.reducer;