import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { 
  DashboardData, 
  DashboardFilterParams, 
  DashboardResponse, 
  ErrorResponse 
} from '../types/dashboard';

/**
 * Dashboard state interface
 */
interface DashboardState {
  data: DashboardData | null;
  filters: DashboardFilterParams;
  loading: boolean;
  error: string | null;
}

/**
 * Initial dashboard state
 */
const initialState: DashboardState = {
  data: null,
  filters: {
    timeframe: 'daily',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    endDate: new Date().toISOString().split('T')[0], // today
    filters: {
      repository: [],
      releaseType: []
    },
    sort: {
      field: 'date',
      direction: 'desc'
    }
  },
  loading: false,
  error: null
};

/**
 * Async thunk for fetching dashboard data
 */
export const fetchDashboardData = createAsyncThunk<
  DashboardData,
  DashboardFilterParams,
  { rejectValue: string }
>(
  'dashboard/fetchData',
  async (params, { rejectWithValue }) => {
    try {
      const response = await axios.get<DashboardResponse>(
        '/api/v1/statistics/dashboard',
        { params }
      );
      
      if (response.data.success) {
        return response.data.data;
      } else {
        return rejectWithValue('Failed to fetch dashboard data');
      }
    } catch (error: any) {
      const errorResponse = error.response?.data as ErrorResponse;
      return rejectWithValue(
        errorResponse?.message || error.message || 'Failed to fetch dashboard data'
      );
    }
  }
);

/**
 * Dashboard slice
 */
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<DashboardFilterParams>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch dashboard data';
      });
  }
});

export const { setFilters, resetFilters, clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer;