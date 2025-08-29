#!/bin/bash

# Playwright Trace Intelligence Platform - Startup Script
# This script starts the complete dashboard system

echo "🚀 Starting Playwright Trace Intelligence Platform..."
echo "=================================================="

# Navigate to platform directory
PLATFORM_DIR="/Users/bky13/Desktop/local_dashboard_platform"
cd "$PLATFORM_DIR"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in platform directory"
    echo "📁 Expected: $PLATFORM_DIR"
    exit 1
fi

echo "📁 Platform directory: $PLATFORM_DIR"

# Check if frontend dependencies are installed
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend && npm install
    cd ..
fi

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Check if dashboard is already running
if check_port 3000; then
    echo "✅ Dashboard already running at http://localhost:3000"
    echo "🔄 To restart, kill existing process first:"
    echo "   lsof -ti:3000 | xargs kill -9"
    echo ""
else
    echo "🚀 Starting dashboard..."
    
    # Start the frontend server in background
    cd frontend
    npm start &
    FRONTEND_PID=$!
    
    echo "⏳ Waiting for dashboard to start..."
    
    # Wait for the server to start (max 30 seconds)
    for i in {1..30}; do
        if check_port 3000; then
            echo "✅ Dashboard started successfully!"
            break
        fi
        sleep 1
        echo -n "."
    done
    
    if ! check_port 3000; then
        echo "❌ Dashboard failed to start"
        exit 1
    fi
fi

echo ""
echo "🎉 Platform Ready!"
echo "=================="
echo "📊 Dashboard: http://localhost:3000"
echo "🌐 Network:   http://10.126.42.198:3000"
echo ""
echo "💡 Usage:"
echo "   • View test reports in your browser"
echo "   • Update with: node tools/process-test-status.js"
echo "   • Stop with: Ctrl+C or kill the process"
echo ""
echo "🔧 Integration:"
echo "   • Add to your test project:"
echo "     npm test && cd $PLATFORM_DIR && node tools/process-test-status.js"
echo ""
echo "✨ Happy testing!" 