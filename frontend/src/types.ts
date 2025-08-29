export interface ProcessedTestReport {
  execution: {
    id: string;
    reportNumber: number;
    uniqueId: string;
    developer: string;
    timestamp: Date;
    startTime: Date;
    endTime: Date;
    branch?: string;
    environment: string;
    duration: number;
    intent?: TestExecutionIntent;
    insights?: ExecutionInsights;
    metadata?: ExecutionMetadata;
  };
  results: TestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    expectedFails?: number;
    unexpectedFails?: number;
    expectedPasses?: number;
    unexpectedPasses?: number;
  };
}

export interface TestResult {
  testName: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  screenshots: string[];
  traceFile?: string;
  expectedOutcome?: 'pass' | 'fail';
  actualOutcome?: 'pass' | 'fail' | 'skip';
  outcomeMatch?: boolean;
}

export interface TestExecutionIntent {
  purpose: 'development' | 'debugging' | 'regression' | 'validation' | 'exploration' | 'ci-cd' | 'manual';
  description?: string;
  expectFailures: boolean;
  targetTests?: string[];
  goals: string[];
  context?: string;
}

export interface ExecutionInsights {
  reasoning: string;
  expectedBehavior: string;
  actualBehavior: string;
  surprises: string[];
  learnings: string[];
  nextSteps: string[];
  confidence: number; // 1-10 scale
}

export interface ExecutionMetadata {
  gitCommit?: string;
  gitDiff?: string;
  codeChanges?: string[];
  relatedTickets?: string[];
  testRunReason: string;
  tags: string[];
}

export interface ReportSummary {
  id: string;
  timestamp: Date;
  developer: string;
  branch?: string;
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
  };
  url: string;
}

export interface DashboardState {
  reports: ReportSummary[];
  selectedReport: ProcessedTestReport | null;
  loading: boolean;
  error: string | null;
  filters: {
    developer?: string;
    dateRange?: {
      start: Date;
      end: Date;
    };
    testName?: string;
    status?: 'passed' | 'failed' | 'skipped';
  };
}

export interface DashboardFilters {
  developer?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  testName?: string;
  status?: 'passed' | 'failed' | 'skipped';
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }[];
}

export interface TrendData {
  date: string;
  passed: number;
  failed: number;
  total: number;
  passRate: number;
}

export interface DeveloperStats {
  developer: string;
  totalTests: number;
  passRate: number;
  avgDuration: number;
  lastActivity: Date;
}

export interface TestInsight {
  testName: string;
  failureRate: number;
  avgDuration: number;
  lastFailure?: Date;
  isFlaky: boolean;
}

export interface GitHubConfig {
  owner: string;
  repo: string;
  token?: string;
  apiUrl: string;
} 