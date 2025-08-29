# Playwright Trace Intelligence Platform - Project Context

## Project Overview

An AI-powered Playwright trace analysis platform that automatically collects and analyzes Playwright trace files to provide deep insights into test execution, performance, and failure patterns. Built specifically for Playwright's rich trace data format.

## Vision Statement

Create a simple Playwright report consolidation platform that:
- **Consolidates local test execution reports** - developers upload their local Playwright traces
- **GitHub-hosted platform** - frontend on GitHub Pages, data stored in GitHub repo
- **Zero infrastructure required** - no servers, Docker, or complex setup needed
- **Team-wide visibility** - see consolidated test reports from all team members
- **Historical tracking** - track test trends across local executions over time
- **Organization-private** - all data stays within your GitHub organization
- **Simple CLI tool** - easy upload of local test results to the platform
- **Future AI enhancement** - AI analysis capabilities can be added later

## Core Features

### 1. Local Test Report Upload
- **CLI Tool for Local Uploads**
  - Simple command to upload local Playwright test results
  - Supports both successful and failed test traces
  - Automatically detects test-results directory
  - Compresses and uploads trace files to GitHub repository

- **Flexible Collection Options**
  - Upload all tests or just failures
  - Batch upload multiple test runs
  - Include screenshots, videos, and network data
  - Team member identification and tagging

### 2. Report Analysis & Insights
- **Basic Failure Analysis**
  - Extract and display error messages from traces
  - Show screenshots at failure points
  - Display network request failures
  - Organize failures by test name and error type

- **Simple Pattern Recognition**
  - Identify frequently failing tests across the team
  - Show common error patterns
  - Track test stability over time
  - Basic statistics on pass/fail rates

### 3. Consolidated Team Insights
- **Team-Wide Test Dashboard**
  - See test results from all team members in one place
  - Track which tests are failing most often across the team
  - Identify environmental issues affecting multiple developers
  - Monitor test suite health trends over time

- **Developer-Specific Views**
  - Individual developer test history and patterns
  - Personal failure trends and improvement areas
  - Compare your test results with team averages
  - Track your testing activity and coverage

### 4. GitHub Pages Dashboard
- **Consolidated Test Reports**
  - View all team test executions in chronological order
  - Filter by developer, test name, or date range
  - Quick overview of pass/fail rates across the team
  - Downloadable reports and trace files

- **Interactive Report Viewer**
  - Browse test results with screenshots and traces
  - View detailed failure information
  - Search functionality across all uploaded reports
  - Export filtered data for further analysis

### 5. Future Enhancements (Phase 2+)
- **AI Integration**
  - Natural language queries about test failures
  - Automated failure analysis and suggestions
  - Pattern recognition and predictions
  - Smart debugging recommendations

- **Advanced Features**
  - Integration with issue tracking systems
  - Automated notifications and alerts
  - Custom reporting and analytics
  - Performance trend analysis

## Core Platform Features (Phase 1)

### 1. Report Processing & Storage

#### Trace Data Extraction
```typescript
interface ProcessedTestReport {
  execution: {
    id: string;
    developer: string;
    timestamp: Date;
    branch?: string;
    environment: string;
    duration: number;
  };
  results: {
    testName: string;
    status: 'passed' | 'failed' | 'skipped';
    duration: number;
    error?: string;
    screenshots: string[];
    traceFile?: string;
  }[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
  };
}
```

#### Data Organization
- **Structured storage** in GitHub repository as JSON files
- **File management** for screenshots and trace files
- **Indexing** for fast searching and filtering
- **Version control** for historical tracking

### 2. Dashboard & Visualization

#### Report Display
```typescript
interface DashboardView {
  overview: {
    totalExecutions: number;
    recentFailures: number;
    activeTeamMembers: string[];
    trendsLast30Days: TrendData;
  };
  filters: {
    developer?: string;
    dateRange?: DateRange;
    testName?: string;
    status?: TestStatus;
  };
  reports: ProcessedTestReport[];
}
```

#### Basic Analytics
- **Pass/fail rate** calculations and trends
- **Most failing tests** identification
- **Developer activity** tracking
- **Time-based filtering** and grouping

