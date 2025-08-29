import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DashboardState, ReportSummary, ProcessedTestReport, DashboardFilters } from '../types';

const initialState: DashboardState = {
  reports: [],
  selectedReport: null,
  loading: false,
  error: null,
  filters: {},
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setReports: (state, action: PayloadAction<ReportSummary[]>) => {
      state.reports = action.payload;
    },
    setSelectedReport: (state, action: PayloadAction<ProcessedTestReport | null>) => {
      state.selectedReport = action.payload;
    },
    setFilters: (state, action: PayloadAction<DashboardFilters>) => {
      state.filters = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    addReport: (state, action: PayloadAction<ReportSummary>) => {
      state.reports.unshift(action.payload);
    },
    updateReport: (state, action: PayloadAction<ReportSummary>) => {
      const index = state.reports.findIndex(r => r.id === action.payload.id);
      if (index !== -1) {
        state.reports[index] = action.payload;
      }
    },
    removeReport: (state, action: PayloadAction<string>) => {
      state.reports = state.reports.filter(r => r.id !== action.payload);
    },
  },
});

export const {
  setLoading,
  setError,
  setReports,
  setSelectedReport,
  setFilters,
  clearError,
  addReport,
  updateReport,
  removeReport,
} = dashboardSlice.actions;

export default dashboardSlice.reducer; 