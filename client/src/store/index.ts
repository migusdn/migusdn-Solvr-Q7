import { configureStore } from '@reduxjs/toolkit';
import dashboardReducer from './dashboard';
import exportReducer from './export';

/**
 * Redux store configuration
 */
export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    export: exportReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