### 3. Future AI Enhancement Layer (Phase 2+)

When ready to add AI capabilities, the platform will support:
- **Natural language queries** about test data
- **Automated failure analysis** using trace context
- **Pattern recognition** across historical data
- **Smart recommendations** for debugging

### 5. AI Integration Architecture

#### Local AI Integration Architecture
```typescript
// Primary: Local LLM via Ollama
interface LocalLLMConfig {
  provider: 'ollama';
  model: 'llama2' | 'codellama' | 'mistral' | 'deepseek-coder';
  endpoint: 'http://localhost:11434';
  maxTokens: number;
  temperature: number;
  systemPrompts: {
    failureAnalysis: string;
    codeReview: string;
    testOptimization: string;
  };
}

// Alternative: Local Transformer Models
interface LocalTransformerConfig {
  provider: 'huggingface-local';
  model: 'microsoft/DialoGPT-medium' | 'microsoft/CodeBERT-base';
  device: 'cpu' | 'gpu';
  quantization: boolean;
}

// Fallback: Rule-based NLP (no LLM required)
interface RuleBasedNLPConfig {
  provider: 'rule-based';
  useNaturalJS: boolean;
  useSentiment: boolean;
  customRules: AnalysisRule[];
}
```

#### ML Pipeline Architecture
```typescript
interface MLPipeline {
  dataCollection: {
    testResults: TestResult[];
    codeChanges: GitCommit[];
    environmentMetrics: SystemMetrics[];
  };
  featureEngineering: {
    temporalFeatures: TemporalFeature[];
    codeMetrics: CodeComplexityMetrics[];
    historicalPatterns: PatternMetrics[];
  };
  modelTraining: {
    algorithm: 'random-forest' | 'xgboost' | 'neural-network';
    hyperparameters: Record<string, any>;
    validationMetrics: ValidationMetrics;
  };
  inference: {
    realTimePredictions: boolean;
    batchProcessing: boolean;
    confidenceThreshold: number;
  };
}
```

### 6. AI-Enhanced Data Models

#### Intelligent Test Metadata
```typescript
interface AIEnhancedTestResult extends TestResult {
  aiAnalysis: {
    failurePrediction?: FailurePrediction;
    performanceInsights?: PerformanceInsights;
    qualityScore?: QualityScore;
    recommendedActions?: RecommendedAction[];
    similarity?: SimilarityAnalysis;
  };
}

interface FailurePrediction {
  probability: number;
  confidence: number;
  factors: PredictionFactor[];
  nextExecutionRisk: number;
}

interface PerformanceInsights {
  trend: 'improving' | 'degrading' | 'stable';
  anomalyScore: number;
  bottlenecks: string[];
  optimizationPotential: number;
}

interface QualityScore {
  overall: number; // 0-100
  reliability: number;
  maintainability: number;
  performance: number;
  coverage: number;
}
```

### 7. Implementation Strategy for AI Features

#### Phase 1: Basic AI (Weeks 6-8)
- Simple failure categorization using rule-based NLP
- Basic flaky test detection using statistical methods
- Performance anomaly detection using statistical analysis
- AI-generated failure summaries using OpenAI API

#### Phase 2: Predictive Models (Weeks 9-12)
- Train failure prediction models using historical data
- Implement intelligent test ordering
- Add similarity-based failure analysis
- Create personalized developer insights

#### Phase 3: Advanced AI (Weeks 13-16)
- Deploy real-time ML inference
- Implement code change impact analysis
- Add natural language query interface
- Create automated test generation suggestions

#### Phase 4: AI Optimization (Weeks 17-20)
- Fine-tune models with user feedback
- Implement federated learning across projects
- Add advanced NLP for requirements analysis
- Create AI-powered test maintenance recommendations

## Technical Architecture

### Frontend Dashboard Application
**Technology Stack:**
- **Framework:** React 18 with TypeScript
- **State Management:** Redux Toolkit + RTK Query for API state
- **UI Library:** Material-UI (MUI) for consistent design
- **Charts/Visualization:** Chart.js or D3.js for rich analytics
- **Date Handling:** date-fns for time-based analytics
- **Build Tool:** Vite for fast development and builds
- **Testing:** Jest + React Testing Library

