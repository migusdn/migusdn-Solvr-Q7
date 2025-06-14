import { createSlice, createAsyncThunk, PayloadAction, ActionReducerMapBuilder } from '@reduxjs/toolkit';
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
      repository: ["stackflow", "seed-design"],
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
  async (params: DashboardFilterParams, { rejectWithValue }) => {
    try {
      // 필터 객체를 JSON 문자열로 변환하여 전송
      const serializedParams = {
        ...params,
        filters: params.filters ? JSON.stringify(params.filters) : undefined,
        sort: params.sort ? JSON.stringify(params.sort) : undefined
      };

      const response = await axios.get<DashboardResponse>(
        '/api/v1/statistics/dashboard',
        { params: serializedParams }
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
    setFilters: (state: DashboardState, action: PayloadAction<Partial<DashboardFilterParams>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state: DashboardState) => {
      state.filters = initialState.filters;
    },
    clearError: (state: DashboardState) => {
      state.error = null;
    }
  },
  extraReducers: (builder: ActionReducerMapBuilder<DashboardState>) => {
    builder
      .addCase(fetchDashboardData.pending, (state: DashboardState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state: DashboardState, action: PayloadAction<DashboardData>) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchDashboardData.rejected, (state: DashboardState, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch dashboard data';
      });
  }
});

export const { setFilters, resetFilters, clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer;
