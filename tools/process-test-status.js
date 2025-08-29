#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Process test results from JSON reports instead of raw trace files
// This is more practical for integration with existing test setups

function generateReportId() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const hash = crypto.randomBytes(4).toString('hex');
  return `${timestamp}-${hash}`;
}

function generateInsights(testStatus) {
  const hasFailed = testStatus.failedTests && testStatus.failedTests.length > 0;
  const purpose = hasFailed ? 'debugging' : 'validation';
  
  return {
    intent: {
      purpose,
      description: hasFailed ? 'Investigating test failures' : 'Validating functionality',
      expectFailures: hasFailed,
      targetTests: ['authentication', 'core-functionality'],
      goals: hasFailed ? ['fix-failures', 'investigate-issues'] : ['verify-stability'],
      context: 'Local development testing'
    },
    insights: {
      reasoning: `Running ${purpose} tests based on recent changes`,
      expectedBehavior: 'All critical tests should pass',
      actualBehavior: hasFailed ? 'Some tests failed, investigation needed' : 'All tests passed as expected',
      surprises: hasFailed ? ['Unexpected failures in core functionality'] : ['All tests passed smoothly'],
      learnings: hasFailed ? ['Need to investigate failing tests'] : ['System is stable'],
      nextSteps: hasFailed ? ['Debug failing tests', 'Check recent changes'] : ['Continue development'],
      confidence: hasFailed ? 5 : 9
    },
    metadata: {
      gitCommit: crypto.randomBytes(4).toString('hex'),
      gitDiff: 'Recent changes',
      codeChanges: ['src/components/', 'tests/'],
      relatedTickets: ['DEV-' + Math.floor(Math.random() * 1000)],
      testRunReason: 'local-development',
      tags: [purpose, 'local', 'automated']
    }
  };
}

function createMockTestResults(testStatus) {
  const baseTests = [
    'Authentication › Login flow',
    'Core › Main functionality', 
    'UI › Component rendering',
    'API › Data fetching',
    'Navigation › Page routing'
  ];
  
  const results = [];
  const failedTests = testStatus.failedTests || [];
  
  baseTests.forEach((testName, index) => {
    const isFailure = index < failedTests.length;
    
    results.push({
      testName,
      status: isFailure ? 'failed' : 'passed',
      duration: Math.floor(Math.random() * 3000) + 500,
      screenshots: isFailure ? [`failure-${index}.png`] : [],
      expectedOutcome: 'pass',
      actualOutcome: isFailure ? 'fail' : 'pass',
      outcomeMatch: !isFailure,
      error: isFailure ? 'Test assertion failed' : undefined
    });
  });
  
  return results;
}

function createReport(reportId, testStatus) {
  const now = new Date();
  const insights = generateInsights(testStatus);
  const results = createMockTestResults(testStatus);
  
  const summary = {
    total: results.length,
    passed: results.filter(r => r.status === 'passed').length,
    failed: results.filter(r => r.status === 'failed').length,
    skipped: 0
  };
  
  summary.expectedFails = 0;
  summary.unexpectedFails = summary.failed;
  summary.expectedPasses = summary.passed;
  summary.unexpectedPasses = 0;
  
  return {
    execution: {
      id: reportId,
      reportNumber: Math.floor(Math.random() * 100) + 1,
      uniqueId: reportId,
      developer: process.env.USER || 'Developer',
      timestamp: now.toISOString(),
      startTime: new Date(now.getTime() - 2 * 60 * 1000).toISOString(),
      endTime: now.toISOString(),
      branch: 'main',
      environment: 'local',
      duration: results.reduce((sum, r) => sum + r.duration, 0),
      ...insights
    },
    results,
    summary
  };
}

function setupOutputDirectory() {
  const outputDir = path.join(__dirname, '..', 'frontend', 'public', 'mock-data', 'reports');
  fs.mkdirSync(outputDir, { recursive: true });
  return outputDir;
}

function processTestStatus() {
  console.log('🚀 Processing test status...');
  
  // Look for test status files
  const statusFile = path.join(__dirname, '..', 'data', '.last-run.json');
  const resultsFile = path.join(__dirname, '..', 'data', 'results.json');
  
  let testStatus = { status: 'passed', failedTests: [] };
  
  // Try to read existing status
  if (fs.existsSync(statusFile)) {
    try {
      testStatus = JSON.parse(fs.readFileSync(statusFile, 'utf8'));
      console.log(`📊 Read test status: ${testStatus.status}`);
    } catch (error) {
      console.log('⚠️  Using default test status');
    }
  }
  
  // Try to read Playwright JSON results if available
  if (fs.existsSync(resultsFile)) {
    try {
      const results = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
      console.log(`📊 Found Playwright results with ${results.suites?.length || 0} suites`);
      // You could extract more detailed info from Playwright results here
    } catch (error) {
      console.log('⚠️  Could not parse results.json');
    }
  }
  
  const outputDir = setupOutputDirectory();
  const reportId = generateReportId();
  const report = createReport(reportId, testStatus);
  
  // Create report directory
  const reportDir = path.join(outputDir, reportId);
  fs.mkdirSync(reportDir, { recursive: true });
  
  // Write report file
  fs.writeFileSync(
    path.join(reportDir, 'report.json'),
    JSON.stringify(report, null, 2)
  );
  
  // Update index.json
  const indexPath = path.join(outputDir, '..', 'index.json');
  let index = { version: '1.0.0', lastUpdated: new Date().toISOString(), reports: [] };
  
  if (fs.existsSync(indexPath)) {
    try {
      index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    } catch (error) {
      console.log('⚠️  Creating new index file');
    }
  }
  
  // Add new report to front of list
  index.reports.unshift({
    id: reportId,
    timestamp: report.execution.timestamp,
    developer: report.execution.developer,
    branch: report.execution.branch,
    summary: report.summary,
    url: `reports/${reportId}/report.json`
  });
  
  // Keep only last 10 reports
  index.reports = index.reports.slice(0, 10);
  index.lastUpdated = new Date().toISOString();
  
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
  
  console.log('');
  console.log(`✅ Created report: ${reportId}`);
  console.log(`📊 Status: ${testStatus.status}`);
  console.log(`🔗 View dashboard: http://localhost:3000`);
  
  return reportId;
}

if (require.main === module) {
  try {
    processTestStatus();
    console.log('');
    console.log('🎉 Dashboard updated with your test status!');
  } catch (error) {
    console.error('❌ Error processing test status:', error);
    process.exit(1);
  }
}

module.exports = { processTestStatus }; 