**Deployment:**
- **Hosting:** GitHub Pages with automatic deployments
- **Domain:** Custom domain support
- **CDN:** GitHub's built-in CDN
- **SSL:** Automatic SSL certificates
- **Updates:** Automatic deployment on git push

### CLI Tool for Test Result Collection
**Technology Stack:**
- **Runtime:** Node.js CLI tool (published to npm)
- **File Parsing:** XML/JSON parsers for various test formats
- **HTTP Client:** Axios for API communication
- **File Watching:** Chokidar for automatic result detection
- **Configuration:** Cosmiconfig for flexible setup

**Features:**
- One-time setup with project configuration
- Automatic result detection and upload
- Support for multiple test result formats
- Local caching for offline scenarios
- Git integration for commit correlation

### GitHub-First Architecture

#### Primary Approach: GitHub-Native Platform
**Technology Stack:**
- **Frontend:** React SPA hosted on GitHub Pages
- **Backend:** GitHub Actions for AI processing
- **Database:** GitHub repository files (JSON/markdown)
- **AI Integration:** GitHub Actions calling external AI APIs (OpenAI, Anthropic)
- **Authentication:** GitHub OAuth + repository access
- **File Storage:** GitHub repository storage for traces
- **Version Control:** Git-based data history and backup

**GitHub Actions Pipeline:**
- **Trace Collection:** Action triggered on test failure
- **AI Processing:** Serverless functions within GitHub Actions
- **Data Storage:** Results stored as JSON files in repository
- **Web Interface:** GitHub Pages site for chat interface
- **API Layer:** GitHub Actions as serverless API endpoints

**Enterprise Security Features:**
- **Organization-Private:** All data stays within your GitHub org
- **Repository Access Control:** Use GitHub's existing permissions
- **Audit Trail:** Git history provides complete audit log
- **Encrypted Storage:** GitHub's enterprise-grade security
- **No Infrastructure:** Zero servers or services to maintain

**Benefits:**
- **Zero Infrastructure Costs** - Uses existing GitHub subscription
- **Enterprise-Ready** - Leverages GitHub's security and compliance
- **No Maintenance** - GitHub handles all infrastructure
- **Team Collaboration** - Built-in with GitHub's collaboration features
- **Version Controlled** - All data and configuration versioned
- **Scalable** - Automatically scales with GitHub Actions

#### Alternative: Hybrid GitHub + External AI
**Technology Stack:**
- **Primary:** Same GitHub-based architecture
- **AI Processing:** Can use GitHub Copilot, OpenAI, or local AI endpoints
- **Fallback Options:** Multiple AI providers for reliability
- **Cost Control:** Choose AI provider based on budget/privacy needs

**Benefits:**
- Flexibility in AI provider choice
- Can start with GitHub Copilot for simplicity
- Option to use local AI for sensitive data
- Cost optimization based on usage

## Data Models

### Playwright-Specific Entities

