import { configureStore } from '@reduxjs/toolkit';
import dashboardReducer from './dashboard';
import exportReducer from './export';
import releaseStatsReducer from './releaseStats';

/**
 * Redux store configuration
 */
export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    export: exportReducer,
    releaseStats: releaseStatsReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