```typescript
interface Project {
  id: string;
  name: string;
  repository?: string;
  apiKey: string;
  playwrightConfig: PlaywrightProjectConfig;
  settings: ProjectSettings;
  createdAt: Date;
  updatedAt: Date;
}

interface PlaywrightProjectConfig {
  testDir: string;
  traceDir: string;
  browsers: ('chromium' | 'firefox' | 'webkit')[];
  devices: string[];
  baseURL?: string;
  traceRetention: 'always' | 'on-failure' | 'retain-on-failure';
}

interface PlaywrightTestRun {
  id: string;
  projectId: string;
  commitHash?: string;
  branch?: string;
  environment?: string;
  startedAt: Date;
  completedAt: Date;
  duration: number;
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  browsers: BrowserExecution[];
  traces: TraceFile[];
  metadata: PlaywrightExecutionMetadata;
}

interface PlaywrightTestResult {
  id: string;
  testRunId: string;
  testTitle: string;
  testFile: string;
  browser: string;
  device?: string;
  status: 'passed' | 'failed' | 'skipped' | 'timedOut' | 'interrupted';
  duration: number;
  retries: number;
  traceFile?: string;
  screenshots: Screenshot[];
  videos: Video[];
  errors: PlaywrightError[];
  steps: TestStep[];
}

interface TraceFile {
  id: string;
  testResultId: string;
  filePath: string;
  fileSize: number;
  extractedData: TraceData;
  aiAnalysis: TraceAIAnalysis;
  createdAt: Date;
}

interface TraceData {
  screenshots: TraceScreenshot[];
  networkRequests: NetworkRequest[];
  domSnapshots: DOMSnapshot[];
  consoleMessages: ConsoleMessage[];
  actions: PlaywrightAction[];
  performance: PerformanceMetrics;
  coverage?: CodeCoverage;
}

interface TraceScreenshot {
  id: string;
  timestamp: number;
  base64Data: string;
  width: number;
  height: number;
  actionBefore?: string;
  aiAnalysis?: ScreenshotAI;
}

interface ScreenshotAI {
  visualChanges: VisualChange[];
  uiElements: DetectedUIElement[];
  layoutShifts: LayoutShift[];
  accessibility: AccessibilityIssue[];
  regressionScore: number; // 0-100
}

interface NetworkRequest {
  id: string;
  url: string;
  method: string;
  status: number;
  duration: number;
  size: number;
  timing: NetworkTiming;
  failed: boolean;
  errorMessage?: string;
}

interface PlaywrightAction {
  id: string;
  type: 'click' | 'fill' | 'goto' | 'waitFor' | 'expect' | 'screenshot';
  selector?: string;
  value?: string;
  timestamp: number;
  duration: number;
  screenshot?: string;
  error?: PlaywrightError;
}

interface PlaywrightError {
  message: string;
  stack: string;
  location: {
    file: string;
    line: number;
    column: number;
  };
  screenshot?: string;
  domSnapshot?: string;
}

interface PlaywrightExecutionMetadata {
  playwrightVersion: string;
  nodeVersion: string;
  os: string;
  browsers: BrowserInfo[];
  devices: DeviceInfo[];
  ci?: boolean;
  ciProvider?: string;
  parallelWorkers: number;
}

interface BrowserInfo {
  name: string;
  version: string;
  channel?: string;
}

interface TraceAIAnalysis {
  failureAnalysis?: AIFailureAnalysis;
  performanceInsights?: AIPerformanceInsights;
  visualRegressions?: VisualRegression[];
  recommendations: AIRecommendation[];
  similarFailures: SimilarFailure[];
  confidence: number;
}

interface TestInsight {
  testName: string;
  projectId: string;
  flakiness: FlakinessData;
  performance: PerformanceData;
  reliability: ReliabilityData;
  lastUpdated: Date;
}

interface FlakinessData {
  score: number; // 0-100, higher = more flaky
  recentExecutions: number;
  passRate: number;
  pattern: 'intermittent' | 'environmental' | 'timing' | 'stable';
}

interface PerformanceData {
  averageDuration: number;
  medianDuration: number;
  trend: 'improving' | 'degrading' | 'stable';
  slowPercentile: number; // 95th percentile
}

interface ReliabilityData {
  passRate: number;
  consecutiveFailures: number;
  lastFailure?: Date;
  failurePattern?: string;
}
```

## Development Roadmap

### Phase 1: Core Platform (3-4 weeks)
- Create GitHub template repository
- CLI tool for uploading local test results
- Basic trace parsing and storage in GitHub repo
- GitHub Pages deployment with simple dashboard

### Phase 2: Dashboard & Analytics (2-3 weeks)
- Enhanced dashboard with filtering and search
- Basic analytics (pass/fail rates, trends)
- Report viewer with screenshots and trace details
- Team overview and developer-specific views

### Phase 3: Polish & Usability (1-2 weeks)
- Improved UI/UX for GitHub Pages dashboard
- Better CLI tool with more upload options
- Documentation and setup guides
- Template repository with examples

### Phase 4: AI Enhancement (3-4 weeks) - Optional
- OpenAI API integration for failure analysis
- Natural language query interface
- Automated insights and recommendations
- Smart debugging suggestions

## User Workflow

### 1. One-Time Setup (GitHub-Based Platform)
```bash
# Option 1: Use the GitHub Template (Recommended)
# 1. Go to github.com/yourorg/playwright-reports-platform-template
# 2. Click "Use this template" to create your team's report repo
# 3. Enable GitHub Pages in repo settings
# 4. Add your OpenAI API key to GitHub Secrets
# 5. Done! Platform is live at yourorg.github.io/playwright-reports

# Option 2: Install CLI tool for team members
npm install -g playwright-reports-cli
playwright-reports init --repo yourorg/playwright-reports
# Configures CLI to upload to your team's GitHub repo
```

### 2. Upload Local Test Results
```bash
# After running Playwright tests locally
npx playwright test --trace=on

# Upload results to team platform
playwright-reports upload
# Automatically detects test-results/ and uploads to GitHub

# Upload with context
playwright-reports upload --developer "John Doe" --branch "feature/checkout"

# Upload only failures
playwright-reports upload --failures-only

# Upload specific test run
playwright-reports upload --path ./test-results/specific-run/
```

### 3. View Team Reports (GitHub Pages Dashboard)
- Navigate to https://yourorg.github.io/playwright-reports
- See consolidated test results from all team members
- Browse test executions by developer, date, or test name
- View detailed failure information with screenshots and traces
- All data stored privately in your GitHub repository

### Example CLI Configuration
```json
{
  "name": "playwright-reports-platform",
  "repository": "yourorg/playwright-reports",
  "github": {
    "pages": {
      "url": "https://yourorg.github.io/playwright-reports",
      "source": "gh-pages"
    },
    "secrets": {
      "OPENAI_API_KEY": "sk-...",
      "GITHUB_TOKEN": "ghp_..."
    }
  },
  "localConfig": {
    "developer": "auto-detect", // Uses git config
    "uploadPath": "./test-results",
    "includeSuccessful": false,
    "includeFailures": true,
    "autoUpload": false
  },
  "playwright": {
    "testDir": "./tests",
    "traceDir": "./test-results",
    "tracePaths": [
      "test-results/**/trace.zip",
      "test-results/**/*.png",
      "test-results/**/*.webm"
    ],
    "browsers": ["chromium", "firefox", "webkit"],
    "devices": ["Desktop Chrome", "iPhone 13", "iPad"],
    "collectTraces": "retain-on-failure",
    "collectScreenshots": "only-on-failure",
    "collectVideos": "retain-on-failure"
  },
  "analytics": {
    "enabled": true,
    "features": {
      "basicStats": true,
      "trendAnalysis": true,
      "failurePatterns": true,
      "teamInsights": true
    }
  },
  "future": {
    "ai": {
      "enabled": false,
      "provider": "openai", // For Phase 4
      "features": {
        "traceAnalysis": false,
        "chatInterface": false,
        "debuggingHelp": false,
        "testExplanation": false
      }
    }
  },
  "notifications": {
    "internal": {
      "slack": {
        "webhook": "http://your-internal-slack/webhook",
        "channel": "#dev-alerts"
      },
      "email": {
        "smtp": "internal-smtp.company.com",
        "recipients": ["team@company.com"]
      }
    },
    "aiSummaries": true,
    "personalizedAlerts": true
  },
  "thresholds": {
    "passRate": 95,
    "flakinessScore": 20,
    "maxDuration": 300,
    "aiConfidence": 0.8,
    "predictionThreshold": 0.7
  },
  "codeIntegration": {
    "repository": "git@internal-git.company.com:team/project.git",
    "codeAnalysis": true,
    "impactAssessment": true,
    "privateRepo": true
  },
  "security": {
    "dataEncryption": true,
    "auditLogging": true,
    "accessControl": "rbac",
    "networkIsolation": true
  }
}
```

## Implementation Strategy

### 1. Setup and Foundation (Playwright Focus)
```bash
# Frontend setup with Playwright trace viewer
npx create-react-app playwright-insights-frontend --template typescript
cd playwright-insights-frontend
npm install @mui/material @emotion/react @emotion/styled
npm install @reduxjs/toolkit react-redux
npm install chart.js react-chartjs-2 date-fns
npm install fabric pixelmatch looks-same  # For image comparison
npm install @playwright/test  # For trace file parsing
npm install @types/react @types/react-dom

# CLI tool setup for Playwright traces
mkdir playwright-insights-cli
cd playwright-insights-cli
npm init -y
npm install commander chokidar axios
npm install @playwright/test  # For trace parsing
npm install adm-zip sharp  # For trace extraction and image processing
npm install typescript ts-node @types/node

# Backend setup with Playwright trace processing
mkdir playwright-insights-backend
cd playwright-insights-backend
npm init -y
npm install express cors helmet morgan
npm install prisma @prisma/client
npm install @playwright/test adm-zip
npm install sharp jimp pixelmatch  # Image processing for visual diffs
npm install sqlite3 better-sqlite3  # Local database
npm install typescript ts-node @types/node @types/express
```

### 2. Playwright Trace Processing Setup
```bash
# Install Playwright trace analysis dependencies
npm install @playwright/test
npm install adm-zip yauzl  # For trace.zip extraction
npm install sharp jimp canvas  # Image processing and comparison
npm install pixelmatch looks-same  # Visual diff algorithms
npm install sqlite-vss  # Vector similarity search for screenshots

# AI integration for trace analysis
npm install ollama  # Local LLM integration
npm install @huggingface/inference  # For computer vision models
npm install opencv4nodejs  # Advanced image processing (optional)
npm install tesseract.js  # OCR for screenshot text extraction

# Python dependencies for advanced ML (optional)
pip install opencv-python pillow numpy
pip install scikit-image matplotlib seaborn
pip install sentence-transformers  # For semantic analysis
pip install ultralytics  # YOLO for UI element detection
```

### 2. Database Schema
```sql
-- Core tables for PostgreSQL
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE test_suites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES test_suites(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Additional tables for test_cases, test_runs, test_results, etc.
```

### 3. API Design
```typescript
// REST API endpoints
GET    /api/projects
POST   /api/projects
GET    /api/projects/:id
PUT    /api/projects/:id
DELETE /api/projects/:id

GET    /api/projects/:projectId/suites
POST   /api/projects/:projectId/suites
GET    /api/suites/:id
PUT    /api/suites/:id
DELETE /api/suites/:id

GET    /api/suites/:suiteId/cases
POST   /api/suites/:suiteId/cases
GET    /api/cases/:id
PUT    /api/cases/:id
DELETE /api/cases/:id

GET    /api/projects/:projectId/runs
POST   /api/projects/:projectId/runs
GET    /api/runs/:id
PUT    /api/runs/:id
DELETE /api/runs/:id
```

## GitHub-First Deployment Configuration

### GitHub Template Repository Setup
```yaml
# .github/workflows/deploy-pages.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
        
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        working-directory: ./frontend
        
      - name: Build React app
        run: npm run build
        working-directory: ./frontend
        env:
          REACT_APP_GITHUB_REPO: ${{ github.repository }}
          REACT_APP_GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          
      - name: Setup Pages
        uses: actions/configure-pages@v3
        
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v2
        with:
          path: './frontend/build'
          
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v2
```

### Quick Start Script
```bash
#!/bin/bash
# setup.sh - GitHub-based setup

echo "🚀 Setting up Playwright AI Debugger on GitHub..."

# Check if we're in a git repository
if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
    echo "❌ Not in a git repository. Please run this in your project repo."
    exit 1
fi

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI not found. Please install gh CLI first."
    echo "Visit: https://cli.github.com/"
    exit 1
fi

# Copy GitHub Action workflow
echo "📁 Setting up GitHub Actions workflow..."
mkdir -p .github/workflows
curl -s https://raw.githubusercontent.com/playwright-ai-debugger/template/main/.github/workflows/ai-debugger.yml \
  > .github/workflows/playwright-ai-debugger.yml

# Enable GitHub Pages
echo "🌐 Enabling GitHub Pages..."
gh api repos/:owner/:repo/pages \
  --method POST \
  --field source='{"branch":"gh-pages","path":"/"}'

# Set up secrets
echo "🔐 Setting up GitHub Secrets..."
echo "Please add your OpenAI API key:"
read -s openai_key
gh secret set OPENAI_API_KEY --body "$openai_key"

# Commit and push
echo "💾 Committing changes..."
git add .github/workflows/playwright-ai-debugger.yml
git commit -m "Add Playwright AI Debugger workflow"
git push

echo "🎉 Playwright AI Debugger is ready!"
echo "🌐 Dashboard will be available at: https://$(git config remote.origin.url | sed 's/.*github.com[/:]\([^/]*\)\/\([^.]*\).*/\1.github.io\/\2/')/"
echo "🔧 GitHub Actions will process traces automatically on test failures"
```

### Enterprise Security Configuration
```yaml
# security.yml - Additional security measures
version: '3.8'
services:
  # Reverse Proxy with SSL
  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - api
      - dashboard

  # VPN Access (Optional)
  wireguard:
    image: linuxserver/wireguard
    ports:
      - "51820:51820/udp"
    volumes:
      - ./wireguard:/config
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=UTC
    cap_add:
      - NET_ADMIN
      - SYS_MODULE

  # Backup Service
  backup:
    build: ./backup
    volumes:
      - ./data:/source/data
      - ./backup-destination:/backup
    environment:
      - BACKUP_SCHEDULE=0 1 * * * # Daily at 1 AM
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}
    depends_on:
      - api
```

### Internal Network Configuration
```bash
# For companies wanting internal network access
# nginx.conf example for internal domain

server {
    listen 80;
    server_name test-insights.company.internal;
    
    location / {
        proxy_pass http://dashboard:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /api {
        proxy_pass http://api:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Security Considerations

### Frontend Security
- Implement Content Security Policy (CSP)
- Sanitize user inputs
- Secure authentication token storage
- HTTPS enforcement
- XSS protection

### Backend Security
- Input validation and sanitization
- SQL injection prevention
- Rate limiting
- Authentication and authorization
- Secure file upload handling
- API security best practices

## Performance Optimization

### Frontend Optimization
- Code splitting with React.lazy()
- Virtual scrolling for large lists
- Image optimization and lazy loading
- Service worker for caching
- Bundle analysis and optimization

### Backend Optimization
- Database indexing strategy
- Query optimization
- Caching layer (Redis)
- Connection pooling
- API response compression

## Testing Strategy

### Frontend Testing
- Unit tests with Jest
- Component tests with React Testing Library
- E2E tests with Cypress
- Visual regression tests
- Performance testing

### Backend Testing
- Unit tests with Jest
- Integration tests with Supertest
- Database tests with test containers
- Load testing with Artillery
- Security testing

## Documentation Plan

### User Documentation
- Getting started guide
- Feature documentation
- API documentation
- Integration guides
- Best practices

### Developer Documentation
- Setup instructions
- Architecture overview
- Contributing guidelines
- API reference
- Deployment guides

## Success Metrics

### User Metrics
- Daily/Monthly active users
- Test case creation rate
- Test execution frequency
- User retention rate
- Feature adoption rate

### Technical Metrics
- Application performance
- API response times
- Error rates
- Uptime/availability
- Security incident tracking

## Risk Assessment

### Technical Risks
- **Data Loss:** Mitigated by backup strategies and data validation
- **Performance Issues:** Addressed through optimization and monitoring
- **Security Vulnerabilities:** Prevented through security best practices
- **Scalability Challenges:** Planned architecture supports growth

### Business Risks
- **User Adoption:** Mitigated through user-centered design
- **Competition:** Differentiated through local execution focus
- **Maintenance Overhead:** Minimized through good architecture choices

## Next Steps

1. **Validate Requirements:** Gather detailed user requirements and feedback
2. **Technology Selection:** Finalize technology stack based on requirements
3. **Prototype Development:** Create minimal viable prototype
4. **User Testing:** Test prototype with target users
5. **Iterative Development:** Build and refine based on feedback

---

*This project context document will be updated as the project evolves and requirements are refined.* 